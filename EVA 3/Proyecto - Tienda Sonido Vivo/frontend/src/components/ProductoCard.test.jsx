import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductoCard from "./ProductoCard";

const producto = {
    id: "guitarra-1",
    nombre: "Guitarra Acústica Folk",
    categoria: "Guitarras Acústicas",
    marca: "Yamaha",
    modelo: "F310",
    precio: 129990,
    stock: 8,
    imagen: "/imagenes/guitarra.jpg",
};

describe("ProductoCard", () => {
    it("llama a la función para agregar el producto", () => {
        const onAgregar = vi.fn();

        render(
            <ProductoCard
                producto={producto}
                onAgregar={onAgregar}
                onVerDetalle={vi.fn()}
            />
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Agregar al carrito" })
        );

        expect(onAgregar).toHaveBeenCalledWith(producto);
    });

    it("deshabilita el botón cuando el producto no tiene stock", () => {
        const productoSinStock = { ...producto, stock: 0 };

        render(
            <ProductoCard
                producto={productoSinStock}
                onAgregar={vi.fn()}
                onVerDetalle={vi.fn()}
            />
        );

        expect(
            screen.getByRole("button", { name: "Sin stock" })
        ).toBeDisabled();
    });

    it("llama a la función para abrir el detalle del producto", () => {
        const onVerDetalle = vi.fn();

        render(
            <ProductoCard
                producto={producto}
                onAgregar={vi.fn()}
                onVerDetalle={onVerDetalle}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Ver detalle" }));

        expect(onVerDetalle).toHaveBeenCalledWith(producto);
    });
});