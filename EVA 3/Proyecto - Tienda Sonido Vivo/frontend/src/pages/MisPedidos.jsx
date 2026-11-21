import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";
import { CLASE_ESTADO, codigoPedido } from "../data/pedidos";
import { obtenerPedidosCliente } from "../services/pedidosService.js";

function formatoFecha(iso) {
    return new Date(iso).toLocaleString("es-CL", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

function MisPedidos() {
    const { usuario } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!usuario?.id) return;
        let vigente = true;

        async function cargar() {
            setCargando(true);
            setError("");
            try {
                const datos = await obtenerPedidosCliente(usuario.id);
                if (vigente) setPedidos(Array.isArray(datos) ? datos : []);
            } catch (e) {
                if (vigente) setError(e.message || "No se pudieron cargar tus pedidos.");
            } finally {
                if (vigente) setCargando(false);
            }
        }

        cargar();
        return () => { vigente = false; };
    }, [usuario?.id]);

    return (
        <main className="mis-pedidos">
            <h1>Mis pedidos</h1>

            {cargando && <p role="status">Cargando pedidos...</p>}
            {error && <p className="auth-error" role="alert">{error}</p>}

            {!cargando && !error && pedidos.length === 0 ? (
                <p>
                    Aún no tienes pedidos. <Link to="/#catalogo">Ver productos</Link>
                </p>
            ) : (
                <div className="pedidos-lista">
                    {pedidos.map((pedido) => (
                        <article className="pedido-tarjeta" key={pedido.id}>
                            <div className="pedido-cabecera">
                                <h2>{pedido.codigo ?? codigoPedido(pedido.id)}</h2>
                                <span className={`pedido-estado ${CLASE_ESTADO[pedido.estado]}`}>
                                    {pedido.estado}
                                </span>
                            </div>

                            <p className="pedido-fecha">{formatoFecha(pedido.fecha)}</p>

                            <p>
                                {pedido.entrega === "despacho"
                                    ? `Despacho a: ${pedido.direccion}`
                                    : "Retiro en tienda"}
                            </p>

                            <ul className="pedido-items">
                                {pedido.items.map((item) => (
                                    <li key={item.id}>
                                        {item.nombre} × {item.cantidad}
                                    </li>
                                ))}
                            </ul>

                            <p className="pedido-total">
                                Total: ${pedido.total.toLocaleString("es-CL")} CLP
                            </p>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

export default MisPedidos;