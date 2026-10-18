// Utilidades de seguridad.

// La clave nunca se guarda en texto plano: se guarda su hash SHA-256.
export async function hashearClave(clave) {
    const datos = new TextEncoder().encode(clave);
    const buffer = await crypto.subtle.digest("SHA-256", datos);
    return Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}