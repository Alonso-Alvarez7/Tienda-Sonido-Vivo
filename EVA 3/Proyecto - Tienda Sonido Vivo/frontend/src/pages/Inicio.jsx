
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductoCard from "../components/ProductoCard.jsx";
import { obtenerProductos } from "../services/productosService.js";

function Inicio({ onAgregar }) {
    const navegar = useNavigate();

    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let vigente = true;

        async function cargarProductos() {
            setCargando(true);
            setError("");

            try {
                const datos = await obtenerProductos();

                if (vigente) {
                    // Mostramos hasta cuatro productos destacados.
                    setProductos(Array.isArray(datos) ? datos.slice(0, 4) : []);
                }
            } catch (e) {
                if (vigente) {
                    setError(e.message || "No fue posible cargar los productos.");
                }
            } finally {
                if (vigente) setCargando(false);
            }
        }

        cargarProductos();

        return () => {
            vigente = false;
        };
    }, []);

    function verDetalle(producto) {
        const codigo = producto.codigo ?? producto.id;
        navegar(`/productos/${encodeURIComponent(codigo)}`);
    }

    return (
        <>
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
                        <img
                            className="inicio-imagen-principal"
                            src="/imagen/img/PortadaInicio.png"
                            alt="Instrumentos y equipos musicales de Sonido Vivo"
                        />
                    </div>
                </div>
            </section>

            <section className="inicio-destacados">
                <div className="inicio-destacados-encabezado">
                    <p className="inicio-etiqueta">DESCUBRE SONIDO VIVO</p>
                    <h2>Productos destacados</h2>
                    <p>
                        Conoce algunos de los productos disponibles en nuestra tienda.
                    </p>
                </div>

                {cargando && (
                    <p role="status">Cargando productos destacados...</p>
                )}

                {!cargando && error && (
                    <p role="alert">
                        No se pudieron cargar los productos destacados: {error}
                    </p>
                )}

                {!cargando && !error && productos.length === 0 && (
                    <p>No hay productos disponibles por el momento.</p>
                )}

                {!cargando && !error && productos.length > 0 && (
                    <div className="productos-grid">
                        {productos.map((producto) => (
                            <ProductoCard
                                key={producto.codigo ?? producto.id}
                                producto={producto}
                                onAgregar={onAgregar}
                                onVerDetalle={verDetalle}
                            />
                        ))}
                    </div>
                )}

                <div className="inicio-destacados-accion">
                    <a href="#catalogo" className="inicio-boton">
                        Ver todo el catálogo
                    </a>
                </div>
            </section>
        </>
    );
}

export default Inicio;
