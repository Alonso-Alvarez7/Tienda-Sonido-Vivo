import { Outlet } from "react-router-dom";

import Header from "../components/Header.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

/**
* Proviene del esquema compartido que antes estaba en App.jsx:
* Header + Navbar + main + Footer.
*
* <Outlet /> es el lugar donde React Router mostrará
* la página activa (Inicio, Productos, Contacto, etc.).
*/

export default function LayoutPrincipal() {
    return (
        <>
            <Header />
            <Navbar />
            <main className="main-container">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}