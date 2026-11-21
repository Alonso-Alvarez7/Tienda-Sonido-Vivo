import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";

import LayoutPrincipal from "./layouts/LayoutPrincipal.jsx";
import RutaProtegida from "./components/RutaProtegida.jsx";
import RegistroPedido from "./components/RegistroPedido.jsx";
import Inicio from "./pages/Inicio.jsx";

import { obtenerProductoPorCodigo } from "./services/productosService";
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


import { ROLES } from "./auth/auth";
import Contacto from "./pages/Contacto.jsx";
import Nosotros from "./pages/Nosotros.jsx";
import Blog from "./pages/Blog.jsx";


function PaginaDetalle({ onAgregar }) {
  const { id } = useParams();
  const navegar = useNavigate();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let vigente = true;

    async function cargarProducto() {
      setCargando(true);
      setError("");

      try {
        const datos = await obtenerProductoPorCodigo(id);

        if (vigente) {
          setProducto(datos);
        }
      } catch (e) {
        if (vigente) {
          setError(e.message);
          setProducto(null);
        }
      } finally {
        if (vigente) {
          setCargando(false);
        }
      }
    }

    cargarProducto();

    return () => {
      vigente = false;
    };
  }, [id]);

  if (cargando) {
    return <main><p>Cargando producto...</p></main>;
  }

  if (error || !producto) {
    return (
      <main>
        <h1>Producto no encontrado</h1>
        <p role="alert">{error || "No se encontró el producto solicitado."}</p>
        <button onClick={() => navegar("/")}>
          Volver a la tienda
        </button>
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
    const productoNormalizado = {
      ...producto,
      id: producto.id ?? producto.codigo,
    };

    setCarrito((carritoActual) => {
      const productoEnCarrito = carritoActual.find(
        (item) => item.id === productoNormalizado.id
      );

      if (productoEnCarrito) {
        if (productoEnCarrito.cantidad >= productoNormalizado.stock) {
          return carritoActual;
        }

        return carritoActual.map((item) =>
          item.id === productoNormalizado.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...carritoActual, { ...productoNormalizado, cantidad: 1 }];
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
              <Inicio onAgregar={agregarAlCarrito} />
              <Productos
                onAgregar={agregarAlCarrito}
                onVerDetalle={(producto) =>
                  navegar(`/productos/${encodeURIComponent(producto.codigo ?? producto.id)}`)
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
            <Checkout
              carrito={carrito}
              onVolver={() => navegar("/carrito")}
              onConfirmar={() => setCarrito([])}
            />
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