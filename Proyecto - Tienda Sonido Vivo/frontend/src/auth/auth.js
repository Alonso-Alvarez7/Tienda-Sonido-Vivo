// Lógica de autenticación y usuarios (simulada con localStorage).
// Cuando exista el microservicio Spring Boot, solo cambia el interior de estas funciones.

export const ROLES = {
    ADMIN: "administrador",
    VENDEDOR: "vendedor",
    CLIENTE: "cliente",
};

const CLAVE_USUARIOS = "sonidoVivoUsuarios";
const CLAVE_SESION = "sonidoVivoSesion";
const DURACION_SESION_MS = 8 * 60 * 60 * 1000; // 8 horas

/* ---------- Utilidades ---------- */

// La clave nunca se guarda en texto plano: se guarda su hash SHA-256.
export async function hashearClave(clave) {
    const datos = new TextEncoder().encode(clave);
    const buffer = await crypto.subtle.digest("SHA-256", datos);
    return Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}

export function validarCorreo(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

// Mínimo 8 caracteres, al menos una letra y un número.
export function validarClave(clave) {
    return clave.length >= 8 && /[A-Za-z]/.test(clave) && /\d/.test(clave);
}

function leerUsuarios() {
    try {
        const guardados = localStorage.getItem(CLAVE_USUARIOS);
        return guardados ? JSON.parse(guardados) : null;
    } catch {
        return null;
    }
}

function guardarUsuarios(usuarios) {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

function sinClave(usuario) {
    const { claveHash, ...publico } = usuario;
    return publico;
}

/* ---------- Datos iniciales ---------- */

export async function asegurarSemilla() {
    if (leerUsuarios()) return;

    const semilla = [
        { id: 1, nombre: "Administrador", correo: "admin@sonidovivo.cl", clave: "Admin1234", rol: ROLES.ADMIN },
        { id: 2, nombre: "Vendedor", correo: "vendedor@sonidovivo.cl", clave: "Vendedor1234", rol: ROLES.VENDEDOR },
        { id: 3, nombre: "Cliente Demo", correo: "cliente@sonidovivo.cl", clave: "Cliente1234", rol: ROLES.CLIENTE },
    ];

    const usuarios = [];
    for (const { clave, ...resto } of semilla) {
        usuarios.push({ ...resto, activo: true, claveHash: await hashearClave(clave) });
    }
    guardarUsuarios(usuarios);
}

/* ---------- Sesión ---------- */

export function obtenerSesion() {
    try {
        const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION));
        if (!sesion || sesion.expira < Date.now()) {
            localStorage.removeItem(CLAVE_SESION);
            return null;
        }
        return sesion;
    } catch {
        return null;
    }
}

export async function iniciarSesion(correo, clave) {
    await asegurarSemilla();

    const usuario = leerUsuarios().find(
        (u) => u.correo === correo.trim().toLowerCase()
    );
    const hash = await hashearClave(clave);

    // Mensaje genérico: no revela si el correo existe o no.
    if (!usuario || usuario.claveHash !== hash) {
        throw new Error("Correo o contraseña incorrectos.");
    }
    if (!usuario.activo) {
        throw new Error("Tu cuenta está desactivada. Contacta al administrador.");
    }

    const sesion = {
        ...sinClave(usuario),
        token: crypto.randomUUID(),
        expira: Date.now() + DURACION_SESION_MS,
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

/* ---------- Registro público (siempre rol cliente) ---------- */

export async function registrarCliente({ nombre, correo, clave }) {
    return crearUsuario({ nombre, correo, clave, rol: ROLES.CLIENTE });
}

/* ---------- CRUD de usuarios (panel admin) ---------- */

export async function listarUsuarios() {
    await asegurarSemilla();
    return leerUsuarios().map(sinClave);
}

export async function crearUsuario({ nombre, correo, clave, rol }) {
    await asegurarSemilla();
    const usuarios = leerUsuarios();
    const correoNormalizado = correo.trim().toLowerCase();

    if (!nombre.trim()) throw new Error("El nombre es obligatorio.");
    if (!validarCorreo(correoNormalizado)) throw new Error("Correo no válido.");
    if (!validarClave(clave)) {
        throw new Error("La clave debe tener mínimo 8 caracteres, con letras y números.");
    }
    if (!Object.values(ROLES).includes(rol)) throw new Error("Rol no válido.");
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

export async function actualizarUsuario(id, { nombre, correo, rol, clave }) {
    const usuarios = leerUsuarios();
    const actual = usuarios.find((u) => u.id === id);
    if (!actual) throw new Error("Usuario no encontrado.");

    const correoNormalizado = correo.trim().toLowerCase();
    if (!nombre.trim()) throw new Error("El nombre es obligatorio.");
    if (!validarCorreo(correoNormalizado)) throw new Error("Correo no válido.");
    if (usuarios.some((u) => u.correo === correoNormalizado && u.id !== id)) {
        throw new Error("Ya existe un usuario con ese correo.");
    }
    if (actual.rol === ROLES.ADMIN && rol !== ROLES.ADMIN && contarAdminsActivos(usuarios) <= 1) {
        throw new Error("Debe existir al menos un administrador activo.");
    }

    const actualizado = { ...actual, nombre: nombre.trim(), correo: correoNormalizado, rol };

    // La clave solo se cambia si el admin escribió una nueva.
    if (clave) {
        if (!validarClave(clave)) {
            throw new Error("La clave debe tener mínimo 8 caracteres, con letras y números.");
        }
        actualizado.claveHash = await hashearClave(clave);
    }

    guardarUsuarios(usuarios.map((u) => (u.id === id ? actualizado : u)));
    return sinClave(actualizado);
}

export function cambiarEstadoUsuario(id, activo) {
    const usuarios = leerUsuarios();
    const objetivo = usuarios.find((u) => u.id === id);
    if (!objetivo) throw new Error("Usuario no encontrado.");

    if (!activo && objetivo.rol === ROLES.ADMIN && contarAdminsActivos(usuarios) <= 1) {
        throw new Error("No puedes desactivar al único administrador activo.");
    }
    guardarUsuarios(usuarios.map((u) => (u.id === id ? { ...u, activo } : u)));
}

function contarAdminsActivos(usuarios) {
    return usuarios.filter((u) => u.rol === ROLES.ADMIN && u.activo).length;
}