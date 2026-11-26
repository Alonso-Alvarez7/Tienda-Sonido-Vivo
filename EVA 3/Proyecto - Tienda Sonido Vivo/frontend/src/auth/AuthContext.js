
import {
    createContext,
    createElement,
    useContext,
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

        // Después de registrar, inicia sesión con las credenciales reales.
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
        children
    );
}

export function useAuth() {
    const contexto = useContext(AuthContext);

    if (!contexto) {
        throw new Error(
            "useAuth debe usarse dentro de <AuthProvider>"
        );
    }

    return contexto;
}
