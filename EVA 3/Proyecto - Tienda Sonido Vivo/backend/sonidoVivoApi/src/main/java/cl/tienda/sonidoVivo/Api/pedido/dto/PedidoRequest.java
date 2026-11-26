package cl.tienda.sonidoVivo.Api.pedido.dto;

import java.util.List;

import cl.tienda.sonidoVivo.Api.pedido.model.TipoEntrega;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PedidoRequest(

    @NotNull(message = "El tipo de entrega es obligatorio")
    TipoEntrega tipoEntrega,

    @Size(max = 255, message = "La dirección no puede superar los 255 caracteres")
    String direccion,

    @NotBlank(message = "El teléfono de contacto es obligatorio")
    @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
    String telefonoContacto,

        @NotEmpty(message = "El pedido debe contener al menos un producto")
    @Valid
    List<ItemPedidoRequest> items

) {}