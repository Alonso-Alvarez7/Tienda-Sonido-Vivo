import Navbar from "./Navbar";

function Header({ cantidadEnCarrito }) {
    return (
        <header className="encabezado" >
            <div className="encabezado-marca">
                <h1>Sonido Vivo</h1>
                <p>Instrumentos y equipos para tu música</p>
            </div>

            <Navbar />

            <p className="encabezado-carrito">
                Carrito: {cantidadEnCarrito} producto(s)
            </p>
        </header>
    );
}

export default Header;