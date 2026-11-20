package cl.tienda.sonidoVivo.Api.producto.dto;

public record ProductoResponse(

    Long id,
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
