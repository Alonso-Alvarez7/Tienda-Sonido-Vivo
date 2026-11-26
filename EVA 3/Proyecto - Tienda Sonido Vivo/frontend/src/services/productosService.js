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
        throw new Error(resultado?.mensaje || `Error HTTP ${respuesta.status}`);
    }

    return resultado?.data ?? resultado;
}

export async function obtenerProductos({ texto = "", categoria = "" } = {}) {
    const parametros = new URLSearchParams();
    if (texto.trim()) parametros.set("texto", texto.trim());
    if (categoria && categoria !== "Todas") parametros.set("categoria", categoria);

    const query = parametros.toString();
    return solicitar(`/productos${query ? `?${query}` : ""}`);
}

export async function obtenerProductoPorCodigo(codigo) {
    return solicitar(`/productos/${encodeURIComponent(codigo)}`);
}

export async function obtenerCategorias() {
    return solicitar("/categorias");
}

export async function actualizarProducto(codigo, datos) {
    return solicitar(`/productos/${encodeURIComponent(codigo)}`, {
        method: "PUT",
        body: JSON.stringify(datos),
    });
}