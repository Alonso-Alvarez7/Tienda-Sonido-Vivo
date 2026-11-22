import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductoCard from "./ProductoCard";

// Misma forma que ProductoResponse del backend (el id expuesto es el código).
const producto = {
    id: "GA001",
    codigo: "GA001",
    nombre: "Guitarra Acústica Folk",
    marca: "Yamaha",
    modelo: "F310",
    descripcion: "Tapa de abeto, aros y fondo de meranti.",
    precio: 129990,
    stock: 8,
    imagen: "/imagen/productos/GA001.jpg",
    categoriaId: 1,
    categoria: "Guitarras Acústicas",
    activo: true,
};

describe("ProductoCard", () => {
    it("muestra los datos del producto tal como los entrega la API", () => {
        render(
            <ProductoCard
                producto={producto}
                onAgregar={vi.fn()}
                onVerDetalle={vi.fn()}
            />
        );

        expect(screen.getByText("Guitarras Acústicas")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: producto.nombre })
        ).toBeInTheDocument();
        expect(screen.getByText("Yamaha")).toBeInTheDocument();
        expect(screen.getByText("F310")).toBeInTheDocument();
        expect(
            screen.getByText(`$${producto.precio.toLocaleString("es-CL")} CLP`)
        ).toBeInTheDocument();
        expect(screen.getByText("Stock disponible: 8")).toBeInTheDocument();
        expect(screen.getByRole("img")).toHaveAttribute(
            "src",
            "/imagen/productos/GA001.jpg"
        );
    });

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