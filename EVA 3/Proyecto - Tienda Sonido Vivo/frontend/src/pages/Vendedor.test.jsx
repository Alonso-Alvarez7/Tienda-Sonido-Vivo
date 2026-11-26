import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Vendedor from "./Vendedor";
import {
    obtenerPedidos,
    cambiarEstadoPedidoApi,
} from "../services/pedidosService.js";
import {
    obtenerProductos,
    actualizarStockProducto,
} from "../services/productosService.js";

vi.mock("../auth/AuthContext.js", () => ({
    useAuth: () => ({
        usuario: { id: 2, nombre: "Vendedor Demo", rol: "vendedor" },
    }),
}));

vi.mock("../services/pedidosService.js", () => ({
    obtenerPedidos: vi.fn(),
    cambiarEstadoPedidoApi: vi.fn(),
}));

vi.mock("../services/productosService.js", () => ({
    obtenerProductos: vi.fn(),
    actualizarStockProducto: vi.fn(),
}));

const pedidoMock = {
    id: 1,
    codigo: "PED-0001",
    usuarioId: 3,
    fecha: "2026-11-26T14:00:00",
    estado: "En preparación",
    entrega: "despacho",
    direccion: "Calle Falsa 123",
    telefonoContacto: "912345678",
    total: 129990,
    items: [{ id: "GA001", nombre: "Guitarra Acústica Folk", cantidad: 1 }],
};

const productoMock = {
    codigo: "GA001",
    nombre: "Guitarra Acústica Folk",
    marca: "Yamaha",
    categoria: "Guitarras Acústicas",
    stock: 5,
};

describe("Vendedor", () => {
    beforeEach(() => {
        obtenerPedidos.mockReset();
        cambiarEstadoPedidoApi.mockReset();
        obtenerProductos.mockReset();
        actualizarStockProducto.mockReset();

        obtenerPedidos.mockResolvedValue([pedidoMock]);
        obtenerProductos.mockResolvedValue([productoMock]);
    });

    it("lista pedidos y permite cambiar su estado", async () => {
        cambiarEstadoPedidoApi.mockResolvedValue({
            ...pedidoMock,
            estado: "Despachado",
        });

        render(<Vendedor />);

        expect(await screen.findByRole("heading", { name: "PED-0001" })).toBeInTheDocument();

        const selector = screen.getByLabelText("Cambiar estado");
        fireEvent.change(selector, { target: { value: "Despachado" } });

        await waitFor(() => {
            expect(cambiarEstadoPedidoApi).toHaveBeenCalledWith(1, "Despachado");
        });
    });

    it("permite ajustar el stock usando actualizarStockProducto en la pestaña Stock", async () => {
        actualizarStockProducto.mockResolvedValue({
            ...productoMock,
            stock: 6,
        });

        render(<Vendedor />);

        fireEvent.click(screen.getByRole("tab", { name: "Stock" }));

        expect(await screen.findByText("GA001")).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Sumar uno al stock de Guitarra Acústica Folk",
            })
        );

        await waitFor(() => {
            expect(actualizarStockProducto).toHaveBeenCalledWith("GA001", 6);
        });
    });
});