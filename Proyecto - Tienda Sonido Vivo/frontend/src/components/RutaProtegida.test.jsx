import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RutaProtegida from "../components/RutaProtegida.jsx";
import { useAuth } from "../auth/AuthContext.js";

// Mock: se reemplaza el contexto real para controlar quién tiene sesión.
vi.mock("../auth/AuthContext.js", () => ({
  useAuth: vi.fn(),
}));

function renderizarRuta(roles) {
  render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route
          path="/admin"
          element={
            <RutaProtegida roles={roles}>
              <p>Contenido privado</p>
            </RutaProtegida>
          }
        />
        <Route path="/login" element={<p>Pantalla de login</p>} />
        <Route path="/no-autorizado" element={<p>Sin permiso</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RutaProtegida", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
  });

  it("redirige a /login cuando no hay sesión", () => {
    vi.mocked(useAuth).mockReturnValue({ usuario: null });
    renderizarRuta(["administrador"]);
    expect(screen.getByText("Pantalla de login")).toBeInTheDocument();
    expect(screen.queryByText("Contenido privado")).not.toBeInTheDocument();
  });

  it("redirige a /no-autorizado si el rol no corresponde", () => {
    vi.mocked(useAuth).mockReturnValue({ usuario: { rol: "cliente" } });
    renderizarRuta(["administrador"]);
    expect(screen.getByText("Sin permiso")).toBeInTheDocument();
  });

  it("muestra el contenido si el rol está permitido", () => {
    vi.mocked(useAuth).mockReturnValue({ usuario: { rol: "administrador" } });
    renderizarRuta(["administrador"]);
    expect(screen.getByText("Contenido privado")).toBeInTheDocument();
  });
});