package cl.tienda.sonidoVivo.Api.usuario.dto;

public record UsuarioAdminResponse(
        Long id,
        String nombre,
        String correo,
        String rol,
        boolean activo
) {}