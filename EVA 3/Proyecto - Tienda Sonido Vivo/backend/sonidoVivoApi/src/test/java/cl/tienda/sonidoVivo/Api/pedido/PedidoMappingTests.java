package cl.tienda.sonidoVivo.Api.pedido;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import cl.tienda.sonidoVivo.Api.pedido.model.DetallePedido;
import cl.tienda.sonidoVivo.Api.pedido.model.EstadoPedido;
import cl.tienda.sonidoVivo.Api.pedido.model.Pedido;
import cl.tienda.sonidoVivo.Api.pedido.model.TipoEntrega;
import cl.tienda.sonidoVivo.Api.producto.model.Categoria;
import cl.tienda.sonidoVivo.Api.producto.model.Producto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceException;

// @Transactional: cada test hace rollback y no deja datos en H2.
@SpringBootTest(properties = "spring.profiles.active=test")
@Transactional
class PedidoMappingTests {

    @Autowired
    private EntityManager em;

    private Producto crearProducto(String codigo, int precio) {
        Categoria categoria = new Categoria();
        categoria.setNombre("Categoria " + codigo);
        em.persist(categoria);

        Producto producto = new Producto();
        producto.setCodigo(codigo);
        producto.setNombre("Producto " + codigo);
        producto.setMarca("Marca");
        producto.setPrecio(precio);
        producto.setStock(10);
        producto.setCategoria(categoria);
        em.persist(producto);
        return producto;
    }

    private Pedido pedidoBase() {
        Pedido pedido = new Pedido();
        pedido.setUsuarioId(3L);
        pedido.setTipoEntrega(TipoEntrega.RETIRO);
        pedido.setTelefonoContacto("912345678");
        return pedido;
    }

    @Test
    void guardaPedidoConDetallesYCalculaElTotal() {
        Producto guitarra = crearProducto("PT001", 129990);
        Producto pua = crearProducto("PT004", 3990);

        Pedido pedido = pedidoBase();
        pedido.agregarDetalle(DetallePedido.desde(guitarra, 2));
        pedido.agregarDetalle(DetallePedido.desde(pua, 3));
        em.persist(pedido);
        pedido.asignarCodigo();
        em.flush();
        em.clear();

        Pedido leido = em.find(Pedido.class, pedido.getId());

        assertEquals(String.format("PED-%04d", leido.getId()), leido.getCodigo());
        assertEquals(EstadoPedido.EN_PREPARACION, leido.getEstado());
        assertNotNull(leido.getFecha());
        assertEquals(2, leido.getDetalles().size());
        assertEquals(129990 * 2 + 3990 * 3, leido.getTotal());
    }

    @Test
    void elDetalleConservaElPrecioAunqueCambieElProducto() {
        Producto bajo = crearProducto("PT002", 100000);

        Pedido pedido = pedidoBase();
        pedido.agregarDetalle(DetallePedido.desde(bajo, 1));
        em.persist(pedido);
        em.flush();

        bajo.setPrecio(150000);
        em.flush();
        em.clear();

        Pedido leido = em.find(Pedido.class, pedido.getId());
        DetallePedido detalle = leido.getDetalles().get(0);

        assertEquals(100000, detalle.getPrecioUnitario());
        assertEquals(150000, detalle.getProducto().getPrecio());
        assertEquals(100000, leido.getTotal());
    }

    @Test
    void noPermiteElMismoProductoDosVecesEnUnPedido() {
        Producto teclado = crearProducto("PT003", 50000);

        Pedido pedido = pedidoBase();
        pedido.agregarDetalle(DetallePedido.desde(teclado, 1));
        pedido.agregarDetalle(DetallePedido.desde(teclado, 2));

        assertThrows(PersistenceException.class, () -> {
            em.persist(pedido);
            em.flush();
        });
    }
}