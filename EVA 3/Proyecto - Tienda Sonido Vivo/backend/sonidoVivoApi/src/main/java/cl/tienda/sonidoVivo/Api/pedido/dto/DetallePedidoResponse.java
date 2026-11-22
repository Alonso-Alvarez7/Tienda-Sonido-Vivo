package cl.tienda.sonidoVivo.Api.pedido.dto;

public record DetallePedidoResponse(
    String id, // Código del producto (ej. "GA001") para mantener compatibilidad con el frontend
    String nombre,
    Integer precio,
    Integer cantidad,
    Integer subtotal
) {}