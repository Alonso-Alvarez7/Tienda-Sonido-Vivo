import { describe, expect, it } from "vitest";
import { hashearClave } from "../utils/seguridad.js";

describe("hashearClave", () => {
  it("genera el hash SHA-256 conocido y no devuelve la clave en texto plano", async () => {
    const hash = await hashearClave("abc");
    expect(hash).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    expect(hash).not.toContain("abc");
  });

  it("es determinista y distingue claves distintas", async () => {
    const primero = await hashearClave("Admin1234");
    const segundo = await hashearClave("Admin1234");
    const otro = await hashearClave("Admin12345");
    expect(primero).toBe(segundo);
    expect(primero).not.toBe(otro);
    expect(primero).toHaveLength(64);
  });
});