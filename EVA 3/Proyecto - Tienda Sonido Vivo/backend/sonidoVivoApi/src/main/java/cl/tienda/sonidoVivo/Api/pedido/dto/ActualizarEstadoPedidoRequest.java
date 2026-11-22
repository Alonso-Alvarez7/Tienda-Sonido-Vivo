package cl.tienda.sonidoVivo.Api.pedido.dto;

import cl.tienda.sonidoVivo.Api.pedido.model.EstadoPedido;
import jakarta.validation.constraints.NotNull;

public record ActualizarEstadoPedidoRequest(
    @NotNull(message = "El nuevo estado es obligatorio")
    EstadoPedido estado
) {}