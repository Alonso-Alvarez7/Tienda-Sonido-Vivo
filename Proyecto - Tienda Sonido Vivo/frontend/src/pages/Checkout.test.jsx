import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Checkout from "./Checkout";

const producto = {
    id: "guitarra-1",
    nombre: "Guitarra Acústica Folk",
    precio: 129990,
    cantidad: 1,
};

describe("Checkout", () => {
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

    it("confirma el pedido cuando se envía el formulario", () => {
        const onConfirmar = vi.fn();

        render(
            <Checkout
                carrito={[producto]}
                onVolver={vi.fn()}
                onConfirmar={onConfirmar}
            />
        );

        fireEvent.change(screen.getByLabelText("Nombre completo"), {
            target: { value: "Benja" },
        });
        fireEvent.change(screen.getByLabelText("Correo electrónico"), {
            target: { value: "benja@ejemplo.cl" },
        });
        fireEvent.change(screen.getByLabelText("Teléfono"), {
            target: { value: "912345678" },
        });

        const boton = screen.getByRole("button", {
            name: "Confirmar pedido",
        });
        fireEvent.submit(boton.closest("form"));

        expect(onConfirmar).toHaveBeenCalled();
        expect(
            screen.getByRole("heading", { name: "¡Pedido confirmado!" })
        ).toBeInTheDocument();
    });
});