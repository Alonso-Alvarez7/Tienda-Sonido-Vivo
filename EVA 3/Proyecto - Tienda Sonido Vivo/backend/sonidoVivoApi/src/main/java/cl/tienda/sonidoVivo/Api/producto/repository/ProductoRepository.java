package cl.tienda.sonidoVivo.Api.producto.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cl.tienda.sonidoVivo.Api.producto.model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    /**
     * Productos activos filtrados por texto (nombre o marca) y categoría.
     * Un parámetro vacío ("") significa "sin filtro". JOIN FETCH evita el N+1 de la categoría.
     */
    @Query("""
            SELECT p FROM Producto p
            JOIN FETCH p.categoria c
            WHERE p.activo = true
              AND (LOWER(p.nombre) LIKE LOWER(CONCAT('%', :texto, '%'))
                   OR LOWER(p.marca) LIKE LOWER(CONCAT('%', :texto, '%')))
              AND (:categoria = '' OR c.nombre = :categoria)
            ORDER BY p.codigo
            """)
    List<Producto> buscarActivos(@Param("texto") String texto,
                                 @Param("categoria") String categoria);
}