
package cl.tienda.sonidoVivo.Api.producto.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ProductoRequest(

    @NotBlank(message = "El código es obligatorio")
    @Size(max = 20, message = "El código no puede superar los 20 caracteres")
    String codigo,

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150, message = "El nombre no puede superar los 150 caracteres")
    String nombre,

    @NotBlank(message = "La marca es obligatoria")
    @Size(max = 80, message = "La marca no puede superar los 80 caracteres")
    String marca,

    @Size(max = 80, message = "El modelo no puede superar los 80 caracteres")
    String modelo,

    @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
    String descripcion,

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor que cero")
    Integer precio,

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    Integer stock,

    @Size(max = 255, message = "La imagen no puede superar los 255 caracteres")
    String imagen,

    @NotNull(message = "Debes seleccionar una categoría")
    @Positive(message = "El ID de categoría debe ser válido")
    Long categoriaId

) {}
