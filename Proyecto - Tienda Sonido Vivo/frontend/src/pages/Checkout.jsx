import { useState } from "react";

function Checkout({ carrito, onVolver }) {
    const [tipoEntrega, setTipoEntrega] = useState("retiro");
    const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

    const total = carrito.reduce(
        (suma, producto) => suma + producto.precio * producto.cantidad,
        0
    );

    function confirmarPedido(evento) {
        evento.preventDefault();
        setPedidoConfirmado(true);
    }

    if (pedidoConfirmado) {
        return (
            <main className="checkout">
                <h1>¡Pedido confirmado!</h1>
                <p>Gracias por comprar en Sonido Vivo.</p>
                <p>Tu pedido quedó registrado en esta demostración.</p>
                <button onClick={onVolver}>Volver a la tienda</button>
            </main>
        );
    }

    return (
        <main className="checkout">
            <button className="boton-volver" onClick={onVolver}>
                ← Volver a la tienda
            </button>

            <h1>Confirmar pedido</h1>

            <section className="checkout-resumen">
                <h2>Resumen de compra</h2>
                {carrito.map((producto) => (
                    <p key={producto.id}>
                        {producto.nombre} × {producto.cantidad} — $
                        {(producto.precio * producto.cantidad).toLocaleString("es-CL")} CLP
                    </p>
                ))}
                <h3>Total: ${total.toLocaleString("es-CL")} CLP</h3>
            </section>

            <form className="checkout-formulario" onSubmit={confirmarPedido}>
                <h2>Datos del cliente</h2>

                <label>
                    Nombre completo
                    <input name="nombre" type="text" required />
                </label>

                <label>
                    Correo electrónico
                    <input name="correo" type="email" required />
                </label>

                <label>
                    Teléfono
                    <input name="telefono" type="tel" required />
                </label>

                <fieldset>
                    <legend>¿Cómo quieres recibir tu pedido?</legend>

                    <label className="opcion-entrega">
                        <input
                            type="radio"
                            name="entrega"
                            value="retiro"
                            checked={tipoEntrega === "retiro"}
                            onChange={() => setTipoEntrega("retiro")}
                        />
                        Retiro en tienda
                    </label>

                    <label className="opcion-entrega">
                        <input
                            type="radio"
                            name="entrega"
                            value="despacho"
                            checked={tipoEntrega === "despacho"}
                            onChange={() => setTipoEntrega("despacho")}
                        />
                        Despacho
                    </label>
                </fieldset>

                {tipoEntrega === "despacho" && (
                    <label>
                        Dirección de despacho
                        <input name="direccion" type="text" required />
                    </label>
                )}

                <button type="submit" disabled={carrito.length === 0}>
                    Confirmar pedido
                </button>
            </form>
        </main>
    );
}

export default Checkout;