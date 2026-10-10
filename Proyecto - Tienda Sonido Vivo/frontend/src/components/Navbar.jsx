import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  function cerrarMenu() {
    setMenuAbierto(false);
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
      </div>
    </nav>
  );
}

export default Navbar;