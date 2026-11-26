import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MisPedidos from "./MisPedidos";
import { obtenerPedidosCliente } from "../services/pedidosService.js";

vi.mock("../auth/AuthContext.js", () => ({
    useAuth: () => ({
        usuario: { id: 3, nombre: "Cliente Demo", rol: "cliente" },
    }),
}));

vi.mock("../services/pedidosService.js", () => ({
    obtenerPedidosCliente: vi.fn(),
}));

describe("MisPedidos", () => {
    beforeEach(() => {
        obtenerPedidosCliente.mockReset();
    });

    it("muestra mensaje cuando el cliente no tiene pedidos", async () => {
        obtenerPedidosCliente.mockResolvedValue([]);

        render(
            <MemoryRouter>
                <MisPedidos />
            </MemoryRouter>
        );

        expect(await screen.findByText(/Aún no tienes pedidos/i)).toBeInTheDocument();
    });

    it("renderiza los pedidos devueltos por la API", async () => {
        obtenerPedidosCliente.mockResolvedValue([
            {
                id: 12,
                codigo: "PED-0012",
                fecha: "2026-11-26T15:00:00",
                estado: "En preparación",
                entrega: "despacho",
                direccion: "Av. Libertad 1234",
                total: 129990,
                items: [{ id: "GA001", nombre: "Guitarra Acústica Folk", cantidad: 1 }],
            },
        ]);

        render(
            <MemoryRouter>
                <MisPedidos />
            </MemoryRouter>
        );

        expect(await screen.findByRole("heading", { name: "PED-0012" })).toBeInTheDocument();
        expect(screen.getByText("En preparación")).toBeInTheDocument();
        expect(screen.getByText("Despacho a: Av. Libertad 1234")).toBeInTheDocument();
        expect(screen.getByText("Guitarra Acústica Folk × 1")).toBeInTheDocument();
    });

    it("muestra alerta si falla la carga desde el backend", async () => {
        obtenerPedidosCliente.mockRejectedValue(new Error("Token expirado"));

        render(
            <MemoryRouter>
                <MisPedidos />
            </MemoryRouter>
        );

        expect(await screen.findByRole("alert")).toHaveTextContent("Token expirado");
    });
});