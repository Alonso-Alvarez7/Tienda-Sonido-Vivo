import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.js";
import {
    obtenerProductos,
    actualizarProducto,
} from "../services/productosService.js";
import {
    obtenerPedidos,
    cambiarEstadoPedidoApi,
} from "../services/pedidosService.js";
import {
    ESTADOS_PEDIDO,
    CLASE_ESTADO,
    codigoPedido,
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

    // Pedidos: vienen del backend
    const [pedidos, setPedidos] = useState([]);
    const [cargandoPedidos, setCargandoPedidos] = useState(true);
    const [errorPedidos, setErrorPedidos] = useState("");
    const [actualizandoPedido, setActualizandoPedido] = useState(null);
    const [recargaPedidos, setRecargaPedidos] = useState(0);
    const [filtroEstado, setFiltroEstado] = useState("todos");

    // Stock: viene del backend (Producto.stock)
    const [busqueda, setBusqueda] = useState("");
    const [productos, setProductos] = useState([]);
    const [cargandoStock, setCargandoStock] = useState(true);
    const [errorStock, setErrorStock] = useState("");
    const [actualizando, setActualizando] = useState(null); // código en proceso
    const [recarga, setRecarga] = useState(0);

    // Cargar pedidos desde el backend
    useEffect(() => {
        let vigente = true;

        async function cargarPedidos() {
            setCargandoPedidos(true);
            setErrorPedidos("");

            try {
                const datos = await obtenerPedidos();
                if (vigente) {
                    setPedidos(Array.isArray(datos) ? datos : []);
                }
            } catch (e) {
                if (vigente) {
                    setErrorPedidos(e.message || "No fue posible cargar los pedidos.");
                }
            } finally {
                if (vigente) {
                    setCargandoPedidos(false);
                }
            }
        }

        cargarPedidos();

        return () => {
            vigente = false;
        };
    }, [recargaPedidos]);

    // Cargar stock desde el backend
    useEffect(() => {
        let vigente = true;

        async function cargarStock() {
            setCargandoStock(true);
            setErrorStock("");

            try {
                const datos = await obtenerProductos();

                if (vigente) {
                    setProductos(Array.isArray(datos) ? datos : []);
                }
            } catch (e) {
                if (vigente) {
                    setErrorStock(e.message || "No fue posible cargar el stock.");
                }
            } finally {
                if (vigente) {
                    setCargandoStock(false);
                }
            }
        }

        cargarStock();

        return () => {
            vigente = false;
        };
    }, [recarga]);

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

    async function cambiarEstado(id, estado) {
        setActualizandoPedido(id);
        setErrorPedidos("");

        try {
            const actualizado = await cambiarEstadoPedidoApi(id, estado);
            setPedidos((lista) =>
                lista.map((pedido) => (pedido.id === id ? actualizado : pedido))
            );
        } catch (e) {
            setErrorPedidos(e.message || "No fue posible actualizar el estado del pedido.");
        } finally {
            setActualizandoPedido(null);
        }
    }

    async function cambiarStock(producto, diferencia) {
        const nuevoStock = Math.max(0, producto.stock + diferencia);
        if (nuevoStock === producto.stock) return;

        setActualizando(producto.codigo);
        setErrorStock("");

        try {
            // El PUT del backend exige el producto completo (ProductoRequest)[cite: 1, 2].
            const actualizado = await actualizarProducto(producto.codigo, {
                codigo: producto.codigo,
                nombre: producto.nombre,
                marca: producto.marca,
                modelo: producto.modelo,
                descripcion: producto.descripcion,
                precio: producto.precio,
                stock: nuevoStock,
                imagen: producto.imagen,
                categoriaId: producto.categoriaId,
            });

            setProductos((lista) =>
                lista.map((item) =>
                    item.codigo === actualizado.codigo ? actualizado : item
                )
            );
        } catch (e) {
            setErrorStock(e.message || "No fue posible actualizar el stock.");
        } finally {
            setActualizando(null);
        }
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
                            onClick={() => setRecargaPedidos((n) => n + 1)}
                        >
                            Actualizar lista
                        </button>
                    </div>

                    {errorPedidos && (
                        <p className="auth-error" role="alert">{errorPedidos}</p>
                    )}

                    {cargandoPedidos ? (
                        <p role="status">Cargando pedidos...</p>
                    ) : pedidosFiltrados.length === 0 ? (
                        <p>No hay pedidos para mostrar.</p>
                    ) : (
                        <div className="pedidos-lista">
                            {pedidosFiltrados.map((pedido) => (
                                <article className="pedido-tarjeta" key={pedido.id}>
                                    <div className="pedido-cabecera">
                                        <h2>{pedido.codigo ?? codigoPedido(pedido.id)}</h2>
                                        <span className={`pedido-estado ${CLASE_ESTADO[pedido.estado]}`}>
                                            {pedido.estado}
                                        </span>
                                    </div>

                                    <p className="pedido-fecha">{formatoFecha(pedido.fecha)}</p>

                                    <p>
                                        <strong>
                                            {pedido.usuarioId > 0
                                                ? `Cliente ID #${pedido.usuarioId}`
                                                : "Cliente invitado"}
                                        </strong>
                                        <br />
                                        Tel: {pedido.telefonoContacto}
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
                                            disabled={actualizandoPedido === pedido.id}
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
                        <button
                            className="boton-secundario"
                            onClick={() => setRecarga((n) => n + 1)}
                        >
                            Actualizar lista
                        </button>
                    </div>

                    {errorStock && (
                        <p className="auth-error" role="alert">{errorStock}</p>
                    )}

                    {cargandoStock ? (
                        <p role="status">Cargando stock...</p>
                    ) : productosFiltrados.length === 0 ? (
                        <p>No se encontraron productos.</p>
                    ) : (
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
                                            key={producto.codigo}
                                            className={producto.stock <= STOCK_BAJO ? "stock-bajo" : undefined}
                                        >
                                            <td>{producto.codigo}</td>
                                            <td>{producto.nombre} · {producto.marca}</td>
                                            <td>{producto.categoria}</td>
                                            <td>
                                                {producto.stock}
                                                {producto.stock <= STOCK_BAJO && " (bajo)"}
                                            </td>
                                            <td>
                                                <div className="admin-botones">
                                                    <button
                                                        onClick={() => cambiarStock(producto, -1)}
                                                        disabled={
                                                            producto.stock <= 0 ||
                                                            actualizando === producto.codigo
                                                        }
                                                        aria-label={`Restar uno al stock de ${producto.nombre}`}
                                                    >
                                                        −
                                                    </button>
                                                    <button
                                                        onClick={() => cambiarStock(producto, 1)}
                                                        disabled={actualizando === producto.codigo}
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
                    )}
                </section>
            )}
        </main>
    );
}

export default Vendedor;