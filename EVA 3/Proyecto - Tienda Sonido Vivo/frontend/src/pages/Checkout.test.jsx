import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Checkout from "./Checkout";
import { crearPedidoApi } from "../services/pedidosService.js";

vi.mock("../auth/AuthContext.js", () => ({
    useAuth: () => ({
        usuario: { id: 3, nombre: "Cliente Demo", correo: "cliente@sonidovivo.cl" },
    }),
}));

vi.mock("../services/pedidosService.js", () => ({
    crearPedidoApi: vi.fn(),
}));

const producto = {
    id: "GA001",
    codigo: "GA001",
    nombre: "Guitarra Acústica Folk",
    precio: 129990,
    cantidad: 1,
};

describe("Checkout", () => {
    beforeEach(() => {
        crearPedidoApi.mockReset();
    });

    it("deshabilita la confirmación si el carrito está vacío", () => {
        render(
            <Checkout
                carrito={[]}
                onVolver={vi.fn()}
                onConfirmar={vi.fn()}
            />
        );

        expect(
            screen.getByRole("button", { name: "Confirmar pedido" })
        ).toBeDisabled();
    });

    it("exige los datos y valida el formato del correo", () => {
        render(
            <Checkout
                carrito={[producto]}
                onVolver={vi.fn()}
                onConfirmar={vi.fn()}
            />
        );

        const nombre = screen.getByLabelText("Nombre completo");
        const correo = screen.getByLabelText("Correo electrónico");
        const telefono = screen.getByLabelText("Teléfono");

        expect(nombre).toBeRequired();
        expect(correo).toBeRequired();
        expect(telefono).toBeRequired();

        fireEvent.change(correo, { target: { value: "correo-no-valido" } });
        expect(correo).toBeInvalid();
    });

    it("pide dirección al elegir despacho y la oculta al elegir retiro", () => {
        render(
            <Checkout
                carrito={[producto]}
                onVolver={vi.fn()}
                onConfirmar={vi.fn()}
            />
        );

        fireEvent.click(screen.getByLabelText("Despacho"));

        const direccion = screen.getByLabelText("Dirección de despacho");
        expect(direccion).toBeRequired();

        fireEvent.click(screen.getByLabelText("Retiro en tienda"));
        expect(
            screen.queryByLabelText("Dirección de despacho")
        ).not.toBeInTheDocument();
    });

    it("confirma el pedido en la API y muestra el código de seguimiento", async () => {
        const onConfirmar = vi.fn();
        crearPedidoApi.mockResolvedValue({
            id: 1,
            codigo: "PED-0001",
            estado: "En preparación",
            total: 129990,
        });

        render(
            <Checkout
                carrito={[producto]}
                onVolver={vi.fn()}
                onConfirmar={onConfirmar}
            />
        );

        fireEvent.change(screen.getByLabelText("Teléfono"), {
            target: { value: "912345678" },
        });

        const boton = screen.getByRole("button", {
            name: "Confirmar pedido",
        });
        fireEvent.submit(boton.closest("form"));

        await waitFor(() => {
            expect(onConfirmar).toHaveBeenCalled();
        });

        expect(
            screen.getByRole("heading", { name: "¡Pedido confirmado!" })
        ).toBeInTheDocument();
        expect(screen.getByText("PED-0001")).toBeInTheDocument();
    });

    it("muestra alerta y no vacía el carrito si el backend rechaza el pedido", async () => {
        const onConfirmar = vi.fn();
        crearPedidoApi.mockRejectedValue(
            new Error("Stock insuficiente para 'Guitarra Acústica Folk'.")
        );

        render(
            <Checkout
                carrito={[producto]}
                onVolver={vi.fn()}
                onConfirmar={onConfirmar}
            />
        );

        fireEvent.change(screen.getByLabelText("Teléfono"), {
            target: { value: "912345678" },
        });

        const boton = screen.getByRole("button", {
            name: "Confirmar pedido",
        });
        fireEvent.submit(boton.closest("form"));

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Stock insuficiente para 'Guitarra Acústica Folk'."
        );
        expect(onConfirmar).not.toHaveBeenCalled();
    });
});