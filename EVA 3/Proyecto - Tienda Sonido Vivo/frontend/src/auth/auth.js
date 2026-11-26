// Autenticación y administración de usuarios mediante el backend.

export const ROLES = {
    ADMIN: "administrador",
    VENDEDOR: "vendedor",
    CLIENTE: "cliente",
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const CLAVE_SESION = "sonidoVivoSesion";
const DURACION_SESION_MS = 8 * 60 * 60 * 1000;

async function solicitarAuth(endpoint, opciones = {}) {
    const respuesta = await fetch(`${API_URL}${endpoint}`, {
        ...opciones,
        headers: {
            "Content-Type": "application/json",
            ...opciones.headers,
        },
    });

    const resultado = await respuesta.json().catch(() => null);

    if (respuesta.status === 401 && endpoint !== "/auth/login") {
        localStorage.removeItem(CLAVE_SESION);
        window.dispatchEvent(new Event("sonidoVivoSesionInvalida"));
    }
    
    if (!respuesta.ok || resultado?.ok === false) {
        throw new Error(
            resultado?.mensaje || `Error HTTP ${respuesta.status}`
        );
    }

    return resultado;
}

async function solicitarAdmin(endpoint, opciones = {}) {
    const sesion = obtenerSesion();

    if (!sesion?.token) {
        throw new Error("Inicia sesión nuevamente para administrar usuarios.");
    }

    const resultado = await solicitarAuth(endpoint, {
        ...opciones,
        headers: {
            Authorization: `Bearer ${sesion.token}`,
            ...opciones.headers,
        },
    });

    return resultado?.data;
}

/* ---------- Sesión ---------- */

export function obtenerSesion() {
    try {
        const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION));

        if (
            !sesion?.token ||
            !sesion?.expira ||
            Number(sesion.expira) <= Date.now()
        ) {
            localStorage.removeItem(CLAVE_SESION);
            return null;
        }

        return sesion;
    } catch {
        localStorage.removeItem(CLAVE_SESION);
        return null;
    }
}

export async function iniciarSesion(correo, clave) {
    const resultado = await solicitarAuth("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            correo: correo.trim().toLowerCase(),
            clave,
        }),
    });

    const datos = resultado?.data;

    if (!datos?.token) {
        throw new Error("El backend no devolvió un token de autenticación.");
    }

    const sesion = {
        ...datos,
        expira: Number(datos.expira) || Date.now() + DURACION_SESION_MS,
    };

    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    return sesion;
}

export function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
}

export function tienePermiso(usuario, rolesPermitidos) {
    return Boolean(usuario) && rolesPermitidos.includes(usuario.rol);
}

/* ---------- Registro público ---------- */

export async function registrarCliente({ nombre, correo, clave }) {
    return solicitarAuth("/auth/registro", {
        method: "POST",
        body: JSON.stringify({
            nombre: nombre.trim(),
            correo: correo.trim().toLowerCase(),
            clave,
        }),
    });
}

/* ---------- Administración de usuarios ---------- */

const ROL_A_API = {
    [ROLES.ADMIN]: "ADMIN",
    [ROLES.VENDEDOR]: "VENDEDOR",
    [ROLES.CLIENTE]: "CLIENTE",
};

const ROL_DESDE_API = {
    ADMIN: ROLES.ADMIN,
    VENDEDOR: ROLES.VENDEDOR,
    CLIENTE: ROLES.CLIENTE,
};

export async function listarUsuarios() {
    const usuarios = await solicitarAdmin("/usuarios");

    return (usuarios || []).map((usuario) => ({
        ...usuario,
        rol: ROL_DESDE_API[usuario.rol] || usuario.rol.toLowerCase(),
    }));
}

export async function crearUsuario({ nombre, correo, clave, rol }) {
    return solicitarAdmin("/usuarios", {
        method: "POST",
        body: JSON.stringify({
            nombre: nombre.trim(),
            correo: correo.trim().toLowerCase(),
            clave,
            rol: ROL_A_API[rol] || rol,
        }),
    });
}

export async function actualizarUsuario(id, { rol }) {
    return solicitarAdmin(`/usuarios/${id}/rol`, {
        method: "PATCH",
        body: JSON.stringify({
            rol: ROL_A_API[rol] || rol,
        }),
    });
}

export async function cambiarEstadoUsuario(id, activo) {
    return solicitarAdmin(`/usuarios/${id}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ activo }),
    });
}

/* AuthContext llama esta función al iniciar; los usuarios ahora están en el backend. */
export async function asegurarSemilla() {
    // No se crean usuarios de prueba en el almacenamiento local.
}

export { hashearClave } from "../utils/seguridad";
export { validarCorreo, validarClave } from "../utils/validaciones";