import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";
import { tienePermiso } from "../auth/auth";

/**
 * Protege una ruta:
 * - Sin sesión → redirige a /login (recordando a dónde quería ir).
 * - Con sesión pero sin el rol requerido → /no-autorizado.
 */
function RutaProtegida({ roles, children }) {
  const { usuario } = useAuth();
  const ubicacion = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }

  if (roles && !tienePermiso(usuario, roles)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
}

export default RutaProtegida;