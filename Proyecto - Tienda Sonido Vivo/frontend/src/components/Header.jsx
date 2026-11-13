import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "../auth/AuthContext.js";
import { productos } from "../data/productos";

function Header({ cantidadEnCarrito }) {
    const [texto, setTexto] = useState("");
    const [resultadosAbiertos, setResultadosAbiertos] = useState(false);
    const contenedorRef = useRef(null);
    const { usuario, logout } = useAuth();
    const navegar = useNavigate();

    // Misma lógica de búsqueda que Productos.jsx: por nombre o marca
    const textoBusqueda = texto.trim().toLowerCase();
    const resultados = textoBusqueda
        ? productos.filter(
            (producto) =>
                producto.nombre.toLowerCase().includes(textoBusqueda) ||
                producto.marca.toLowerCase().includes(textoBusqueda)
        )
        : [];

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

    function limpiarBusqueda() {
        setTexto("");
        setResultadosAbiertos(false);
    }

    function buscar(evento) {
        evento.preventDefault();

        if (resultados.length > 0) {
            navegar(`/productos/${resultados[0].id}`);
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
                        {resultados.length > 0 ? (
                            resultados.map((producto) => (
                                <li key={producto.id}>
                                    <Link
                                        to={`/productos/${producto.id}`}
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