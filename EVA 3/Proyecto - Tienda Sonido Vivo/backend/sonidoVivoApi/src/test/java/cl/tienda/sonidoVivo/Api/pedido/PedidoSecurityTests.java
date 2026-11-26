
package cl.tienda.sonidoVivo.Api.pedido;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "spring.profiles.active=test")
@AutoConfigureMockMvc
class PedidoSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    // ---------------------------------------------------------
    // AUTENTICACIÓN
    // ---------------------------------------------------------

    @Test
    void usuarioSinAutenticarNoPuedeListarPedidos() throws Exception {

        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isUnauthorized());
    }

    // ---------------------------------------------------------
    // PERMISOS DEL CLIENTE
    // ---------------------------------------------------------

    @Test
    @WithMockUser(username = "cliente@sonidovivo.cl", roles = "CLIENTE")
    void clienteNoPuedeListarTodosLosPedidos() throws Exception {

        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "cliente@sonidovivo.cl", roles = "CLIENTE")
    void clienteNoPuedeCambiarEstadoDeUnPedido() throws Exception {

        mockMvc.perform(patch("/api/pedidos/1/estado")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "estado": "DESPACHADO"
                        }
                        """))
                .andExpect(status().isForbidden());
    }

    // ---------------------------------------------------------
    // PERMISOS DEL VENDEDOR
    // ---------------------------------------------------------

    @Test
    @WithMockUser(username = "vendedor@sonidovivo.cl", roles = "VENDEDOR")
    void vendedorPuedeListarPedidos() throws Exception {

        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "vendedor@sonidovivo.cl", roles = "VENDEDOR")
    void vendedorNoPuedeRegistrarPedidos() throws Exception {

        mockMvc.perform(post("/api/pedidos")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "tipoEntrega": "RETIRO",
                            "direccion": null,
                            "telefonoContacto": "912345678",
                            "items": [
                                {
                                    "codigoProducto": "TP001",
                                    "cantidad": 1
                                }
                            ]
                        }
                        """))
                .andExpect(status().isForbidden());
    }

    // ---------------------------------------------------------
    // PERMISOS DEL ADMINISTRADOR
    // ---------------------------------------------------------

    @Test
    @WithMockUser(username = "admin@sonidovivo.cl", roles = "ADMIN")
    void administradorPuedeListarPedidos() throws Exception {

        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin@sonidovivo.cl", roles = "ADMIN")
    void administradorPuedeAccederAlCambioDeEstado() throws Exception {

        // El pedido 999999 no existe.
        // Un 404 demuestra que pasó la autorización y llegó al servicio.
        mockMvc.perform(patch("/api/pedidos/999999/estado")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                            "estado": "DESPACHADO"
                        }
                        """))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "vendedor@sonidovivo.cl", roles = "VENDEDOR")
    void vendedorPuedeConsultarDetalleDePedido() throws Exception {

        // El pedido no existe: 404 confirma que superó la autorización.
        mockMvc.perform(get("/api/pedidos/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "admin@sonidovivo.cl", roles = "ADMIN")
    void administradorPuedeConsultarDetalleDePedido() throws Exception {

        // El pedido no existe: 404 confirma que superó la autorización.
        mockMvc.perform(get("/api/pedidos/999999"))
                .andExpect(status().isNotFound());
    }

}
