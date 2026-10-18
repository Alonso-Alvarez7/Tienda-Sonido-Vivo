import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import App from "./App";

vi.mock("./auth/AuthContext.js", () => ({
    AuthProvider: ({ children }) => children,
    useAuth: () => ({ usuario: null, logout: () => { } }),
}));

const productoGuardado = {
    id: "GA001",
    nombre: "Guitarra Acústica Folk",
    marca: "Yamaha",
    modelo: "F310",
    precio: 129990,
    cantidad: 2,
    stock: 8,
    imagen: "/imagen/productos/GA001.jpg",
};

describe("Persistencia del carrito", () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem(
            "sonidoVivoCarrito",
            JSON.stringify([productoGuardado])
        );

        vi.spyOn(window, "scrollTo").mockImplementation(() => { });
    });

    it("recupera del almacenamiento el producto y su cantidad", () => {
        render(
            <MemoryRouter initialEntries={["/carrito"]}>
                <App />
            </MemoryRouter>
        );

        expect(
            screen.getByRole("heading", { name: "Guitarra Acústica Folk" })
        ).toBeInTheDocument();

        expect(screen.getByText("2")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Carrito: 2 producto(s)" })
        ).toBeInTheDocument();
    });

    it("suma la cantidad al agregar el mismo producto dos veces", () => {
        localStorage.setItem("sonidoVivoCarrito", "[]");

        render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        const botonAgregar = () =>
            screen.getAllByRole("button", { name: "Agregar al carrito" })[0];

        fireEvent.click(botonAgregar());
        fireEvent.click(botonAgregar());

        expect(
            screen.getByRole("link", { name: "Carrito: 2 producto(s)" })
        ).toBeInTheDocument();

        const carritoGuardado = JSON.parse(
            localStorage.getItem("sonidoVivoCarrito")
        );
        expect(carritoGuardado[0].cantidad).toBe(2);
    });

    it("no permite agregar más unidades que el stock disponible", () => {
        localStorage.setItem("sonidoVivoCarrito", "[]");

        render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        const tituloProducto = screen.getByRole("heading", {
            name: "Guitarra Acústica Folk",
        });
        const tarjeta = tituloProducto.closest("article");
        const botonAgregar = within(tarjeta).getByRole("button", {
            name: "Agregar al carrito",
        });

        for (let i = 0; i < 9; i++) {
            fireEvent.click(botonAgregar);
        }

        const carritoGuardado = JSON.parse(
            localStorage.getItem("sonidoVivoCarrito")
        );

        expect(carritoGuardado[0].cantidad).toBe(8);
    });
});