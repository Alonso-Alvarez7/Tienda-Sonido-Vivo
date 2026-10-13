import { Outlet } from "react-router-dom";

import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

/**
 * Esquema compartido: Header (con Navbar) + contenido + Footer.
 * <Outlet /> es donde React Router muestra la página activa.
 * El carrito vive en App.jsx, por eso la cantidad llega por props.
 */
export default function LayoutPrincipal({ cantidadEnCarrito }) {
  return (
    <>
      <Header cantidadEnCarrito={cantidadEnCarrito} />
      <div className="main-container">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}