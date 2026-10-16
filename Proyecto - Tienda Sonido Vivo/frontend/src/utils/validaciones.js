// Validaciones de formularios de usuario.

export function validarCorreo(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

// Mínimo 8 caracteres, al menos una letra y un número.
export function validarClave(clave) {
    return clave.length >= 8 && /[A-Za-z]/.test(clave) && /\d/.test(clave);
}