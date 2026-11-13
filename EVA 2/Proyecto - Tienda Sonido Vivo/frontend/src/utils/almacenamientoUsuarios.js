// Lectura y escritura de usuarios en localStorage (simulado).
// Cuando exista el microservicio Spring Boot, esto se reemplaza por llamadas a la API.

const CLAVE_USUARIOS = "sonidoVivoUsuarios";

export function leerUsuarios() {
    try {
        const guardados = localStorage.getItem(CLAVE_USUARIOS);
        return guardados ? JSON.parse(guardados) : null;
    } catch {
        return null;
    }
}

export function guardarUsuarios(usuarios) {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

// Devuelve el usuario sin su hash de clave.
export function sinClave(usuario) {
    const { claveHash, ...publico } = usuario;
    return publico;
}