import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";
import { ROLES } from "../auth/auth";

function Navbar({ cantidadEnCarrito }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { usuario } = useAuth();

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  // Marca el enlace de la página actual (en negrita)
  const claseActiva = ({ isActive }) => (isActive ? "activo" : undefined);

  const esVendedor =
    usuario?.rol === ROLES.VENDEDOR || usuario?.rol === ROLES.ADMIN;

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
        <NavLink to="/" end className={claseActiva} onClick={cerrarMenu}>
          Inicio
        </NavLink>
        <Link to="/#catalogo" onClick={cerrarMenu}>
          Productos
        </Link>
        <NavLink to="/nosotros" className={claseActiva} onClick={cerrarMenu}>
          Nosotros
        </NavLink>
        <NavLink to="/blog" className={claseActiva} onClick={cerrarMenu}>
          Blog
        </NavLink>
        <NavLink to="/contacto" className={claseActiva} onClick={cerrarMenu}>
          Contacto
        </NavLink>

        {usuario?.rol === ROLES.CLIENTE && (
          <NavLink to="/mis-pedidos" className={claseActiva} onClick={cerrarMenu}>
            Mis pedidos
          </NavLink>
        )}

        {esVendedor && (
          <NavLink to="/vendedor" className={claseActiva} onClick={cerrarMenu}>
            Panel vendedor
          </NavLink>
        )}

        {usuario?.rol === ROLES.ADMIN && (
          <NavLink to="/admin" className={claseActiva} onClick={cerrarMenu}>
            Admin
          </NavLink>
        )}
      </div>

      <Link
        className="boton-carrito"
        to="/carrito"
        onClick={cerrarMenu}
        aria-label={`Carrito: ${cantidadEnCarrito} producto(s)`}
      >
        <span aria-hidden="true">🛒</span> Carrito ({cantidadEnCarrito})
      </Link>
    </nav>
  );
}

export default Navbar;