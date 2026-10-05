import { useState } from "react";
import { productos } from "../data/productos";
import ProductoCard from "../components/ProductoCard";

function Productos({ onAgregar, onVerDetalle }) {
    const [busqueda, setBusqueda] = useState("");
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");

    const categorias = [
        "Todas",
        ...new Set(productos.map((producto) => producto.categoria)),
    ];

    const productosFiltrados = productos.filter((producto) => {
        const textoBusqueda = busqueda.toLowerCase();

        const coincideBusqueda =
            producto.nombre.toLowerCase().includes(textoBusqueda) ||
            producto.marca.toLowerCase().includes(textoBusqueda);

        const coincideCategoria =
            categoriaSeleccionada === "Todas" ||
            producto.categoria === categoriaSeleccionada;

        return coincideBusqueda && coincideCategoria;
    });

    return (
        <main className="pagina-productos" id="catalogo">
            <h1>Catálogo de Sonido Vivo</h1>
            <p>Encuentra instrumentos, equipos de sonido y accesorios.</p>

            <section className="filtros-productos">
                <label>
                    Buscar por nombre o marca
                    <input
                        type="search"
                        placeholder="Ejemplo: Yamaha"
                        value={busqueda}
                        onChange={(evento) => setBusqueda(evento.target.value)}
                    />
                </label>

                <label>
                    Filtrar por categoría
                    <select
                        value={categoriaSeleccionada}
                        onChange={(evento) =>
                            setCategoriaSeleccionada(evento.target.value)
                        }
                    >
                        {categorias.map((categoria) => (
                            <option key={categoria} value={categoria}>
                                {categoria}
                            </option>
                        ))}
                    </select>
                </label>
            </section>

            <section className="productos-grid">
                {productosFiltrados.length > 0 ? (
                    productosFiltrados.map((producto) => (
                        <ProductoCard
                            key={producto.id}
                            producto={producto}
                            onAgregar={onAgregar}
                            onVerDetalle={onVerDetalle}
                        />
                    ))
                ) : (
                    <p>No se encontraron productos.</p>
                )}
            </section>
        </main>
    );
}

export default Productos;