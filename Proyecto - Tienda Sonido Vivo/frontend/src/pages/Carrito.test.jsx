import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Carrito from "./Carrito";

const producto = {
    id: "guitarra-1",
    nombre: "Guitarra Acústica Folk",
    marca: "Yamaha",
    modelo: "F310",
    precio: 129990,
    cantidad: 1,
    stock: 8,
    imagen: "/imagenes/guitarra.jpg",
};

describe("Carrito", () => {
    it("muestra un mensaje cuando está vacío", () => {
        render(
            <Carrito
                carrito={[]}
                onCambiarCantidad={vi.fn()}
                onEliminar={vi.fn()}
                onCheckout={vi.fn()}
            />
        );

        expect(screen.getByText("Tu carrito está vacío.")).toBeInTheDocument();
    });

    it("solicita cambiar la cantidad al presionar el botón más", () => {
        const onCambiarCantidad = vi.fn();

        render(
            <Carrito
                carrito={[producto]}
                onCambiarCantidad={onCambiarCantidad}
                onEliminar={vi.fn()}
                onCheckout={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "+" }));

        expect(onCambiarCantidad).toHaveBeenCalledWith("guitarra-1", 2);
    });

    it("solicita quitar el producto al presionar Quitar", () => {
        const onEliminar = vi.fn();

        render(
            <Carrito
                carrito={[producto]}
                onCambiarCantidad={vi.fn()}
                onEliminar={onEliminar}
                onCheckout={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Quitar" }));

        expect(onEliminar).toHaveBeenCalledWith("guitarra-1");
    });

    it("deshabilita el botón + cuando la cantidad llega al stock", () => {
        const productoAlMaximo = { ...producto, cantidad: producto.stock };

        render(
            <Carrito
                carrito={[productoAlMaximo]}
                onCambiarCantidad={vi.fn()}
                onEliminar={vi.fn()}
                onCheckout={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: "+" })).toBeDisabled();
    });
});