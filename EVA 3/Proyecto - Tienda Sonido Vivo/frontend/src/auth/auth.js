
import { hashearClave } from "../utils/seguridad";
import { validarCorreo, validarClave } from "../utils/validaciones";
import {
    leerUsuarios,
    guardarUsuarios,
    sinClave,
} from "../utils/almacenamientoUsuarios";

export const ROLES = {
    ADMIN: "administrador",
    VENDEDOR: "vendedor",
    CLIENTE: "cliente",
};

const CLAVE_SESION = "sonidoVivoSesion";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

async function solicitarAuth(endpoint, opciones = {}) {
    const respuesta = await fetch(`${API_URL}${endpoint}`, {
        ...opciones,
        headers: {
            "Content-Type": "application/json",
            ...opciones.headers,
        },
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

/**
 * Inicio de sesión conectado al backend Spring Boot.
 */
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

/* ---------- Registro público conectado al backend ---------- */

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

/* ---------- CRUD local de usuarios (pendiente de integrar al backend) ---------- */

export async function asegurarSemilla() {
    // Ya no se crean usuarios ficticios para iniciar sesión.
    // La autenticación y los usuarios reales pertenecen al backend.
}

export async function listarUsuarios() {
    await asegurarSemilla();
    return (leerUsuarios() || []).map(sinClave);
}

export async function crearUsuario({ nombre, correo, clave, rol }) {
    await asegurarSemilla();

    const usuarios = leerUsuarios() || [];
    const correoNormalizado = correo.trim().toLowerCase();

    if (!nombre.trim()) {
        throw new Error("El nombre es obligatorio.");
    }

    if (!validarCorreo(correoNormalizado)) {
        throw new Error("Correo no válido.");
    }

    if (!validarClave(clave)) {
        throw new Error(
            "La clave debe tener mínimo 8 caracteres, con letras y números."
        );
    }

    if (!Object.values(ROLES).includes(rol)) {
        throw new Error("Rol no válido.");
    }

    if (usuarios.some((u) => u.correo === correoNormalizado)) {
        throw new Error("Ya existe un usuario con ese correo.");
    }

    const nuevo = {
        id: Math.max(0, ...usuarios.map((u) => u.id)) + 1,
        nombre: nombre.trim(),
        correo: correoNormalizado,
        rol,
        activo: true,
        claveHash: await hashearClave(clave),
    };

    guardarUsuarios([...usuarios, nuevo]);

    return sinClave(nuevo);
}

export async function actualizarUsuario(
    id,
    { nombre, correo, rol, clave }
) {
    const usuarios = leerUsuarios() || [];
    const actual = usuarios.find((u) => u.id === id);

    if (!actual) {
        throw new Error("Usuario no encontrado.");
    }

    const correoNormalizado = correo.trim().toLowerCase();

    if (!nombre.trim()) {
        throw new Error("El nombre es obligatorio.");
    }

    if (!validarCorreo(correoNormalizado)) {
        throw new Error("Correo no válido.");
    }

    if (
        usuarios.some(
            (u) => u.correo === correoNormalizado && u.id !== id
        )
    ) {
        throw new Error("Ya existe un usuario con ese correo.");
    }

    if (
        actual.rol === ROLES.ADMIN &&
        rol !== ROLES.ADMIN &&
        contarAdminsActivos(usuarios) <= 1
    ) {
        throw new Error(
            "Debe existir al menos un administrador activo."
        );
    }

    const actualizado = {
        ...actual,
        nombre: nombre.trim(),
        correo: correoNormalizado,
        rol,
    };

    if (clave) {
        if (!validarClave(clave)) {
            throw new Error(
                "La clave debe tener mínimo 8 caracteres, con letras y números."
            );
        }

        actualizado.claveHash = await hashearClave(clave);
    }

    guardarUsuarios(
        usuarios.map((u) => (u.id === id ? actualizado : u))
    );

    return sinClave(actualizado);
}

export function cambiarEstadoUsuario(id, activo) {
    const usuarios = leerUsuarios() || [];
    const objetivo = usuarios.find((u) => u.id === id);

    if (!objetivo) {
        throw new Error("Usuario no encontrado.");
    }

    if (
        !activo &&
        objetivo.rol === ROLES.ADMIN &&
        contarAdminsActivos(usuarios) <= 1
    ) {
        throw new Error(
            "No puedes desactivar al único administrador activo."
        );
    }

    guardarUsuarios(
        usuarios.map((u) =>
            u.id === id ? { ...u, activo } : u
        )
    );
}

function contarAdminsActivos(usuarios) {
    return usuarios.filter(
        (u) => u.rol === ROLES.ADMIN && u.activo
    ).length;
}

export { hashearClave } from "../utils/seguridad";
export { validarCorreo, validarClave } from "../utils/validaciones";
