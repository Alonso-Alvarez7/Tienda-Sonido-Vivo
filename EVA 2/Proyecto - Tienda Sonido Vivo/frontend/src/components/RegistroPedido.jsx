import { useAuth } from "../auth/AuthContext.js";
import { crearPedido } from "../data/pedidos";

/**
 * Envuelve al Checkout sin modificarlo: escucha el envío de su formulario,
 * lee los datos del cliente y guarda el pedido para que el vendedor lo vea.
 */
function RegistroPedido({ carrito, children }) {
    const { usuario } = useAuth();

    function registrarPedido(evento) {
        if (carrito.length === 0) return;

        const datos = new FormData(evento.target);

        crearPedido({
            cliente: {
                nombre: datos.get("nombre") ?? "",
                correo: datos.get("correo") ?? "",
                telefono: datos.get("telefono") ?? "",
            },
            entrega: datos.get("entrega") ?? "retiro",
            direccion: datos.get("direccion") ?? "",
            items: carrito.map((producto) => ({
                id: producto.id,
                nombre: producto.nombre,
                marca: producto.marca,
                modelo: producto.modelo,
                precio: producto.precio,
                cantidad: producto.cantidad,
            })),
            usuarioId: usuario?.id ?? null,
        });
    }

    return <div onSubmitCapture={registrarPedido}>{children}</div>;
}

export default RegistroPedido;