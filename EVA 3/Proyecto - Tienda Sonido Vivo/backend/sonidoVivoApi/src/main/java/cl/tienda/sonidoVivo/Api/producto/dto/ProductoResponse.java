package cl.tienda.sonidoVivo.Api.producto.dto;

/** El id expuesto es el código del producto (GA001, ...) para no cambiar el frontend. */
public record ProductoResponse(

    String id,
    String codigo,
    String nombre,
    String marca,
    String modelo,
    String descripcion,
    Integer precio,
    Integer stock,
    String imagen,
    Long categoriaId,
    String categoria,
    boolean activo

) {}