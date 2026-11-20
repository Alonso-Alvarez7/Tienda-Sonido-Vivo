package cl.tienda.sonidoVivo.Api.producto.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.tienda.sonidoVivo.Api.producto.model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);
}