package cl.tienda.sonidoVivo.Api.producto;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import cl.tienda.sonidoVivo.Api.producto.dto.ProductoRequest;
import cl.tienda.sonidoVivo.Api.producto.model.Categoria;
import cl.tienda.sonidoVivo.Api.producto.repository.CategoriaRepository;
import cl.tienda.sonidoVivo.Api.producto.service.ProductoService;

@SpringBootTest(properties = "spring.profiles.active=test")
@AutoConfigureMockMvc
@Transactional
class ProductoSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProductoService productoService;

    private Long categoriaId;

    @BeforeEach
    void prepararDatos() {
        Categoria categoria = new Categoria();
        categoria.setNombre("Categoria Seguridad Test");
        categoriaId = categoriaRepository.save(categoria).getId();

        productoService.crearProducto(new ProductoRequest(
                "ST001",
                "Producto Seguridad",
                "Yamaha",
                "M1",
                "Desc",
                50000,
                5,
                "/imagen/productos/ST001.jpg",
                categoriaId));
    }

    @Test
    void catalogoEsPublicoSinAutenticacion() throws Exception {
        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/productos/ST001"))
                .andExpect(status().isOk());
    }

    @Test
    void usuarioSinAutenticarRecibe401AlCrearOEditar() throws Exception {
        mockMvc.perform(post("/api/productos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(patch("/api/productos/ST001/stock")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "stock": 10 }
                        """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "cliente@sonidovivo.cl", roles = "CLIENTE")
    void clienteNoPuedeModificarProductosNiStock() throws Exception {
        mockMvc.perform(patch("/api/productos/ST001/stock")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "stock": 10 }
                        """))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/productos/ST001"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "vendedor@sonidovivo.cl", roles = "VENDEDOR")
    void vendedorPuedeActualizarStockPeroNoEditarProductoCompleto() throws Exception {
        mockMvc.perform(patch("/api/productos/ST001/stock")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        { "stock": 9 }
                        """))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/productos/ST001")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "codigo": "ST001",
                            "nombre": "Precio Hackeado",
                            "marca": "Yamaha",
                            "modelo": "M1",
                            "descripcion": "Desc",
                            "precio": 1,
                            "stock": 9,
                            "imagen": "/imagen/productos/ST001.jpg",
                            "categoriaId": %d
                        }
                        """.formatted(categoriaId)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@sonidovivo.cl", roles = "ADMIN")
    void adminPuedeCrearEditarYDesactivarProductos() throws Exception {
        mockMvc.perform(post("/api/productos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "codigo": "ST002",
                            "nombre": "Nuevo Admin",
                            "marca": "Fender",
                            "modelo": "X1",
                            "descripcion": "Desc",
                            "precio": 120000,
                            "stock": 3,
                            "imagen": "/imagen/productos/ST002.jpg",
                            "categoriaId": %d
                        }
                        """.formatted(categoriaId)))
                .andExpect(status().isCreated());

        mockMvc.perform(delete("/api/productos/ST002"))
                .andExpect(status().isOk());
    }
}