import { useState } from "react";

function Navbar() {
    const [menuAbierto, setMenuAbierto] = useState(false);

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
                <a href="#inicio" onClick={() => setMenuAbierto(false)}>
                    Inicio
                </a>
                <a href="#catalogo" onClick={() => setMenuAbierto(false)}>
                    Productos
                </a>
                <a href="#carrito" onClick={() => setMenuAbierto(false)}>
                    Carrito
                </a>
            </div>
        </nav>
    );
}

export default Navbar;