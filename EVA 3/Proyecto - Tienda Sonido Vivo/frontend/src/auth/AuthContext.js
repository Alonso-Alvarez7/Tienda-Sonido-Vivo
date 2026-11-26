import {
    createContext,
    createElement,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    obtenerSesion,
    iniciarSesion,
    cerrarSesion,
    registrarCliente,
} from "./auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => obtenerSesion());

    async function login(correo, clave) {
        const sesion = await iniciarSesion(correo, clave);
        setUsuario(sesion);
        return sesion;
    }

    function logout() {
        cerrarSesion();
        setUsuario(null);
    }

    async function registrar(datos) {
        await registrarCliente(datos);
        return login(datos.correo, datos.clave);
    }

    // Cierra la sesión cuando llega su hora de expiración.
    useEffect(() => {
        if (!usuario?.expira) return undefined;

        const tiempoRestante = Number(usuario.expira) - Date.now();

        if (tiempoRestante <= 0) {
            cerrarSesion();
            setUsuario(null);
            return undefined;
        }

        const temporizador = window.setTimeout(() => {
            cerrarSesion();
            setUsuario(null);
        }, tiempoRestante);

        return () => window.clearTimeout(temporizador);
    }, [usuario]);

    // Escucha los 401 de la API para cerrar una sesión inválida.
    useEffect(() => {
        function manejarSesionInvalida() {
            cerrarSesion();
            setUsuario(null);
        }

        window.addEventListener(
            "sonidoVivoSesionInvalida",
            manejarSesionInvalida
        );

        return () => {
            window.removeEventListener(
                "sonidoVivoSesionInvalida",
                manejarSesionInvalida
            );
        };
    }, []);

    return createElement(
        AuthContext.Provider,
        { value: { usuario, login, logout, registrar } },
        children
    );
}

export function useAuth() {
    const contexto = useContext(AuthContext);

    if (!contexto) {
        throw new Error("useAuth debe usarse dentro de <AuthProvider>");
    }

    return contexto;
}