import { useEffect, useState } from "react";
import Header from "./components/Header";
import Inicio from "./pages/Inicio";
import Footer from "./components/Footer";
import Productos from "./pages/Productos";
import DetalleProducto from "./pages/DetalleProducto";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import "./styles.css";

function App() {
  const [carrito, setCarrito] = useState(() => {
    try {
      const carritoGuardado = localStorage.getItem("sonidoVivoCarrito");
      return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    } catch {
      return [];
    }
  });

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [checkoutActivo, setCheckoutActivo] = useState(false);

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

      {checkoutActivo ? (
        <Checkout
          carrito={carrito}
          onVolver={() => setCheckoutActivo(false)}
        />
      ) : productoSeleccionado ? (
        <DetalleProducto
          producto={productoSeleccionado}
          onAgregar={agregarAlCarrito}
          onVolver={() => setProductoSeleccionado(null)}
        />
      ) : (
        <>
          <Inicio />
          <Productos
            onAgregar={agregarAlCarrito}
            onVerDetalle={setProductoSeleccionado}
          />

          <Carrito
            carrito={carrito}
            onCambiarCantidad={cambiarCantidad}
            onEliminar={eliminarDelCarrito}
            onCheckout={() => setCheckoutActivo(true)}
          />
        </>
      )}
      <Footer />
    </>
  );
}

export default App;