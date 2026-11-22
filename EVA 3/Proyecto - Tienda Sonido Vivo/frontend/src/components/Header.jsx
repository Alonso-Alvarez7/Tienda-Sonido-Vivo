import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "../auth/AuthContext.js";
import { obtenerProductos } from "../services/productosService.js";

const RETARDO_BUSQUEDA_MS = 300;
const MAX_SUGERENCIAS = 8;

function Header({ cantidadEnCarrito }) {
    const [texto, setTexto] = useState("");
    const [resultadosAbiertos, setResultadosAbiertos] = useState(false);
    // Última consulta terminada: { texto, items, error }
    const [consulta, setConsulta] = useState({ texto: "", items: [], error: "" });
    const contenedorRef = useRef(null);
    const { usuario, logout } = useAuth();
    const navegar = useNavigate();

    const textoBusqueda = texto.trim();

    // Consulta al backend (nombre o marca) con pequeña espera mientras se escribe
    useEffect(() => {
        if (!textoBusqueda) return;

        let vigente = true;

        const temporizador = setTimeout(async () => {
            try {
                const datos = await obtenerProductos({ texto: textoBusqueda });

                if (vigente) {
                    setConsulta({
                        texto: textoBusqueda,
                        items: Array.isArray(datos) ? datos : [],
                        error: "",
                    });
                }
            } catch (e) {
                if (vigente) {
                    setConsulta({
                        texto: textoBusqueda,
                        items: [],
                        error: e.message || "No fue posible buscar productos.",
                    });
                }
            }
        }, RETARDO_BUSQUEDA_MS);

        return () => {
            vigente = false;
            clearTimeout(temporizador);
        };
    }, [textoBusqueda]);

    // Solo se usan resultados que correspondan al texto actual
    const consultaActual = consulta.texto === textoBusqueda;
    const buscando = Boolean(textoBusqueda) && !consultaActual;
    const resultados = consultaActual ? consulta.items.slice(0, MAX_SUGERENCIAS) : [];
    const errorBusqueda = consultaActual ? consulta.error : "";

    // Cierra la lista al hacer clic fuera del buscador
    useEffect(() => {
        function cerrarSiClicFuera(evento) {
            if (
                contenedorRef.current &&
                !contenedorRef.current.contains(evento.target)
            ) {
                setResultadosAbiertos(false);
            }
        }

        document.addEventListener("mousedown", cerrarSiClicFuera);
        return () => document.removeEventListener("mousedown", cerrarSiClicFuera);
    }, []);

    function rutaProducto(producto) {
        return `/productos/${encodeURIComponent(producto.codigo ?? producto.id)}`;
    }

    function limpiarBusqueda() {
        setTexto("");
        setResultadosAbiertos(false);
    }

    function buscar(evento) {
        evento.preventDefault();

        if (!textoBusqueda) return;

        if (resultados.length > 0) {
            navegar(rutaProducto(resultados[0]));
            limpiarBusqueda();
        } else {
            setResultadosAbiertos(true);
        }
    }

    function salir() {
        logout();
        navegar("/");
    }

    return (
        <header className="encabezado">
            <div className="encabezado-marca">
                <h1>Sonido Vivo</h1>
                <p>Instrumentos y equipos para tu música</p>
            </div>

            <div className="buscador-contenedor" ref={contenedorRef}>
                <form
                    className="buscador"
                    onSubmit={buscar}
                    onKeyDown={(evento) => {
                        if (evento.key === "Escape") setResultadosAbiertos(false);
                    }}
                    role="search"
                >
                    <input
                        type="search"
                        placeholder="Buscar"
                        aria-label="Buscar productos"
                        value={texto}
                        onChange={(evento) => {
                            setTexto(evento.target.value);
                            setResultadosAbiertos(true);
                        }}
                        onFocus={() => setResultadosAbiertos(true)}
                    />
                    <button type="submit">Buscar</button>
                </form>

                {resultadosAbiertos && textoBusqueda && (
                    <ul className="buscador-resultados">
                        {buscando ? (
                            <li className="buscador-sin-resultados" role="status">
                                Buscando...
                            </li>
                        ) : errorBusqueda ? (
                            <li className="buscador-sin-resultados" role="alert">
                                No fue posible buscar: {errorBusqueda}
                            </li>
                        ) : resultados.length > 0 ? (
                            resultados.map((producto) => (
                                <li key={producto.codigo ?? producto.id}>
                                    <Link
                                        to={rutaProducto(producto)}
                                        onClick={limpiarBusqueda}
                                    >
                                        <span>{producto.nombre}</span>
                                        <span className="buscador-resultado-detalle">
                                            {producto.marca} · {producto.modelo}
                                        </span>
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <li className="buscador-sin-resultados">
                                No se encontraron productos.
                            </li>
                        )}
                    </ul>
                )}
            </div>

            <div className="encabezado-sesion">
                {usuario ? (
                    <>
                        <span className="encabezado-usuario">
                            Hola, {usuario.nombre}
                        </span>
                        <button className="boton-header" onClick={salir}>
                            Salir
                        </button>
                    </>
                ) : (
                    <>
                        <Link className="boton-header" to="/login">
                            Iniciar Sesión
                        </Link>
                        <Link className="boton-header boton-header-solido" to="/registro">
                            Crear Cuenta
                        </Link>
                    </>
                )}
            </div>

            <Navbar cantidadEnCarrito={cantidadEnCarrito} />
        </header>
    );
}

export default Header;