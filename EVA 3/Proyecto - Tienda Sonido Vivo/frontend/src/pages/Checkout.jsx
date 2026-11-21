import { useState } from "react";
import { useAuth } from "../auth/AuthContext.js";
import { crearPedidoApi } from "../services/pedidosService.js";

function Checkout({ carrito, onVolver, onConfirmar }) {
    const { usuario } = useAuth();
    const [tipoEntrega, setTipoEntrega] = useState("retiro");
    const [pedidoConfirmado, setPedidoConfirmado] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    const total = carrito.reduce(
        (suma, producto) => suma + producto.precio * producto.cantidad,
        0
    );

    async function confirmarPedido(evento) {
        evento.preventDefault();
        setError("");
        setEnviando(true);

        const datos = new FormData(evento.target);

        try {
            const creado = await crearPedidoApi({
                usuarioId: usuario?.id ?? null,
                entrega: datos.get("entrega") ?? "retiro",
                direccion: datos.get("direccion") ?? "",
                telefono: datos.get("telefono") ?? "",
                items: carrito,
            });

            setPedidoConfirmado(creado);
            onConfirmar();
        } catch (e) {
            setError(e.message || "No se pudo registrar el pedido.");
        } finally {
            setEnviando(false);
        }
    }

    if (pedidoConfirmado) {
        return (
            <main className="checkout">
                <h1>¡Pedido confirmado!</h1>
                <p>Código de seguimiento: <strong>{pedidoConfirmado.codigo}</strong></p>
                <p>Gracias por comprar en Sonido Vivo.</p>
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

            {error && <p className="auth-error" role="alert">{error}</p>}

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
                    <input
                        name="nombre"
                        type="text"
                        defaultValue={usuario?.nombre ?? ""}
                        required
                    />
                </label>

                <label>
                    Correo electrónico
                    <input
                        name="correo"
                        type="email"
                        defaultValue={usuario?.correo ?? ""}
                        required
                    />
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

                <button type="submit" disabled={carrito.length === 0 || enviando}>
                    {enviando ? "Procesando pedido..." : "Confirmar pedido"}
                </button>
            </form>
        </main>
    );
}

export default Checkout;