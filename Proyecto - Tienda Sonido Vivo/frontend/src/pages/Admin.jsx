import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.js";
import {
  ROLES,
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
} from "../auth/auth";

const FORMULARIO_VACIO = { id: null, nombre: "", correo: "", rol: ROLES.CLIENTE, clave: "" };

function Admin() {
  const { usuario: sesion } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const editando = formulario.id !== null;

  async function cargar() {
    setUsuarios(await listarUsuarios());
  }

  useEffect(() => {
    cargar();
  }, []);

  function cambiar(evento) {
    setFormulario({ ...formulario, [evento.target.name]: evento.target.value });
  }

  function limpiar() {
    setFormulario(FORMULARIO_VACIO);
    setError("");
  }

  async function guardar(evento) {
    evento.preventDefault();
    setError("");
    setMensaje("");

    try {
      if (editando) {
        await actualizarUsuario(formulario.id, formulario);
        setMensaje("Usuario actualizado.");
      } else {
        await crearUsuario(formulario);
        setMensaje("Usuario creado.");
      }
      limpiar();
      cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  function editar(u) {
    setMensaje("");
    setFormulario({ id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol, clave: "" });
  }

  function alternarEstado(u) {
    setError("");
    setMensaje("");
    try {
      cambiarEstadoUsuario(u.id, !u.activo);
      cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <main className="admin">
      <h1>Panel de administración</h1>
      <p>Gestión de usuarios del sistema.</p>

      {error && <p className="auth-error" role="alert">{error}</p>}
      {mensaje && <p className="admin-ok" role="status">{mensaje}</p>}

      <form className="admin-formulario" onSubmit={guardar} noValidate>
        <h2>{editando ? "Editar usuario" : "Nuevo usuario"}</h2>

        <label>
          Nombre
          <input name="nombre" value={formulario.nombre} onChange={cambiar} />
        </label>
        <label>
          Correo
          <input name="correo" type="email" value={formulario.correo} onChange={cambiar} />
        </label>
        <label>
          Rol
          <select name="rol" value={formulario.rol} onChange={cambiar}>
            {Object.values(ROLES).map((rol) => (
              <option key={rol} value={rol}>{rol}</option>
            ))}
          </select>
        </label>
        <label>
          {editando ? "Nueva contraseña (opcional)" : "Contraseña"}
          <input name="clave" type="password" value={formulario.clave} onChange={cambiar} />
        </label>

        <div className="admin-botones">
          <button type="submit">{editando ? "Guardar cambios" : "Crear usuario"}</button>
          {editando && (
            <button type="button" className="boton-secundario" onClick={limpiar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="tabla-contenedor">
        <table className="tabla-admin">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.correo}</td>
                <td>{u.rol}</td>
                <td>{u.activo ? "Activo" : "Desactivado"}</td>
                <td className="admin-botones">
                  <button onClick={() => editar(u)}>Editar</button>
                  <button
                    className="boton-secundario"
                    onClick={() => alternarEstado(u)}
                    disabled={u.id === sesion.id}
                  >
                    {u.activo ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Admin;