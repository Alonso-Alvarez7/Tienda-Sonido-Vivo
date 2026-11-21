// Pedidos (simulados con localStorage).
// El stock ya no se maneja aquí: vive en el backend (Producto.stock) y se
// consulta y ajusta desde services/productosService.js.
// Cuando exista el microservicio Spring Boot (/api/pedidos), solo cambia el interior de estas funciones.
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

// TODO (T-05): al integrar POST /api/pedidos, el backend validará el stock y lo
// descontará de forma transaccional al confirmar el pedido.
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