
package cl.tienda.sonidoVivo.Api.pedido.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cl.tienda.sonidoVivo.Api.pedido.model.EstadoPedido;
import cl.tienda.sonidoVivo.Api.pedido.model.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @Query("""
            SELECT DISTINCT p FROM Pedido p
            LEFT JOIN FETCH p.detalles d
            LEFT JOIN FETCH d.producto
            WHERE (:estado IS NULL OR p.estado = :estado)
            ORDER BY p.id DESC
            """)
    List<Pedido> listarTodosConDetalles(
            @Param("estado") EstadoPedido estado);

    @Query("""
            SELECT DISTINCT p FROM Pedido p
            LEFT JOIN FETCH p.detalles d
            LEFT JOIN FETCH d.producto
            WHERE p.usuarioId = :usuarioId
            ORDER BY p.id DESC
            """)
    List<Pedido> listarPorUsuarioId(
            @Param("usuarioId") Long usuarioId);

    @Query("""
            SELECT DISTINCT p FROM Pedido p
            LEFT JOIN FETCH p.detalles d
            LEFT JOIN FETCH d.producto
            WHERE p.id = :pedidoId
            """)
    Optional<Pedido> buscarPorIdConDetalles(
            @Param("pedidoId") Long pedidoId);

    @Query("""
            SELECT DISTINCT p FROM Pedido p
            LEFT JOIN FETCH p.detalles d
            LEFT JOIN FETCH d.producto
            WHERE p.id = :pedidoId
            AND p.usuarioId = :usuarioId
            """)
    Optional<Pedido> buscarPorIdYUsuario(
            @Param("pedidoId") Long pedidoId,
            @Param("usuarioId") Long usuarioId);
}
