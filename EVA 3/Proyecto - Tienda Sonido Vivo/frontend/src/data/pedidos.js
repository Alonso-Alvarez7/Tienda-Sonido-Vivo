export { codigoPedido } from "../utils/formatoPedido";

export const ESTADOS_PEDIDO = ["En preparación", "Despachado", "Entregado"];

export const CLASE_ESTADO = {
    "En preparación": "pedido-estado--preparacion",
    "Despachado": "pedido-estado--despachado",
    "Entregado": "pedido-estado--entregado",
};