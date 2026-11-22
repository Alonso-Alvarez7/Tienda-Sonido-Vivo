package cl.tienda.sonidoVivo.Api.pedido.model;

import cl.tienda.sonidoVivo.Api.producto.model.Producto;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "detalle_pedidos", uniqueConstraints = @UniqueConstraint(
        name = "uk_detalle_pedido_producto", columnNames = { "pedido_id", "producto_id" }))
@Getter
@Setter
@NoArgsConstructor
public class DetallePedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    /** Copia del nombre al momento de la compra: el historial no cambia si el producto se edita. */
    @Column(name = "nombre_producto", nullable = false, length = 150)
    private String nombreProducto;

    /** Copia del precio al momento de la compra (CLP sin decimales). */
    @Column(name = "precio_unitario", nullable = false)
    private Integer precioUnitario;

    @Min(1)
    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private Integer subtotal;

    /** Crea una línea con la copia del nombre y precio vigentes del producto y su subtotal. */
    public static DetallePedido desde(Producto producto, int cantidad) {
        DetallePedido detalle = new DetallePedido();
        detalle.setProducto(producto);
        detalle.setNombreProducto(producto.getNombre());
        detalle.setPrecioUnitario(producto.getPrecio());
        detalle.setCantidad(cantidad);
        detalle.recalcularSubtotal();
        return detalle;
    }

    public void recalcularSubtotal() {
        subtotal = precioUnitario * cantidad;
    }
}