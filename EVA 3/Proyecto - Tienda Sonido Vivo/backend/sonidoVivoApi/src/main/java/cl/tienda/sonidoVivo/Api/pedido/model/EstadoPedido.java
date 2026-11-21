package cl.tienda.sonidoVivo.Api.pedido.model;

/** Estados del pedido. La etiqueta es el texto que muestra el frontend. */
public enum EstadoPedido {

    EN_PREPARACION("En preparación"),
    DESPACHADO("Despachado"),
    ENTREGADO("Entregado");

    private final String etiqueta;

    EstadoPedido(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }
}