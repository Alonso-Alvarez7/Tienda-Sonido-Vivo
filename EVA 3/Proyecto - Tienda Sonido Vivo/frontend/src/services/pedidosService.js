
import { obtenerSesion } from "../auth/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

async function solicitar(endpoint, opciones = {}) {
    const sesion = obtenerSesion();

    const headers = {
        "Content-Type": "application/json",
        ...(sesion?.token
            ? { Authorization: `Bearer ${sesion.token}` }
            : {}),
        ...opciones.headers,
    };

    const respuesta = await fetch(`${API_URL}${endpoint}`, {
        ...opciones,
        headers,
    });

    const resultado = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        throw new Error(
            resultado?.mensaje ||
            resultado?.message ||
            `Error HTTP ${respuesta.status}`
        );
    }

    return resultado?.data ?? resultado;
}

/**
 * Registra un pedido.
 * El backend identifica al cliente mediante el JWT.
 * No se envía usuarioId ni el total calculado por React.
 */
export async function crearPedidoApi({
    entrega,
    direccion,
    telefono,
    items,
}) {
    const esDespacho = String(entrega).toUpperCase() === "DESPACHO";

    const payload = {
        tipoEntrega: esDespacho ? "DESPACHO" : "RETIRO",
        direccion: esDespacho ? direccion : null,
        telefonoContacto: telefono,
        items: items.map((item) => ({
            codigoProducto: item.codigo ?? item.codigoProducto ?? item.id,
            cantidad: item.cantidad,
        })),
    };

    return solicitar("/pedidos", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/**
 * Lista todos los pedidos.
 * Disponible para vendedor y administrador.
 */
export async function obtenerPedidos() {
    return solicitar("/pedidos");
}

/**
 * Lista exclusivamente los pedidos del usuario autenticado.
 * No recibe usuarioId porque el backend lo obtiene del JWT.
 */
export async function obtenerPedidosCliente() {
    return solicitar("/pedidos/mis-pedidos");
}

const ETIQUETA_A_ENUM = {
    "En preparación": "EN_PREPARACION",
    "Despachado": "DESPACHADO",
    "Entregado": "ENTREGADO",
};

/**
 * Actualiza el estado de un pedido.
 */
export async function cambiarEstadoPedidoApi(id, etiquetaEstado) {
    const estadoEnum = ETIQUETA_A_ENUM[etiquetaEstado] || etiquetaEstado;

    return solicitar(`/pedidos/${encodeURIComponent(id)}/estado`, {
        method: "PATCH",
        body: JSON.stringify({
            estado: estadoEnum,
        }),
    });
}
