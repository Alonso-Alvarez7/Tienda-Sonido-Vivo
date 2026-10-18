// Lectura y escritura genérica en localStorage (simulado).
// Cuando exista el backend, estas funciones dejan de usarse.

export function leer(clave, porDefecto) {
    try {
        const guardado = localStorage.getItem(clave);
        return guardado ? JSON.parse(guardado) : porDefecto;
    } catch {
        return porDefecto;
    }
}

export function guardar(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}