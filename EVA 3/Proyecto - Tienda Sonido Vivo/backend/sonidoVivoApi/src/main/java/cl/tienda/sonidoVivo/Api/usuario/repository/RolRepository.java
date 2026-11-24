package cl.tienda.sonidoVivo.Api.usuario.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.tienda.sonidoVivo.Api.usuario.model.Rol;

public interface RolRepository extends JpaRepository<Rol, Long> {

    Optional<Rol> findByNombre(String nombre);
}