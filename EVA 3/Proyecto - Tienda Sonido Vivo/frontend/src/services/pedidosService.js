import { obtenerSesion } from "../auth/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

async function solicitar(endpoint, opciones = {}) {
    const sesion = obtenerSesion();
    const headers = {
        "Content-Type": "application/json",
        ...(sesion?.token ? { Authorization: `Bearer ${sesion.token}` } : {}),
        ...opciones.headers,
    };

    const respuesta = await fetch(`${API_URL}${endpoint}`, {
        ...opciones,
        headers,
    });

    const resultado = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        throw new Error(resultado?.mensaje || `Error HTTP ${respuesta.status}`);
    }

    return resultado?.data ?? resultado;
}

export async function crearPedidoApi({ usuarioId, entrega, direccion, telefono, items }) {
    const payload = {
        usuarioId: usuarioId ?? null,
        tipoEntrega: entrega === "despacho" ? "DESPACHO" : "RETIRO",
        direccion: entrega === "despacho" ? direccion : null,
        telefonoContacto: telefono,
        items: items.map((item) => ({
            codigoProducto: item.codigo ?? item.id,
            cantidad: item.cantidad,
        })),
    };

    return solicitar("/pedidos", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function obtenerPedidos() {
    return solicitar("/pedidos");
}

export async function obtenerPedidosCliente(usuarioId) {
    return solicitar(`/pedidos/cliente/${encodeURIComponent(usuarioId)}`);
}

const ETIQUETA_A_ENUM = {
    "En preparación": "EN_PREPARACION",
    "Despachado": "DESPACHADO",
    "Entregado": "ENTREGADO",
};

export async function cambiarEstadoPedidoApi(id, etiquetaEstado) {
    const estadoEnum = ETIQUETA_A_ENUM[etiquetaEstado] || etiquetaEstado;
    return solicitar(`/pedidos/${encodeURIComponent(id)}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ estado: estadoEnum }),
    });
}