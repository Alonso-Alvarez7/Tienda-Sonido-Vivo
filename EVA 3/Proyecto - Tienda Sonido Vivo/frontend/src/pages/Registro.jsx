import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { validarClave, validarCorreo } from "../auth/auth";

function Registro() {
    const { registrar } = useAuth();
    const navegar = useNavigate();

    const [datos, setDatos] = useState({ nombre: "", correo: "", clave: "", repetir: "" });
    const [error, setError] = useState("");

    function cambiar(evento) {
        setDatos({ ...datos, [evento.target.name]: evento.target.value });
    }

    async function enviar(evento) {
        evento.preventDefault();
        setError("");

        if (!datos.nombre.trim()) return setError("El nombre es obligatorio.");
        if (!validarCorreo(datos.correo.trim())) return setError("Ingresa un correo válido.");
        if (!validarClave(datos.clave)) {
            return setError("La clave debe tener mínimo 8 caracteres, con letras y números.");
        }
        if (datos.clave !== datos.repetir) return setError("Las contraseñas no coinciden.");

        try {
            await registrar(datos);
            navegar("/", { replace: true });
        } catch (e) {
            setError(e.message);
        }
    }

    return (
        <main className="auth-pagina">
            <form className="auth-formulario" onSubmit={enviar} noValidate>
                <h1>Crear cuenta</h1>

                {error && <p className="auth-error" role="alert">{error}</p>}

                <label>
                    Nombre completo
                    <input name="nombre" value={datos.nombre} onChange={cambiar} />
                </label>
                <label>
                    Correo electrónico
                    <input name="correo" type="email" value={datos.correo} onChange={cambiar} />
                </label>
                <label>
                    Contraseña
                    <input name="clave" type="password" value={datos.clave} onChange={cambiar} />
                </label>
                <label>
                    Repetir contraseña
                    <input name="repetir" type="password" value={datos.repetir} onChange={cambiar} />
                </label>

                <button type="submit">Registrarme</button>

                <p>
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
            </form>
        </main>
    );
}

export default Registro;