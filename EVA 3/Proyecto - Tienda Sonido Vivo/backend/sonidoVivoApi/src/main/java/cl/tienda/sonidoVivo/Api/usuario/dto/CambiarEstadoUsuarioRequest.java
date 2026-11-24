package cl.tienda.sonidoVivo.Api.usuario.dto;

import jakarta.validation.constraints.NotNull;

public record CambiarEstadoUsuarioRequest(
        @NotNull(message = "Debes indicar si el usuario está activo")
        Boolean activo
) {}