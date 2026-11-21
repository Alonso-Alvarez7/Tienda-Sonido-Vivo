import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Productos from "./Productos";
import {
    obtenerCategorias,
    obtenerProductos,
} from "../services/productosService";

// Mock del servicio: no se hace ninguna petición real al backend.
vi.mock("../services/productosService", () => ({
    obtenerProductos: vi.fn(),
    obtenerCategorias: vi.fn(),
}));

// Datos con la misma forma que ProductoResponse del backend (id = código).
const guitarra = {
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

const teclado = {
    id: "TC001",
    codigo: "TC001",
    nombre: "Teclado Digital 61 teclas",
    marca: "Casio",
    modelo: "CT-S300",
    descripcion: "61 teclas sensibles al tacto.",
    precio: 249990,
    stock: 4,
    imagen: "/imagen/productos/TC001.jpg",
    categoriaId: 2,
    categoria: "Teclados y Pianos",
    activo: true,
};

const catalogo = [guitarra, teclado];

const categorias = [
    { id: 1, nombre: "Guitarras Acústicas", descripcion: null },
    { id: 2, nombre: "Teclados y Pianos", descripcion: null },
];

function renderizar() {
    return render(<Productos onAgregar={vi.fn()} onVerDetalle={vi.fn()} />);
}

describe("Productos (con API simulada)", () => {
    beforeEach(() => {
        obtenerProductos.mockReset();
        obtenerCategorias.mockReset();

        obtenerCategorias.mockResolvedValue(categorias);

        // Simula el filtrado que hace el backend (texto en nombre/marca y categoría).
        obtenerProductos.mockImplementation(
            async ({ texto = "", categoria = "Todas" } = {}) =>
                catalogo.filter(
                    (p) =>
                        `${p.nombre} ${p.marca}`
                            .toLowerCase()
                            .includes(texto.toLowerCase()) &&
                        (categoria === "Todas" || p.categoria === categoria)
                )
        );
    });

    it("muestra los productos que entrega la API al cargar", async () => {
        renderizar();

        expect(await screen.findByText(guitarra.nombre)).toBeInTheDocument();
        expect(screen.getByText(teclado.nombre)).toBeInTheDocument();
        expect(obtenerProductos).toHaveBeenCalledWith({
            texto: "",
            categoria: "Todas",
        });
    });

    it("envía el texto de búsqueda al servicio y muestra el resultado", async () => {
        renderizar();
        await screen.findByText(guitarra.nombre);

        fireEvent.change(screen.getByLabelText("Buscar por nombre o marca"), {
            target: { value: "Yamaha" },
        });

        await waitFor(() =>
            expect(obtenerProductos).toHaveBeenLastCalledWith({
                texto: "Yamaha",
                categoria: "Todas",
            })
        );

        expect(await screen.findByText(guitarra.nombre)).toBeInTheDocument();
        expect(screen.queryByText(teclado.nombre)).not.toBeInTheDocument();
    });

    it("carga las categorías desde la API y envía la seleccionada", async () => {
        renderizar();

        // Las opciones vienen de obtenerCategorias()
        await screen.findByRole("option", { name: "Teclados y Pianos" });

        fireEvent.change(screen.getByLabelText("Filtrar por categoría"), {
            target: { value: "Teclados y Pianos" },
        });

        await waitFor(() =>
            expect(obtenerProductos).toHaveBeenLastCalledWith({
                texto: "",
                categoria: "Teclados y Pianos",
            })
        );

        expect(await screen.findByText(teclado.nombre)).toBeInTheDocument();
        expect(screen.queryByText(guitarra.nombre)).not.toBeInTheDocument();
    });

    it("muestra un mensaje cuando la API no devuelve productos", async () => {
        obtenerProductos.mockResolvedValue([]);

        renderizar();

        expect(
            await screen.findByText("No se encontraron productos.")
        ).toBeInTheDocument();
    });

    it("muestra el error cuando falla la consulta al backend", async () => {
        obtenerProductos.mockRejectedValue(new Error("Error HTTP 500"));

        renderizar();

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Error HTTP 500"
        );
    });
});