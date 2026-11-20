package cl.tienda.sonidoVivo.Api.producto.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 80)
    private String marca;

    @Column(length = 80)
    private String modelo;

    @Column(length = 500)
    private String descripcion;

    /** Precio en pesos chilenos (CLP no usa decimales). */
    @Min(1)
    @Column(nullable = false)
    private Integer precio;

    @Min(0)
    @Column(nullable = false)
    private Integer stock;

    @Column(length = 255)
    private String imagen;

    /** Baja lógica: se conserva el historial de pedidos aunque el producto se retire. */
    @Column(nullable = false)
    private boolean activo = true;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    /** Bloqueo optimista: evita que dos ventas simultáneas pisen el mismo stock. */
    @Version
    private Long version;
}