package cl.tienda.sonidoVivo.Api.usuario.dto;

public record AutenticacionResponse(
        Long id,
        String nombre,
        String correo,
        String rol,
        String token,
        long expira
) {}