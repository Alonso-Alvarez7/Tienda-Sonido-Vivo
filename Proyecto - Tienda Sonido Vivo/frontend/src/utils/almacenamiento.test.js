import { describe, expect, it } from "vitest";
import { guardar, leer } from "../utils/almacenamiento.js";

describe("almacenamiento genérico", () => {
  it("leer devuelve el valor por defecto cuando la clave no existe", () => {
    expect(leer("pedidos", [])).toEqual([]);
  });

  it("guardar y leer conservan objetos; con JSON dañado vuelve el valor por defecto", () => {
    guardar("pedidos", [{ id: 5 }]);
    expect(leer("pedidos", [])).toEqual([{ id: 5 }]);

    localStorage.setItem("pedidos", "no es json");
    expect(leer("pedidos", "respaldo")).toBe("respaldo");
  });
});