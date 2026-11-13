import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

/**
 * Esquema compartido: Header (con Navbar) + contenido + Footer.
 * <Outlet /> es donde React Router muestra la página activa.
 * El carrito vive en App.jsx, por eso la cantidad y el total llegan por props.
 */
export default function LayoutPrincipal({ cantidadEnCarrito }) {
  const { pathname, search, hash, key } = useLocation();

  // Al navegar: baja hasta el ancla (#catalogo) o vuelve arriba si no hay ninguna
  useEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, search, hash, key]);

  return (
    <>
      <Header
        cantidadEnCarrito={cantidadEnCarrito}
      />
      <div className="main-container">
        <Outlet />
      </div>
      <Footer />
    </>
  );
}