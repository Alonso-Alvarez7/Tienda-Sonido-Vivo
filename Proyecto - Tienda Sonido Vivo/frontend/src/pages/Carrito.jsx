function Carrito({ carrito, onCambiarCantidad, onEliminar, onCheckout }) {
    const total = carrito.reduce(
        (suma, producto) => suma + producto.precio * producto.cantidad,
        0
    );

    return (
        <main className="pagina-carrito">
            <h1>Tu carrito</h1>

            {carrito.length === 0 ? (
                <p>Tu carrito está vacío.</p>
            ) : (
                <>
                    {carrito.map((producto) => (
                        <article className="carrito-producto" key={producto.id}>
                            <img
                                className="carrito-imagen"
                                src={producto.imagen}
                                alt={`${producto.nombre} marca ${producto.marca}`}
                            />

                            <div className="carrito-producto-info">
                                <h2>{producto.nombre}</h2>
                                <p>{producto.marca} · {producto.modelo}</p>
                                <p>
                                    Precio: ${producto.precio.toLocaleString("es-CL")} CLP
                                </p>
                                <p>
                                    Subtotal: $
                                    {(producto.precio * producto.cantidad).toLocaleString("es-CL")} CLP
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

                    <h2 className="carrito-total">
                        Total: ${total.toLocaleString("es-CL")} CLP
                    </h2>

                    <button className="boton-checkout" onClick={onCheckout}>
                        Continuar al checkout
                    </button>
                </>
            )}
        </main>
    );
}

export default Carrito;