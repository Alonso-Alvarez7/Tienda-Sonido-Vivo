// Pedidos y stock (simulados con localStorage).
// Cuando exista el microservicio Spring Boot (/api/pedidos), solo cambia el interior de estas funciones.
import { productos } from "./productos";
import { leer, guardar } from "../utils/almacenamiento";

// Se re-exporta para que los demás archivos sigan importándola desde aquí.
export { codigoPedido } from "../utils/formatoPedido";

export const ESTADOS_PEDIDO = ["En preparación", "Despachado", "Entregado"];

export const CLASE_ESTADO = {
    "En preparación": "pedido-estado--preparacion",
    "Despachado": "pedido-estado--despachado",
    "Entregado": "pedido-estado--entregado",
};

const CLAVE_PEDIDOS = "sonidoVivoPedidos";
const CLAVE_STOCK = "sonidoVivoStock";

/* ---------- Pedidos ---------- */

// Todos los pedidos, del más reciente al más antiguo (vista del vendedor).
export function listarPedidos() {
    return leer(CLAVE_PEDIDOS, []).sort((a, b) => b.id - a.id);
}

// Solo los pedidos del cliente indicado (por su id de usuario o por su correo).
export function listarPedidosDeCliente(usuario) {
    if (!usuario) return [];
    const correo = usuario.correo.toLowerCase();
    return listarPedidos().filter(
        (pedido) =>
            pedido.usuarioId === usuario.id ||
            pedido.cliente.correo.toLowerCase() === correo
    );
}

export function crearPedido({ cliente, entrega, direccion, items, usuarioId }) {
    const pedidos = leer(CLAVE_PEDIDOS, []);

    const nuevo = {
        id: Math.max(0, ...pedidos.map((pedido) => pedido.id)) + 1,
        fecha: new Date().toISOString(),
        cliente,
        entrega,
        direccion: entrega === "despacho" ? direccion : "",
        items,
        total: items.reduce((suma, item) => suma + item.precio * item.cantidad, 0),
        estado: ESTADOS_PEDIDO[0],
        usuarioId: usuarioId ?? null,
    };

    guardar(CLAVE_PEDIDOS, [...pedidos, nuevo]);

    // El stock se actualiza automáticamente al registrar la venta.
    const stockActual = obtenerStockActual();
    items.forEach((item) => {
        fijarStock(item.id, (stockActual[item.id] ?? 0) - item.cantidad);
    });

    return nuevo;
}

export function cambiarEstadoPedido(id, estado) {
    if (!ESTADOS_PEDIDO.includes(estado)) throw new Error("Estado no válido.");
    const pedidos = leer(CLAVE_PEDIDOS, []);
    guardar(
        CLAVE_PEDIDOS,
        pedidos.map((pedido) => (pedido.id === id ? { ...pedido, estado } : pedido))
    );
}

/* ---------- Stock ---------- */

// Stock base de productos.js + los ajustes guardados (descuentos por venta y cambios del vendedor).
export function obtenerStockActual() {
    const ajustes = leer(CLAVE_STOCK, {});
    return Object.fromEntries(
        productos.map((producto) => [producto.id, ajustes[producto.id] ?? producto.stock])
    );
}

export function fijarStock(id, cantidad) {
    const ajustes = leer(CLAVE_STOCK, {});
    ajustes[id] = Math.max(0, cantidad);
    guardar(CLAVE_STOCK, ajustes);
}