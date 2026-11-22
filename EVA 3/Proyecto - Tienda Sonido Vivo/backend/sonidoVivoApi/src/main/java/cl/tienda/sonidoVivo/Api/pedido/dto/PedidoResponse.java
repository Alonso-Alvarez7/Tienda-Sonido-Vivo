package cl.tienda.sonidoVivo.Api.pedido.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
    Long id,
    String codigo,
    Long usuarioId,
    LocalDateTime fecha,
    String estado,      // Etiqueta legible: "En preparación", "Despachado", "Entregado"
    String entrega,     // "retiro" o "despacho" para coincidir con el frontend
    String direccion,
    String telefonoContacto,
    Integer total,
    List<DetallePedidoResponse> items
) {}