import { afterEach, describe, expect, it, vi } from "vitest";
import {
  guardarUsuarios,
  leerUsuarios,
  sinClave,
} from "../utils/almacenamientoUsuarios.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("almacenamientoUsuarios", () => {
  it("guarda usuarios y los recupera igual (ida y vuelta)", () => {
    const usuarios = [{ id: 1, nombre: "Ana", rol: "cliente" }];
    guardarUsuarios(usuarios);
    expect(leerUsuarios()).toEqual(usuarios);
  });

  it("devuelve null si no hay datos o el JSON guardado está dañado", () => {
    expect(leerUsuarios()).toBeNull();
    localStorage.setItem("sonidoVivoUsuarios", "{json roto");
    expect(leerUsuarios()).toBeNull();
  });

  it("sinClave quita el hash y conserva el resto de los datos", () => {
    const publico = sinClave({ id: 1, nombre: "Ana", claveHash: "abc123" });
    expect(publico).toEqual({ id: 1, nombre: "Ana" });
    expect(publico).not.toHaveProperty("claveHash");
  });

  it("guardarUsuarios escribe en localStorage con la clave esperada (spy)", () => {
    const espia = vi.spyOn(Storage.prototype, "setItem");
    const usuarios = [{ id: 2, nombre: "Beto" }];
    guardarUsuarios(usuarios);
    expect(espia).toHaveBeenCalledWith(
      "sonidoVivoUsuarios",
      JSON.stringify(usuarios),
    );
  });
});