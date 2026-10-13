import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";
import { ROLES } from "../auth/auth";

function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { usuario, logout } = useAuth();
  const navegar = useNavigate();

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  function salir() {
    logout();
    cerrarMenu();
    navegar("/");
  }

  return (
    <nav className="navbar">
      <button
        className="navbar-boton"
        onClick={() => setMenuAbierto(!menuAbierto)}
        aria-expanded={menuAbierto}
        aria-label="Abrir o cerrar menú"
      >
        ☰
      </button>

      <div className={`navbar-enlaces ${menuAbierto ? "abierto" : ""}`}>
        <Link to="/" onClick={cerrarMenu}>Inicio</Link>
        <Link to="/#catalogo" onClick={cerrarMenu}>Productos</Link>
        <Link to="/carrito" onClick={cerrarMenu}>Carrito</Link>

        {usuario?.rol === ROLES.ADMIN && (
          <Link to="/admin" onClick={cerrarMenu}>Admin</Link>
        )}

        {usuario ? (
          <>
            <span className="navbar-usuario">Hola, {usuario.nombre}</span>
            <button className="navbar-salir" onClick={salir}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={cerrarMenu}>Ingresar</Link>
            <Link to="/registro" onClick={cerrarMenu}>Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;