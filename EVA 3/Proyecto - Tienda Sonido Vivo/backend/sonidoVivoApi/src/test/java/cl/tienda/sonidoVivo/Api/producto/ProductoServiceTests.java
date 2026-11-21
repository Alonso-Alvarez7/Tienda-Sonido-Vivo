package cl.tienda.sonidoVivo.Api.producto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import cl.tienda.sonidoVivo.Api.producto.dto.ProductoRequest;
import cl.tienda.sonidoVivo.Api.producto.dto.ProductoResponse;
import cl.tienda.sonidoVivo.Api.producto.model.Categoria;
import cl.tienda.sonidoVivo.Api.producto.repository.CategoriaRepository;
import cl.tienda.sonidoVivo.Api.producto.service.ProductoService;

// @Transactional: cada test hace rollback y no deja datos en H2.
@SpringBootTest(properties = "spring.profiles.active=test")
@Transactional
class ProductoServiceTests {

    @Autowired
    private ProductoService productoService;

    @Autowired
    private CategoriaRepository categoriaRepository;

    private Long categoriaId;

    @BeforeEach
    void prepararCategoria() {
        Categoria categoria = new Categoria();
        categoria.setNombre("Categoria Test");
        categoriaId = categoriaRepository.save(categoria).getId();
    }

    private ProductoRequest request(String codigo, String nombre, String marca) {
        return new ProductoRequest(codigo, nombre, marca, "M1", "Descripción", 10000, 5,
                "/imagen/productos/" + codigo + ".jpg", categoriaId);
    }

    @Test
    void creaProductoYLoExponeConElCodigoComoId() {
        ProductoResponse creado = productoService.crearProducto(request("TT001", "Guitarra Test", "Yamaha"));

        assertEquals("TT001", creado.id());
        assertEquals("Categoria Test", creado.categoria());
        assertEquals("TT001", productoService.obtenerProducto("TT001").codigo());
    }

    @Test
    void rechazaCodigoDuplicadoConConflicto() {
        productoService.crearProducto(request("TT002", "Bajo Test", "Fender"));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> productoService.crearProducto(request("TT002", "Otro", "Fender")));

        assertEquals(409, error.getStatusCode().value());
    }

    @Test
    void filtraPorTextoYCategoria() {
        productoService.crearProducto(request("TT003", "Teclado Test", "Casio"));
        productoService.crearProducto(request("TT004", "Pedal Test", "Boss"));

        assertEquals(1, productoService.listarProductos("casio", "Categoria Test").size());
        assertEquals(2, productoService.listarProductos("", "Categoria Test").size());
        assertTrue(productoService.listarProductos("", "Categoria Inexistente").isEmpty());
    }

    @Test
    void desactivarOcultaElProductoDelListadoYDelDetalle() {
        productoService.crearProducto(request("TT005", "Micrófono Test", "Shure"));

        productoService.desactivarProducto("TT005");

        assertTrue(productoService.listarProductos("Micrófono Test", "").isEmpty());
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> productoService.obtenerProducto("TT005"));
        assertEquals(404, error.getStatusCode().value());
    }
}