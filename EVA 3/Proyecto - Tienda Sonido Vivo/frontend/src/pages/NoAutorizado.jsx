import { Link } from "react-router-dom";

function NoAutorizado() {
    return (
        <main className="auth-pagina">
            <div className="auth-formulario">
                <h1>Acceso denegado</h1>
                <p>No tienes permisos para ver esta página.</p>
                <Link to="/">Volver al inicio</Link>
            </div>
        </main>
    );
}

export default NoAutorizado;