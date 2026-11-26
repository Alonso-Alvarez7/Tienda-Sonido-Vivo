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

    useEffect(() => {
        function manejarSesionInvalida() {
            setUsuario(null);
        }

        window.addEventListener(
            "sonidoVivoSesionInvalida",
            manejarSesionInvalida,
        );

        return () => {
            window.removeEventListener(
                "sonidoVivoSesionInvalida",
                manejarSesionInvalida,
            );
        };
    }, []);

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

    return createElement(
        AuthContext.Provider,
        {
            value: {
                usuario,
                login,
                logout,
                registrar,
            },
        },
        children,
    );
}

export function useAuth() {
    const contexto = useContext(AuthContext);

    if (!contexto) {
        throw new Error("useAuth debe usarse dentro de <AuthProvider>");
    }

    return contexto;
}