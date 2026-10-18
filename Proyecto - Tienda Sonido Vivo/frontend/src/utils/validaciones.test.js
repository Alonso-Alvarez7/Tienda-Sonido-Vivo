import { describe, expect, it } from "vitest";
import { validarClave, validarCorreo } from "../utils/validaciones.js";

describe("validarCorreo", () => {
  it("acepta un correo con formato válido", () => {
    expect(validarCorreo("cliente@sonidovivo.cl")).toBe(true);
  });

  it("rechaza un correo sin arroba", () => {
    expect(validarCorreo("cliente.sonidovivo.cl")).toBe(false);
  });

  it("rechaza un correo sin dominio", () => {
    expect(validarCorreo("cliente@sonidovivo")).toBe(false);
  });
});

describe("validarClave", () => {
  it("acepta una clave de 8 o más caracteres con letras y números", () => {
    expect(validarClave("Admin1234")).toBe(true);
  });

  it("rechaza claves cortas o sin letras y números", () => {
    expect(validarClave("Ab1")).toBe(false);
    expect(validarClave("soloLetras")).toBe(false);
    expect(validarClave("12345678")).toBe(false);
  });
});