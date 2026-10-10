import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Inicio from "./pages/Inicio";
import Productos from "./pages/Productos";
import DetalleProducto from "./pages/DetalleProducto";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import { productos } from "./data/productos";
import "./styles.css";

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
        (item) => item.id === producto.id
      );

      if (productoEnCarrito) {
        if (productoEnCarrito.cantidad >= producto.stock) {
          return carritoActual;
        }

        return carritoActual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
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
          : item
      )
    );
  }

  function eliminarDelCarrito(id) {
    setCarrito((carritoActual) =>
      carritoActual.filter((item) => item.id !== id)
    );
  }

  const cantidadEnCarrito = carrito.reduce(
    (total, producto) => total + producto.cantidad,
    0
  );

  return (
    <>
      <Header cantidadEnCarrito={cantidadEnCarrito} />

      <Routes>
        <Route
          path="/"
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
          path="/productos/:id"
          element={<PaginaDetalle onAgregar={agregarAlCarrito} />}
        />

        <Route
          path="/carrito"
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
          path="/checkout"
          element={
            <Checkout
              carrito={carrito}
              onVolver={() => navegar("/carrito")}
              onConfirmar={() => setCarrito([])}
            />
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
      </Routes>

      <Footer />
    </>
  );
}

export default App;