import { useState } from "react";
import { useAuth } from "../auth/AuthContext.js";
import { productos } from "../data/productos";
import {
    ESTADOS_PEDIDO,
    CLASE_ESTADO,
    codigoPedido,
    listarPedidos,
    cambiarEstadoPedido,
    obtenerStockActual,
    fijarStock,
} from "../data/pedidos";

const STOCK_BAJO = 2;

function formatoFecha(iso) {
    return new Date(iso).toLocaleString("es-CL", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

function Vendedor() {
    const { usuario } = useAuth();
    const [pestana, setPestana] = useState("pedidos");
    const [pedidos, setPedidos] = useState(() => listarPedidos());
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [stock, setStock] = useState(() => obtenerStockActual());
    const [busqueda, setBusqueda] = useState("");

    const pedidosFiltrados =
        filtroEstado === "todos"
            ? pedidos
            : pedidos.filter((pedido) => pedido.estado === filtroEstado);

    const pendientes = pedidos.filter(
        (pedido) => pedido.estado === ESTADOS_PEDIDO[0]
    ).length;

    const textoBusqueda = busqueda.trim().toLowerCase();
    const productosFiltrados = textoBusqueda
        ? productos.filter(
            (producto) =>
                producto.nombre.toLowerCase().includes(textoBusqueda) ||
                producto.marca.toLowerCase().includes(textoBusqueda) ||
                producto.codigo.toLowerCase().includes(textoBusqueda)
        )
        : productos;

    function cambiarEstado(id, estado) {
        cambiarEstadoPedido(id, estado);
        setPedidos(listarPedidos());
    }

    function cambiarStock(id, diferencia) {
        fijarStock(id, stock[id] + diferencia);
        setStock(obtenerStockActual());
    }

    return (
        <main className="vendedor">
            <h1>Panel del vendedor</h1>
            <p>Hola, {usuario.nombre}. Gestiona los pedidos y el stock de la tienda.</p>

            <div className="vendedor-pestanas" role="tablist">
                <button
                    role="tab"
                    aria-selected={pestana === "pedidos"}
                    className={`vendedor-pestana ${pestana === "pedidos" ? "activa" : ""}`}
                    onClick={() => setPestana("pedidos")}
                >
                    Pedidos ({pendientes} en preparación)
                </button>
                <button
                    role="tab"
                    aria-selected={pestana === "stock"}
                    className={`vendedor-pestana ${pestana === "stock" ? "activa" : ""}`}
                    onClick={() => setPestana("stock")}
                >
                    Stock
                </button>
            </div>

            {pestana === "pedidos" && (
                <section>
                    <div className="vendedor-filtros">
                        <label>
                            Filtrar por estado
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                            >
                                <option value="todos">Todos</option>
                                {ESTADOS_PEDIDO.map((estado) => (
                                    <option key={estado} value={estado}>{estado}</option>
                                ))}
                            </select>
                        </label>
                        <button
                            className="boton-secundario"
                            onClick={() => setPedidos(listarPedidos())}
                        >
                            Actualizar lista
                        </button>
                    </div>

                    {pedidosFiltrados.length === 0 ? (
                        <p>No hay pedidos para mostrar.</p>
                    ) : (
                        <div className="pedidos-lista">
                            {pedidosFiltrados.map((pedido) => (
                                <article className="pedido-tarjeta" key={pedido.id}>
                                    <div className="pedido-cabecera">
                                        <h2>{codigoPedido(pedido.id)}</h2>
                                        <span className={`pedido-estado ${CLASE_ESTADO[pedido.estado]}`}>
                                            {pedido.estado}
                                        </span>
                                    </div>

                                    <p className="pedido-fecha">{formatoFecha(pedido.fecha)}</p>

                                    <p>
                                        <strong>{pedido.cliente.nombre}</strong>
                                        <br />
                                        {pedido.cliente.correo} · {pedido.cliente.telefono}
                                    </p>

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

                                    <label>
                                        Cambiar estado
                                        <select
                                            value={pedido.estado}
                                            onChange={(e) => cambiarEstado(pedido.id, e.target.value)}
                                        >
                                            {ESTADOS_PEDIDO.map((estado) => (
                                                <option key={estado} value={estado}>{estado}</option>
                                            ))}
                                        </select>
                                    </label>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {pestana === "stock" && (
                <section>
                    <div className="vendedor-filtros">
                        <label>
                            Buscar producto
                            <input
                                type="search"
                                placeholder="Nombre, marca o código"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </label>
                    </div>

                    <div className="tabla-contenedor">
                        <table className="tabla-admin">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Producto</th>
                                    <th>Categoría</th>
                                    <th>Stock</th>
                                    <th>Ajustar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosFiltrados.map((producto) => (
                                    <tr
                                        key={producto.id}
                                        className={stock[producto.id] <= STOCK_BAJO ? "stock-bajo" : undefined}
                                    >
                                        <td>{producto.codigo}</td>
                                        <td>{producto.nombre} · {producto.marca}</td>
                                        <td>{producto.categoria}</td>
                                        <td>
                                            {stock[producto.id]}
                                            {stock[producto.id] <= STOCK_BAJO && " (bajo)"}
                                        </td>
                                        <td>
                                            <div className="admin-botones">
                                                <button
                                                    onClick={() => cambiarStock(producto.id, -1)}
                                                    disabled={stock[producto.id] <= 0}
                                                    aria-label={`Restar uno al stock de ${producto.nombre}`}
                                                >
                                                    −
                                                </button>
                                                <button
                                                    onClick={() => cambiarStock(producto.id, 1)}
                                                    aria-label={`Sumar uno al stock de ${producto.nombre}`}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </main>
    );
}

export default Vendedor;