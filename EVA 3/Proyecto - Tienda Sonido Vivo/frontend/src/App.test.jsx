import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import App from "./App";
import {
    obtenerCategorias,
    obtenerProductoPorCodigo,
    obtenerProductos,
} from "./services/productosService";

vi.mock("./auth/AuthContext.js", () => ({
    AuthProvider: ({ children }) => children,
    useAuth: () => ({ usuario: null, logout: () => { } }),
}));

// Mock del servicio: Inicio, Productos y Header ya no leen datos estáticos.
vi.mock("./services/productosService", () => ({
    obtenerProductos: vi.fn(),
    obtenerProductoPorCodigo: vi.fn(),
    obtenerCategorias: vi.fn(),
}));

// Misma forma que ProductoResponse del backend (id = código).
const productoGuardado = {
    id: "GA001",
    codigo: "GA001",
    nombre: "Guitarra Acústica Folk",
    marca: "Yamaha",
    modelo: "F310",
    precio: 129990,
    cantidad: 2,
    stock: 8,
    imagen: "/imagen/productos/GA001.jpg",
};

const productoApi = {
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

describe("Persistencia del carrito", () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem(
            "sonidoVivoCarrito",
            JSON.stringify([productoGuardado])
        );

        vi.spyOn(window, "scrollTo").mockImplementation(() => { });

        obtenerProductos.mockReset();
        obtenerCategorias.mockReset();
        obtenerProductoPorCodigo.mockReset();

        obtenerProductos.mockResolvedValue([productoApi]);
        obtenerCategorias.mockResolvedValue([
            { id: 1, nombre: "Guitarras Acústicas", descripcion: null },
        ]);
        obtenerProductoPorCodigo.mockResolvedValue(productoApi);
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

    it("suma la cantidad al agregar el mismo producto dos veces", async () => {
        localStorage.setItem("sonidoVivoCarrito", "[]");

        render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        // Las tarjetas aparecen cuando responde el servicio simulado.
        await screen.findAllByRole("button", { name: "Agregar al carrito" });

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

    it("no permite agregar más unidades que el stock disponible", async () => {
        localStorage.setItem("sonidoVivoCarrito", "[]");

        render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        // El producto aparece en destacados (Inicio) y en el catálogo (Productos).
        const titulos = await screen.findAllByRole("heading", {
            name: "Guitarra Acústica Folk",
        });
        const tarjeta = titulos[0].closest("article");
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