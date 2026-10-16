// Formato de datos de pedidos.

export function codigoPedido(id) {
    return `PED-${String(id).padStart(4, "0")}`;
}