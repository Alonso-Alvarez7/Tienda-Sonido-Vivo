package cl.tienda.sonidoVivo.Api.pedido;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import cl.tienda.sonidoVivo.Api.pedido.dto.ItemPedidoRequest;
import cl.tienda.sonidoVivo.Api.pedido.dto.PedidoRequest;
import cl.tienda.sonidoVivo.Api.pedido.dto.PedidoResponse;
import cl.tienda.sonidoVivo.Api.pedido.model.EstadoPedido;
import cl.tienda.sonidoVivo.Api.pedido.model.TipoEntrega;
import cl.tienda.sonidoVivo.Api.pedido.service.PedidoService;
import cl.tienda.sonidoVivo.Api.producto.dto.ProductoRequest;
import cl.tienda.sonidoVivo.Api.producto.model.Categoria;
import cl.tienda.sonidoVivo.Api.producto.repository.CategoriaRepository;
import cl.tienda.sonidoVivo.Api.producto.service.ProductoService;

@SpringBootTest(properties = "spring.profiles.active=test")
@Transactional
class PedidoServiceTests {

        @Autowired
        private PedidoService pedidoService;

        @Autowired
        private ProductoService productoService;

        @Autowired
        private CategoriaRepository categoriaRepository;

        @BeforeEach
        void prepararCatalogo() {

                Categoria categoria = new Categoria();
                categoria.setNombre("Categoria Pedidos Test");

                Long categoriaId = categoriaRepository.save(categoria).getId();

                productoService.crearProducto(new ProductoRequest(
                                "TP001",
                                "Guitarra Test",
                                "Yamaha",
                                "F310",
                                "Descripción",
                                100000,
                                5,
                                "/imagen/productos/TP001.jpg",
                                categoriaId));

                productoService.crearProducto(new ProductoRequest(
                                "TP002",
                                "Cable Test",
                                "Monster",
                                "S100",
                                "Descripción",
                                15000,
                                2,
                                "/imagen/productos/TP002.jpg",
                                categoriaId));
        }

        @Test
        void creaPedidoDescuentaStockYAsignaCodigo() {

                PedidoRequest request = new PedidoRequest(
                                TipoEntrega.RETIRO,
                                null,
                                "912345678",
                                List.of(
                                                new ItemPedidoRequest("TP001", 2),
                                                new ItemPedidoRequest("TP002", 1)));

                PedidoResponse creado = pedidoService.crearPedido(request, 3L);

                assertNotNull(creado.id());

                assertEquals(
                                String.format("PED-%04d", creado.id()),
                                creado.codigo());

                assertEquals("En preparación", creado.estado());
                assertEquals("retiro", creado.entrega());
                assertEquals(215000, creado.total());
                assertEquals(2, creado.items().size());

                assertEquals(
                                3,
                                productoService.obtenerProducto("TP001").stock());

                assertEquals(
                                1,
                                productoService.obtenerProducto("TP002").stock());
        }

        @Test
        void rechazaPedidoSiNoHayStockSuficiente() {

                PedidoRequest request = new PedidoRequest(
                                TipoEntrega.RETIRO,
                                null,
                                "912345678",
                                List.of(
                                                new ItemPedidoRequest("TP002", 5)));

                ResponseStatusException error = assertThrows(
                                ResponseStatusException.class,
                                () -> pedidoService.crearPedido(request, 3L));

                assertEquals(409, error.getStatusCode().value());

                assertEquals(
                                2,
                                productoService.obtenerProducto("TP002").stock());
        }

        @Test
        void exigeDireccionCuandoElTipoDeEntregaEsDespacho() {

                PedidoRequest request = new PedidoRequest(
                                TipoEntrega.DESPACHO,
                                "   ",
                                "912345678",
                                List.of(
                                                new ItemPedidoRequest("TP001", 1)));

                ResponseStatusException error = assertThrows(
                                ResponseStatusException.class,
                                () -> pedidoService.crearPedido(request, 3L));

                assertEquals(400, error.getStatusCode().value());
        }

        @Test
        void actualizaEstadoYFiltraPedidosPorClienteYEstado() {

                PedidoResponse creado = pedidoService.crearPedido(
                                new PedidoRequest(
                                                TipoEntrega.DESPACHO,
                                                "Av. Libertad 1234",
                                                "987654321",
                                                List.of(
                                                                new ItemPedidoRequest("TP001", 1))),
                                7L);

                assertEquals(1, pedidoService.listarPorCliente(7L).size());

                assertEquals(
                                1,
                                pedidoService.listarTodos(
                                                EstadoPedido.EN_PREPARACION).size());

                PedidoResponse despachado = pedidoService.actualizarEstado(
                                creado.id(),
                                EstadoPedido.DESPACHADO);

                assertEquals("Despachado", despachado.estado());

                PedidoResponse entregado = pedidoService.actualizarEstado(
                                creado.id(),
                                EstadoPedido.ENTREGADO);

                assertEquals("Entregado", entregado.estado());

                assertEquals(
                                0,
                                pedidoService.listarTodos(
                                                EstadoPedido.EN_PREPARACION).size());

                assertEquals(
                                1,
                                pedidoService.listarTodos(
                                                EstadoPedido.ENTREGADO).size());
        }

        @Test
        void noPermiteDespacharUnPedidoDeRetiro() {

                PedidoResponse creado = pedidoService.crearPedido(
                                new PedidoRequest(
                                                TipoEntrega.RETIRO,
                                                null,
                                                "912345678",
                                                List.of(
                                                                new ItemPedidoRequest("TP001", 1))),
                                3L);

                ResponseStatusException error = assertThrows(
                                ResponseStatusException.class,
                                () -> pedidoService.actualizarEstado(
                                                creado.id(),
                                                EstadoPedido.DESPACHADO));

                assertEquals(409, error.getStatusCode().value());
        }

        @Test
        void noPermiteRetrocederUnPedidoDespachado() {

                PedidoResponse creado = pedidoService.crearPedido(
                                new PedidoRequest(
                                                TipoEntrega.DESPACHO,
                                                "Av. Libertad 1234",
                                                "987654321",
                                                List.of(
                                                                new ItemPedidoRequest("TP001", 1))),
                                3L);

                pedidoService.actualizarEstado(
                                creado.id(),
                                EstadoPedido.DESPACHADO);

                ResponseStatusException error = assertThrows(
                                ResponseStatusException.class,
                                () -> pedidoService.actualizarEstado(
                                                creado.id(),
                                                EstadoPedido.EN_PREPARACION));

                assertEquals(409, error.getStatusCode().value());
        }

        @Test
        void noPermiteCrearPedidoSinUsuarioIdentificado() {

                PedidoRequest request = new PedidoRequest(
                                TipoEntrega.RETIRO,
                                null,
                                "912345678",
                                List.of(
                                                new ItemPedidoRequest("TP001", 1)));

                ResponseStatusException error = assertThrows(
                                ResponseStatusException.class,
                                () -> pedidoService.crearPedido(request, null));

                assertEquals(401, error.getStatusCode().value());
        }

        @Test
        void clienteSoloPuedeConsultarSusPropiosPedidos() {

                PedidoResponse pedidoCliente1 = pedidoService.crearPedido(
                                new PedidoRequest(
                                                TipoEntrega.RETIRO,
                                                null,
                                                "912345678",
                                                List.of(new ItemPedidoRequest("TP001", 1))),
                                101L);

                PedidoResponse pedidoCliente2 = pedidoService.crearPedido(
                                new PedidoRequest(
                                                TipoEntrega.RETIRO,
                                                null,
                                                "987654321",
                                                List.of(new ItemPedidoRequest("TP002", 1))),
                                202L);

                // El primer cliente puede consultar su pedido.
                PedidoResponse encontrado = pedidoService.obtenerPorIdCliente(
                                pedidoCliente1.id(),
                                101L);

                assertEquals(pedidoCliente1.id(), encontrado.id());

                // El primer cliente no puede consultar el pedido del segundo.
                ResponseStatusException error = assertThrows(
                                ResponseStatusException.class,
                                () -> pedidoService.obtenerPorIdCliente(
                                                pedidoCliente2.id(),
                                                101L));

                // Se responde 404 para no revelar la existencia de pedidos ajenos.
                assertEquals(404, error.getStatusCode().value());
        }

        @Test
        void noPermiteConsultarPedidoSinUsuarioIdentificado() {

                ResponseStatusException error = assertThrows(
                                ResponseStatusException.class,
                                () -> pedidoService.obtenerPorIdCliente(1L, null));

                assertEquals(401, error.getStatusCode().value());
        }

        @Test
        void devuelve404CuandoElPedidoNoExiste() {

                ResponseStatusException error = assertThrows(
                                ResponseStatusException.class,
                                () -> pedidoService.obtenerPorId(999999L));

                assertEquals(404, error.getStatusCode().value());
        }

        @Test
        void devuelvePedidosVaciosCuandoClienteNoTieneCompras() {

                List<PedidoResponse> pedidos = pedidoService.listarPorCliente(999L);

                assertNotNull(pedidos);
                assertTrue(pedidos.isEmpty());
        }

}