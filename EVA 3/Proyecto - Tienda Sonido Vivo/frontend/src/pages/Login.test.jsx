import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "../pages/Login.jsx";
import { useAuth } from "../auth/AuthContext";

// Mock: se aísla el Login de la lógica real de autenticación.
vi.mock("../auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const login = vi.fn();

function renderizarLogin() {
  const resultado = render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<h1>Destino administrador</h1>} />
      </Routes>
    </MemoryRouter>,
  );
  return resultado.container.querySelector("form");
}

function escribir(etiqueta, valor) {
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } });
}

describe("Login (validación del formulario)", () => {
  beforeEach(() => {
    login.mockReset();
    vi.mocked(useAuth).mockReturnValue({ login });
  });

  it("muestra error si el correo no es válido y no llama a login", () => {
    const formulario = renderizarLogin();
    escribir("Correo electrónico", "correo-malo");
    escribir("Contraseña", "Admin1234");
    fireEvent.submit(formulario);
    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa un correo válido.");
    expect(login).not.toHaveBeenCalled();
  });

  it("muestra error si falta la contraseña", () => {
    const formulario = renderizarLogin();
    escribir("Correo electrónico", "admin@sonidovivo.cl");
    fireEvent.submit(formulario);
    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa tu contraseña.");
  });

  it("muestra el mensaje de error cuando el login es rechazado", async () => {
    login.mockRejectedValue(new Error("Correo o contraseña incorrectos."));
    const formulario = renderizarLogin();
    escribir("Correo electrónico", "admin@sonidovivo.cl");
    escribir("Contraseña", "Mala12345");
    fireEvent.submit(formulario);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Correo o contraseña incorrectos.",
    );
  });

  it("llama a login con los datos ingresados y navega según el rol", async () => {
    login.mockResolvedValue({ rol: "administrador" });
    const formulario = renderizarLogin();
    escribir("Correo electrónico", "admin@sonidovivo.cl");
    escribir("Contraseña", "Admin1234");
    fireEvent.submit(formulario);
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Destino administrador" }),
      ).toBeInTheDocument(),
    );
    expect(login).toHaveBeenCalledWith("admin@sonidovivo.cl", "Admin1234");
  });
});