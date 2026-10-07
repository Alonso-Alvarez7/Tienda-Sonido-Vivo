function Footer() {
    return (
        <footer className="footer">

            <div className="footer-contenido">

                <div className="footer-marca">
                    <h2>Sonido Vivo</h2>

                    <p>
                        Instrumentos y equipos para tu música.
                    </p>
                </div>

                <div className="footer-enlaces">
                    <h3>Enlaces</h3>

                    <a href="#inicio">Inicio</a>
                    <a href="#catalogo">Productos</a>
                    <a href="#carrito">Carrito</a>
                </div>

                <div className="footer-contacto">
                    <h3>Contacto</h3>

                    <p>Email: contacto@sonidovivo.cl</p>
                    <p>Teléfono: +56 9 1234 5678</p>
                </div>

            </div>

            <div className="footer-final">
                <p>
                    © 2026 Sonido Vivo. Todos los derechos reservados.
                </p>
            </div>

        </footer>
    );
}

export default Footer;