package cl.tienda.sonidoVivo.Api.pedido;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import cl.tienda.sonidoVivo.Api.pedido.dto.ItemPedidoRequest;
import cl.tienda.sonidoVivo.Api.pedido.dto.PedidoRequest;
import cl.tienda.sonidoVivo.Api.pedido.dto.PedidoResponse;
import cl.tienda.sonidoVivo.Api.pedido.model.TipoEntrega;
import cl.tienda.sonidoVivo.Api.pedido.service.PedidoService;
import cl.tienda.sonidoVivo.Api.producto.dto.ProductoRequest;
import cl.tienda.sonidoVivo.Api.producto.model.Categoria;
import cl.tienda.sonidoVivo.Api.producto.repository.CategoriaRepository;
import cl.tienda.sonidoVivo.Api.producto.service.ProductoService;
import cl.tienda.sonidoVivo.Api.usuario.model.Rol;
import cl.tienda.sonidoVivo.Api.usuario.model.Usuario;
import cl.tienda.sonidoVivo.Api.usuario.repository.RolRepository;
import cl.tienda.sonidoVivo.Api.usuario.repository.UsuarioRepository;

@SpringBootTest(properties = "spring.profiles.active=test")
@AutoConfigureMockMvc
@Transactional
class PedidoSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProductoService productoService;

    @Autowired
    private PedidoService pedidoService;

    private Long idPedidoCliente1;
    private Long idPedidoCliente2;

    @BeforeEach
    void prepararEscenario() {
        Rol rolCliente = rolRepository.findByNombre("CLIENTE").orElseGet(() -> {
            Rol r = new Rol();
            r.setNombre("CLIENTE");
            return rolRepository.save(r);
        });

        Usuario cliente1 = crearUsuario("Cliente Uno", "cliente@sonidovivo.cl", rolCliente);
        Usuario cliente2 = crearUsuario("Cliente Dos", "otro@sonidovivo.cl", rolCliente);

        Categoria categoria = new Categoria();
        categoria.setNombre("Categoria Seguridad Pedidos");
        Long categoriaId = categoriaRepository.save(categoria).getId();

        productoService.crearProducto(new ProductoRequest(
                "SP001", "Guitarra Seguridad", "Yamaha", "F310",
                "Desc", 100000, 10, "/imagen/productos/SP001.jpg", categoriaId));

        PedidoResponse p1 = pedidoService.crearPedido(
                new PedidoRequest(TipoEntrega.RETIRO, null, "911111111",
                        List.of(new ItemPedidoRequest("SP001", 1))),
                cliente1.getId());

        PedidoResponse p2 = pedidoService.crearPedido(
                new PedidoRequest(TipoEntrega.RETIRO, null, "922222222",
                        List.of(new ItemPedidoRequest("SP001", 1))),
                cliente2.getId());

        idPedidoCliente1 = p1.id();
        idPedidoCliente2 = p2.id();
    }

    private Usuario crearUsuario(String nombre, String correo, Rol rol) {
        return usuarioRepository.findByCorreo(correo).orElseGet(() -> {
            Usuario u = new Usuario();
            u.setNombreCompleto(nombre);
            u.setCorreo(correo);
            u.setPasswordHash("hash_test");
            u.setActivo(true);
            u.setRol(rol);
            return usuarioRepository.save(u);
        });
    }

    // ---------------------------------------------------------
    // AUTENTICACIÓN (401)
    // ---------------------------------------------------------

    @Test
    void usuarioSinAutenticarRecibe401EnRutasDePedidos() throws Exception {
        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/pedidos/mis-pedidos"))
                .andExpect(status().isUnauthorized());
    }

    // ---------------------------------------------------------
    // PERMISOS Y PROPIEDAD DEL CLIENTE
    // ---------------------------------------------------------

    @Test
    @WithMockUser(username = "cliente@sonidovivo.cl", roles = "CLIENTE")
    void clientePuedeVerSoloSusPropiosPedidosYDetalle() throws Exception {
        // Historial propio: devuelve solo su pedido
        mockMvc.perform(get("/api/pedidos/mis-pedidos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(idPedidoCliente1));

        // Detalle de su propio pedido -> 200 OK
        mockMvc.perform(get("/api/pedidos/" + idPedidoCliente1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(idPedidoCliente1));

        // Detalle de un pedido ajeno -> 404 Not Found
        mockMvc.perform(get("/api/pedidos/" + idPedidoCliente2))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "cliente@sonidovivo.cl", roles = "CLIENTE")
    void clienteNoPuedeListarTodosNiCambiarEstado() throws Exception {
        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isForbidden());

        mockMvc.perform(patch("/api/pedidos/" + idPedidoCliente1 + "/estado")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "estado": "DESPACHADO" }
                        """))
                .andExpect(status().isForbidden());
    }

    // ---------------------------------------------------------
    // PERMISOS DEL VENDEDOR Y ADMINISTRADOR
    // ---------------------------------------------------------

    @Test
    @WithMockUser(username = "vendedor@sonidovivo.cl", roles = "VENDEDOR")
    void vendedorPuedeListarYVerDetallesPeroNoCrearNiVerMisPedidos() throws Exception {
        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/pedidos/" + idPedidoCliente2))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/pedidos/mis-pedidos"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/pedidos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "tipoEntrega": "RETIRO",
                            "direccion": null,
                            "telefonoContacto": "912345678",
                            "items": [{ "codigoProducto": "SP001", "cantidad": 1 }]
                        }
                        """))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@sonidovivo.cl", roles = "ADMIN")
    void administradorPuedeListarYActualizarEstado() throws Exception {
        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isOk());

        mockMvc.perform(patch("/api/pedidos/" + idPedidoCliente1 + "/estado")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "estado": "ENTREGADO" }
                        """))
                .andExpect(status().isOk());
    }
}