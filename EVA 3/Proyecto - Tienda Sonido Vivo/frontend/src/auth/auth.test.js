import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ROLES,
  actualizarUsuario,
  cambiarEstadoUsuario,
  crearUsuario,
  iniciarSesion,
  listarUsuarios,
  obtenerSesion,
  registrarCliente,
  tienePermiso,
} from "../auth/auth.js";

function respuestaApi(data, status = 200, mensaje = null) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({
      ok: status >= 200 && status < 300,
      data,
      mensaje,
    }),
  };
}

function guardarSesionPrueba() {
  localStorage.setItem(
    "sonidoVivoSesion",
    JSON.stringify({
      id: 1,
      correo: "admin@sonidovivo.cl",
      rol: ROLES.ADMIN,
      token: "token-de-prueba",
      expira: Date.now() + 60 * 60 * 1000,
    })
  );
}

describe("autenticación con el backend", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("inicia sesión, guarda el JWT y devuelve los datos del usuario", async () => {
    fetch.mockResolvedValue(
      respuestaApi({
        id: 1,
        nombre: "Administrador",
        correo: "admin@sonidovivo.cl",
        rol: ROLES.ADMIN,
        token: "jwt-de-prueba",
        expira: Date.now() + 60 * 60 * 1000,
      })
    );

    const sesion = await iniciarSesion(
      " ADMIN@sonidovivo.cl ",
      "ClavePrueba123"
    );

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          correo: "admin@sonidovivo.cl",
          clave: "ClavePrueba123",
        }),
      })
    );

    expect(sesion.token).toBe("jwt-de-prueba");
    expect(obtenerSesion().correo).toBe("admin@sonidovivo.cl");
  });

  it("muestra el mensaje del backend cuando falla el inicio de sesión", async () => {
    fetch.mockResolvedValue(
      respuestaApi(
        null,
        401,
        "Correo o contraseña incorrectos."
      )
    );

    await expect(
      iniciarSesion("admin@sonidovivo.cl", "ClaveIncorrecta")
    ).rejects.toThrow("Correo o contraseña incorrectos.");

    expect(obtenerSesion()).toBeNull();
  });

  it("registra un cliente mediante la API", async () => {
    fetch.mockResolvedValue(
      respuestaApi(null, 201, "Cuenta creada correctamente")
    );

    await registrarCliente({
      nombre: "Cliente de prueba",
      correo: " PRUEBA@SONIDOVIVO.CL ",
      clave: "ClavePrueba123",
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/auth/registro",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          nombre: "Cliente de prueba",
          correo: "prueba@sonidovivo.cl",
          clave: "ClavePrueba123",
        }),
      })
    );
  });

  it("borra una sesión vencida", () => {
    localStorage.setItem(
      "sonidoVivoSesion",
      JSON.stringify({
        token: "token-vencido",
        expira: Date.now() - 1000,
      })
    );

    expect(obtenerSesion()).toBeNull();
    expect(localStorage.getItem("sonidoVivoSesion")).toBeNull();
  });
});

describe("administración de usuarios con el backend", () => {
  beforeEach(() => {
    localStorage.clear();
    guardarSesionPrueba();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lista usuarios y convierte los roles de la API", async () => {
    fetch.mockResolvedValue(
      respuestaApi([
        {
          id: 1,
          nombre: "Administrador",
          correo: "admin@sonidovivo.cl",
          rol: "ADMIN",
          activo: true,
        },
      ])
    );

    const usuarios = await listarUsuarios();

    expect(usuarios[0].rol).toBe(ROLES.ADMIN);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/usuarios",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-de-prueba",
        }),
      })
    );
  });

  it("crea un usuario enviando el rol que espera el backend", async () => {
    fetch.mockResolvedValue(
      respuestaApi({
        id: 2,
        nombre: "Vendedor prueba",
        correo: "vendedor@sonidovivo.cl",
        rol: "VENDEDOR",
        activo: true,
      }, 201)
    );

    await crearUsuario({
      nombre: "Vendedor prueba",
      correo: " vendedor@sonidovivo.cl ",
      clave: "ClavePrueba123",
      rol: ROLES.VENDEDOR,
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/usuarios",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer token-de-prueba",
        }),
        body: JSON.stringify({
          nombre: "Vendedor prueba",
          correo: "vendedor@sonidovivo.cl",
          clave: "ClavePrueba123",
          rol: "VENDEDOR",
        }),
      })
    );
  });

  it("cambia el rol enviando el token de administrador", async () => {
    fetch.mockResolvedValue(
      respuestaApi({
        id: 2,
        rol: "VENDEDOR",
        activo: true,
      })
    );

    await actualizarUsuario(2, { rol: ROLES.VENDEDOR });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/usuarios/2/rol",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          Authorization: "Bearer token-de-prueba",
        }),
        body: JSON.stringify({ rol: "VENDEDOR" }),
      })
    );
  });

  it("activa o desactiva un usuario mediante la API", async () => {
    fetch.mockResolvedValue(
      respuestaApi({
        id: 2,
        activo: false,
      })
    );

    await cambiarEstadoUsuario(2, false);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8080/api/usuarios/2/estado",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ activo: false }),
      })
    );
  });

  it("borra la sesión cuando una petición protegida recibe 401", async () => {
    const eventoSesionInvalida = vi.fn();

    window.addEventListener(
      "sonidoVivoSesionInvalida",
      eventoSesionInvalida
    );

    fetch.mockResolvedValue(
      respuestaApi(null, 401, "Token inválido.")
    );

    try {
      await expect(listarUsuarios()).rejects.toThrow("Token inválido.");
      expect(localStorage.getItem("sonidoVivoSesion")).toBeNull();
      expect(eventoSesionInvalida).toHaveBeenCalledOnce();
    } finally {
      window.removeEventListener(
        "sonidoVivoSesionInvalida",
        eventoSesionInvalida
      );
    }
  });
});

describe("tienePermiso", () => {
  it("permite solo los roles indicados y rechaza si no hay usuario", () => {
    const vendedor = { rol: ROLES.VENDEDOR };

    expect(
      tienePermiso(vendedor, [ROLES.VENDEDOR, ROLES.ADMIN])
    ).toBe(true);

    expect(
      tienePermiso(vendedor, [ROLES.ADMIN])
    ).toBe(false);

    expect(
      tienePermiso(null, [ROLES.ADMIN])
    ).toBe(false);
  });
});