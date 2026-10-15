import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";

import LayoutPrincipal from "./layouts/LayoutPrincipal.jsx";
import RutaProtegida from "./components/RutaProtegida.jsx";
import RegistroPedido from "./components/RegistroPedido.jsx";
import Inicio from "./pages/Inicio.jsx";
import Productos from "./pages/Productos.jsx";
import DetalleProducto from "./pages/DetalleProducto.jsx";
import Carrito from "./pages/Carrito.jsx";
import Checkout from "./pages/Checkout.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import Admin from "./pages/Admin.jsx";
import Vendedor from "./pages/Vendedor.jsx";
import MisPedidos from "./pages/MisPedidos.jsx";
import NoAutorizado from "./pages/NoAutorizado.jsx";
import { productos } from "./data/productos";
import { ROLES } from "./auth/auth";
import Contacto from "./pages/Contacto.jsx";
import Nosotros from "./pages/Nosotros.jsx";
import Blog from "./pages/Blog.jsx";

function PaginaDetalle({ onAgregar }) {
  const { id } = useParams();
  const navegar = useNavigate();
  const producto = productos.find((item) => item.id === id);

  if (!producto) {
    return (
      <main>
        <h1>Producto no encontrado</h1>
        <button onClick={() => navegar("/")}>Volver a la tienda</button>
      </main>
    );
  }

  return (
    <DetalleProducto
      producto={producto}
      onAgregar={onAgregar}
      onVolver={() => navegar("/")}
    />
  );
}

/**
 * Rutas protegidas por rol:
 * - /admin: solo administrador.
 * - /vendedor: vendedor y administrador.
 * - /mis-pedidos: cliente.
 */
function App() {
  const navegar = useNavigate();

  const [carrito, setCarrito] = useState(() => {
    try {
      const carritoGuardado = localStorage.getItem("sonidoVivoCarrito");
      return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("sonidoVivoCarrito", JSON.stringify(carrito));
  }, [carrito]);

  function agregarAlCarrito(producto) {
    setCarrito((carritoActual) => {
      const productoEnCarrito = carritoActual.find(
        (item) => item.id === producto.id,
      );

      if (productoEnCarrito) {
        if (productoEnCarrito.cantidad >= producto.stock) {
          return carritoActual;
        }

        return carritoActual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }

      return [...carritoActual, { ...producto, cantidad: 1 }];
    });
  }

  function cambiarCantidad(id, nuevaCantidad) {
    setCarrito((carritoActual) =>
      carritoActual.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.min(nuevaCantidad, item.stock) }
          : item,
      ),
    );
  }

  function eliminarDelCarrito(id) {
    setCarrito((carritoActual) =>
      carritoActual.filter((item) => item.id !== id),
    );
  }

  const cantidadEnCarrito = carrito.reduce(
    (total, producto) => total + producto.cantidad,
    0,
  );

  return (
    <Routes>
      <Route
        element={<LayoutPrincipal cantidadEnCarrito={cantidadEnCarrito} />}
      >
        <Route path="contacto" element={<Contacto />} />
        <Route path="nosotros" element={<Nosotros />} />
        <Route path="blog" element={<Blog />} />
        <Route
          index
          element={
            <>
              <Inicio />
              <Productos
                onAgregar={agregarAlCarrito}
                onVerDetalle={(producto) =>
                  navegar(`/productos/${producto.id}`)
                }
              />
            </>
          }
        />

        <Route
          path="productos/:id"
          element={<PaginaDetalle onAgregar={agregarAlCarrito} />}
        />

        <Route
          path="carrito"
          element={
            <Carrito
              carrito={carrito}
              onCambiarCantidad={cambiarCantidad}
              onEliminar={eliminarDelCarrito}
              onCheckout={() => navegar("/checkout")}
            />
          }
        />

        <Route
          path="checkout"
          element={
            <RegistroPedido carrito={carrito}>
              <Checkout
                carrito={carrito}
                onVolver={() => navegar("/carrito")}
                onConfirmar={() => setCarrito([])}
              />
            </RegistroPedido>
          }
        />

        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Registro />} />
        <Route path="no-autorizado" element={<NoAutorizado />} />

        <Route
          path="admin"
          element={
            <RutaProtegida roles={[ROLES.ADMIN]}>
              <Admin />
            </RutaProtegida>
          }
        />

        <Route
          path="vendedor"
          element={
            <RutaProtegida roles={[ROLES.VENDEDOR, ROLES.ADMIN]}>
              <Vendedor />
            </RutaProtegida>
          }
        />

        <Route
          path="mis-pedidos"
          element={
            <RutaProtegida roles={[ROLES.CLIENTE]}>
              <MisPedidos />
            </RutaProtegida>
          }
        />

        <Route
          path="*"
          element={
            <main>
              <h1>Página no encontrada</h1>
              <button onClick={() => navegar("/")}>Volver a Inicio</button>
            </main>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;