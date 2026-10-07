function Carrito({ carrito, onCambiarCantidad, onEliminar, onCheckout }) {
    const total = carrito.reduce(
        (suma, producto) => suma + producto.precio * producto.cantidad,
        0
    );

    return (
        <section className="carrito" id="carrito">
            <h2>Tu carrito</h2>

            {carrito.length === 0 ? (
                <p>Tu carrito está vacío.</p>
            ) : (
                <>
                    {carrito.map((producto) => (
                        <article className="carrito-producto" key={producto.id}>
                            <div>
                                <h3>{producto.nombre}</h3>
                                <p>
                                    ${producto.precio.toLocaleString("es-CL")} CLP por unidad
                                </p>
                                <p>
                                    Subtotal: $
                                    {(producto.precio * producto.cantidad).toLocaleString("es-CL")}{" "}
                                    CLP
                                </p>
                            </div>

                            <div className="carrito-controles">
                                <button
                                    onClick={() =>
                                        onCambiarCantidad(producto.id, producto.cantidad - 1)
                                    }
                                    disabled={producto.cantidad <= 1}
                                >
                                    −
                                </button>

                                <span>{producto.cantidad}</span>

                                <button
                                    onClick={() =>
                                        onCambiarCantidad(producto.id, producto.cantidad + 1)
                                    }
                                    disabled={producto.cantidad >= producto.stock}
                                >
                                    +
                                </button>

                                <button
                                    className="boton-eliminar"
                                    onClick={() => onEliminar(producto.id)}
                                >
                                    Quitar
                                </button>
                            </div>
                        </article>
                    ))}

                    <h3 className="carrito-total">
                        Total: ${total.toLocaleString("es-CL")} CLP
                    </h3>

                    <button className="boton-checkout" onClick={onCheckout}>
                        Continuar al checkout
                    </button>
                </>
            )}
        </section>
    );
}

export default Carrito;