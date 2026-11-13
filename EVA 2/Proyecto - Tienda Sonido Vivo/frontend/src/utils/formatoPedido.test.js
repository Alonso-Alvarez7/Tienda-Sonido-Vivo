import { describe, expect, it } from "vitest";
import { codigoPedido } from "../utils/formatoPedido.js";

describe("codigoPedido", () => {
  it("rellena con ceros hasta 4 dígitos", () => {
    expect(codigoPedido(7)).toBe("PED-0007");
    expect(codigoPedido(120)).toBe("PED-0120");
  });

  it("no corta ids con más de 4 dígitos", () => {
    expect(codigoPedido(12345)).toBe("PED-12345");
  });
});