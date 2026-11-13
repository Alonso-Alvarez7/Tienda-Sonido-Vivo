import { describe, expect, it } from "vitest";
import {
  ROLES,
  cambiarEstadoUsuario,
  crearUsuario,
  iniciarSesion,
  listarUsuarios,
  obtenerSesion,
  tienePermiso,
} from "../auth/auth.js";

describe("iniciarSesion", () => {
  it("con credenciales válidas devuelve la sesión sin clave y la guarda", async () => {
    const sesion = await iniciarSesion("admin@sonidovivo.cl", "Admin1234");
    expect(sesion.rol).toBe(ROLES.ADMIN);
    expect(sesion).not.toHaveProperty("claveHash");
    expect(obtenerSesion().correo).toBe("admin@sonidovivo.cl");
  });

  it("con clave incorrecta lanza un mensaje genérico", async () => {
    await expect(
      iniciarSesion("admin@sonidovivo.cl", "ClaveMala1"),
    ).rejects.toThrow("Correo o contraseña incorrectos.");
    expect(obtenerSesion()).toBeNull();
  });
});

describe("gestión de usuarios", () => {
  it("crearUsuario normaliza el correo y no expone la clave", async () => {
    const nuevo = await crearUsuario({
      nombre: "  Laura  ",
      correo: " LAURA@Mail.cl ",
      clave: "Laura1234",
      rol: ROLES.CLIENTE,
    });
    expect(nuevo.correo).toBe("laura@mail.cl");
    expect(nuevo.nombre).toBe("Laura");
    expect(nuevo).not.toHaveProperty("claveHash");
    expect((await listarUsuarios()).length).toBe(4);
  });

  it("rechaza un correo repetido", async () => {
    await expect(
      crearUsuario({
        nombre: "Otro",
        correo: "admin@sonidovivo.cl",
        clave: "Otro12345",
        rol: ROLES.CLIENTE,
      }),
    ).rejects.toThrow("Ya existe un usuario con ese correo.");
  });

  it("no permite desactivar al único administrador activo", async () => {
    await listarUsuarios(); // crea los usuarios iniciales
    expect(() => cambiarEstadoUsuario(1, false)).toThrow(
      "No puedes desactivar al único administrador activo.",
    );
  });

  it("un usuario desactivado no puede iniciar sesión", async () => {
    await listarUsuarios();
    cambiarEstadoUsuario(3, false);
    await expect(
      iniciarSesion("cliente@sonidovivo.cl", "Cliente1234"),
    ).rejects.toThrow("Tu cuenta está desactivada");
  });
});

describe("tienePermiso", () => {
  it("permite solo los roles indicados y rechaza si no hay usuario", () => {
    const vendedor = { rol: ROLES.VENDEDOR };
    expect(tienePermiso(vendedor, [ROLES.VENDEDOR, ROLES.ADMIN])).toBe(true);
    expect(tienePermiso(vendedor, [ROLES.ADMIN])).toBe(false);
    expect(tienePermiso(null, [ROLES.ADMIN])).toBe(false);
  });
});