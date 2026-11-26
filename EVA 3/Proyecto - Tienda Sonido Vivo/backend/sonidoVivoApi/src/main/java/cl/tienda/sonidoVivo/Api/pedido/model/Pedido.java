package cl.tienda.sonidoVivo.Api.pedido.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pedidos", indexes = {
        @Index(name = "idx_pedidos_usuario", columnList = "usuario_id"),
        @Index(name = "idx_pedidos_estado", columnList = "estado"),
        @Index(name = "idx_pedidos_fecha", columnList = "fecha")
})
@Getter
@Setter
@NoArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** PED-0001. Se asigna con asignarCodigo() tras el primer guardado, cuando ya existe el id. */
    @Column(unique = true, length = 20)
    private String codigo;

    /**
     * ID del usuario que realizó la compra (autenticado vía JWT).
     * Referencia a la tabla {@code usuarios(id)} mediante la restricción {@code fk_pedidos_usuario}.
     * Se mantiene como identificador escalar para desacoplar el dominio de pedidos del módulo de usuarios.
     */
    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPedido estado = EstadoPedido.EN_PREPARACION;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_entrega", nullable = false, length = 20)
    private TipoEntrega tipoEntrega;

    /** Obligatoria solo cuando el tipo de entrega es DESPACHO (se valida en el servicio). */
    @Column(length = 255)
    private String direccion;

    @Column(name = "telefono_contacto", nullable = false, length = 20)
    private String telefonoContacto;

    /** CLP sin decimales. Suma de los subtotales; lo calcula el servidor, nunca el navegador. */
    @Column(nullable = false)
    private Integer total = 0;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetallePedido> detalles = new ArrayList<>();

    @PrePersist
    protected void asignarFechaSiFalta() {
        if (fecha == null) {
            fecha = LocalDateTime.now();
        }
    }

    /** Agrega una línea al pedido, la enlaza con él y recalcula el total. */
    public void agregarDetalle(DetallePedido detalle) {
        detalle.setPedido(this);
        detalles.add(detalle);
        recalcularTotal();
    }

    public void recalcularTotal() {
        total = detalles.stream().mapToInt(DetallePedido::getSubtotal).sum();
    }

    /** Genera PED-0001 a partir del id. Llamar justo después de guardar el pedido. */
    public void asignarCodigo() {
        if (id == null) {
            throw new IllegalStateException("El pedido debe guardarse antes de asignar su código");
        }
        codigo = String.format("PED-%04d", id);
    }
}