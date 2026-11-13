import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Productos from "./Productos";

vi.mock("../data/productos", () => ({
    productos: [
        {
            id: "guitarra-1",
            nombre: "Guitarra Acústica",
            categoria: "Guitarras",
            marca: "Yamaha",
            modelo: "F310",
            precio: 129990,
            stock: 8,
            imagen: "/guitarra.jpg",
        },
        {
            id: "teclado-1",
            nombre: "Teclado Digital",
            categoria: "Teclados",
            marca: "Roland",
            modelo: "E-X10",
            precio: 199990,
            stock: 5,
            imagen: "/teclado.jpg",
        },
    ],
}));

describe("Productos", () => {
    it("busca productos por nombre o marca", () => {
        render(<Productos onAgregar={vi.fn()} onVerDetalle={vi.fn()} />);

        fireEvent.change(
            screen.getByLabelText("Buscar por nombre o marca"),
            { target: { value: "Yamaha" } }
        );

        expect(screen.getByText("Guitarra Acústica")).toBeInTheDocument();
        expect(screen.queryByText("Teclado Digital")).not.toBeInTheDocument();
    });

    it("filtra los productos por categoría", () => {
        render(<Productos onAgregar={vi.fn()} onVerDetalle={vi.fn()} />);

        fireEvent.change(
            screen.getByLabelText("Filtrar por categoría"),
            { target: { value: "Teclados" } }
        );

        expect(screen.getByText("Teclado Digital")).toBeInTheDocument();
        expect(screen.queryByText("Guitarra Acústica")).not.toBeInTheDocument();
    });
});