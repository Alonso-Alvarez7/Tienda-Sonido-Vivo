package cl.tienda.sonidoVivo.Api.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CambiarRolRequest(
        @NotBlank(message = "El rol es obligatorio")
        @Pattern(
                regexp = "ADMIN|VENDEDOR|CLIENTE",
                message = "El rol debe ser ADMIN, VENDEDOR o CLIENTE")
        String rol
) {}