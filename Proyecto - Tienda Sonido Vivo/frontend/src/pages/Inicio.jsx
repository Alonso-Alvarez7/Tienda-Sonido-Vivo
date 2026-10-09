function Inicio() {
    return (
        <section className="inicio" id="inicio">

            <div className="inicio-contenido">

                <div className="inicio-texto">
                    <p className="inicio-etiqueta">
                        SONIDO VIVO
                    </p>

                    <h1>
                        Todo lo que necesitas
                        <br />
                        para hacer música
                    </h1>

                    <p className="inicio-descripcion">
                        Encuentra instrumentos, equipos de audio y
                        accesorios para llevar tu música al siguiente nivel.
                    </p>

                    <a href="#catalogo" className="inicio-boton">
                        Ver productos
                    </a>
                </div>

                <div className="inicio-imagen">
                    <div className="inicio-imagen-placeholder">
                        <span>Imagen principal</span>
                    </div>
                </div>

            </div>

        </section>
    );
}

export default Inicio;