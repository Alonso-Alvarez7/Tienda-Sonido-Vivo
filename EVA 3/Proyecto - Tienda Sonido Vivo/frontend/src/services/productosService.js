
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

async function solicitar(endpoint, opciones = {}) {
    const respuesta = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...opciones.headers,
        },
        ...opciones,
    });

    const resultado = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        throw new Error(
            resultado?.mensaje || `Error HTTP ${respuesta.status}`
        );
    }

    // Admite el formato común { ok, data, mensaje }
    return resultado?.data ?? resultado;
}

export async function obtenerProductos(filtros = {}) {
    const parametros = new URLSearchParams();

    if (filtros.texto?.trim()) {
        parametros.set("texto", filtros.texto.trim());
    }

    if (filtros.categoria?.trim() && filtros.categoria !== "Todas") {
        parametros.set("categoria", filtros.categoria);
    }

    const consulta = parametros.toString();

    return solicitar(`/productos${consulta ? `?${consulta}` : ""}`);
}

export async function obtenerProductoPorCodigo(codigo) {
    return solicitar(`/productos/${encodeURIComponent(codigo)}`);
}

export async function obtenerCategorias() {
    return solicitar("/categorias");
}

export async function crearProducto(producto) {
    return solicitar("/productos", {
        method: "POST",
        body: JSON.stringify(producto),
    });
}

export async function actualizarProducto(codigo, producto) {
    return solicitar(`/productos/${encodeURIComponent(codigo)}`, {
        method: "PUT",
        body: JSON.stringify(producto),
    });
}

export async function eliminarProducto(codigo) {
    return solicitar(`/productos/${encodeURIComponent(codigo)}`, {
        method: "DELETE",
    });
}
