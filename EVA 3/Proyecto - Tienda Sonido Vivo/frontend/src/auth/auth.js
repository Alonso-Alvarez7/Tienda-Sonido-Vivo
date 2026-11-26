import { validarCorreo, validarClave } from "../utils/validaciones";

export const ROLES = {
    ADMIN: "administrador",
    VENDEDOR: "vendedor",
    CLIENTE: "cliente",
};

const CLAVE_SESION = "sonidoVivoSesion";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const ROLES_API = {
    [ROLES.ADMIN]: "ADMIN",
    [ROLES.VENDEDOR]: "VENDEDOR",
    [ROLES.CLIENTE]: "CLIENTE",
};

const ROLES_FRONTEND = {
    ADMIN: ROLES.ADMIN,
    VENDEDOR: ROLES.VENDEDOR,
    CLIENTE: ROLES.CLIENTE,
};

async function leerRespuesta(respuesta) {
    const resultado = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        throw new Error(
            resultado?.mensaje ||
                resultado?.message ||
                `Error HTTP ${respuesta.status}`,
        );
    }

    return resultado?.data ?? resultado;
}

async function solicitarAuth(endpoint, opciones = {}) {
    const respuesta = await fetch(`${API_URL}${endpoint}`, {
        ...opciones,
        headers: {
            "Content-Type": "application/json",
            ...opciones.headers,
        },
    });

    return leerRespuesta(respuesta);
}

function usuarioDesdeApi(usuario) {
    return {
        ...usuario,
        rol:
            ROLES_FRONTEND[String(usuario.rol).toUpperCase()] ??
            usuario.rol,
    };
}

async function solicitarUsuarios(endpoint, opciones = {}) {
    const sesion = obtenerSesion();

    if (!sesion?.token) {
        throw new Error("Debes iniciar sesión para administrar usuarios.");
    }

    const respuesta = await fetch(`${API_URL}${endpoint}`, {
        ...opciones,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sesion.token}`,
            ...opciones.headers,
        },
    });

    if (respuesta.status === 401) {
        cerrarSesion();
        window.dispatchEvent(new Event("sonidoVivoSesionInvalida"));
    }

    return leerRespuesta(respuesta);
}

/* ---------- Sesión ---------- */

export function obtenerSesion() {
    try {
        const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION));

        if (!sesion || !sesion.token || sesion.expira <= Date.now()) {
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
    const respuesta = await solicitarAuth("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            correo: correo.trim().toLowerCase(),
            clave,
        }),
    });

    const sesion = {
        id: respuesta.id,
        nombre: respuesta.nombre,
        correo: respuesta.correo,
        rol: respuesta.rol,
        token: respuesta.token,
        expira: respuesta.expira,
    };

    if (!sesion.token) {
        throw new Error("El servidor no entregó un token de autenticación.");
    }

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

/* ---------- Administración de usuarios mediante la API ---------- */

export async function asegurarSemilla() {
    // Los usuarios reales se obtienen y administran desde el backend.
}

export async function listarUsuarios() {
    const usuarios = await solicitarUsuarios("/usuarios");
    return usuarios.map(usuarioDesdeApi);
}

export async function crearUsuario({ nombre, correo, clave, rol }) {
    const nombreNormalizado = nombre.trim();
    const correoNormalizado = correo.trim().toLowerCase();

    if (!nombreNormalizado) {
        throw new Error("El nombre es obligatorio.");
    }

    if (!validarCorreo(correoNormalizado)) {
        throw new Error("Correo no válido.");
    }

    if (!validarClave(clave)) {
        throw new Error(
            "La clave debe tener mínimo 8 caracteres, con letras y números.",
        );
    }

    if (!ROLES_API[rol]) {
        throw new Error("Rol no válido.");
    }

    const creado = await solicitarUsuarios("/usuarios", {
        method: "POST",
        body: JSON.stringify({
            nombre: nombreNormalizado,
            correo: correoNormalizado,
            clave,
            rol: ROLES_API[rol],
        }),
    });

    return usuarioDesdeApi(creado);
}

export async function actualizarUsuario(id, { rol }) {
    if (!ROLES_API[rol]) {
        throw new Error("Rol no válido.");
    }

    const actualizado = await solicitarUsuarios(`/usuarios/${id}/rol`, {
        method: "PATCH",
        body: JSON.stringify({
            rol: ROLES_API[rol],
        }),
    });

    return usuarioDesdeApi(actualizado);
}

export async function cambiarEstadoUsuario(id, activo) {
    const actualizado = await solicitarUsuarios(`/usuarios/${id}/estado`, {
        method: "PATCH",
        body: JSON.stringify({ activo }),
    });

    return usuarioDesdeApi(actualizado);
}

export { validarCorreo, validarClave } from "../utils/validaciones";
export { hashearClave } from "../utils/seguridad";