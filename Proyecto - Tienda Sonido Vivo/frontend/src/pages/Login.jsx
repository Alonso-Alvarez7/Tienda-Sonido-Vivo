import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ROLES, validarCorreo } from "../auth/auth";

function Login() {
    const { login } = useAuth();
    const navegar = useNavigate();
    const ubicacion = useLocation();

    const [correo, setCorreo] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    async function enviar(evento) {
        evento.preventDefault();
        setError("");

        if (!validarCorreo(correo.trim())) {
            setError("Ingresa un correo válido.");
            return;
        }
        if (!clave) {
            setError("Ingresa tu contraseña.");
            return;
        }

        setCargando(true);
        try {
            const sesion = await login(correo, clave);
            const destinoPorRol = sesion.rol === ROLES.CLIENTE ? "/" : "/admin";
            navegar(ubicacion.state?.desde ?? destinoPorRol, { replace: true });
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    }

    return (
        <main className="auth-pagina">
            <form className="auth-formulario" onSubmit={enviar} noValidate>
                <h1>Iniciar sesión</h1>

                {error && <p className="auth-error" role="alert">{error}</p>}

                <label>
                    Correo electrónico
                    <input
                        type="email"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        autoComplete="username"
                    />
                </label>

                <label>
                    Contraseña
                    <input
                        type="password"
                        value={clave}
                        onChange={(e) => setClave(e.target.value)}
                        autoComplete="current-password"
                    />
                </label>

                <button type="submit" disabled={cargando}>
                    {cargando ? "Ingresando..." : "Ingresar"}
                </button>

                <p>
                    ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
                </p>
            </form>
        </main>
    );
}

export default Login;