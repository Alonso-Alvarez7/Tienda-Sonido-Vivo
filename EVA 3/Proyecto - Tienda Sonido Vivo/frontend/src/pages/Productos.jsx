
import { useEffect, useState } from "react";
import ProductoCard from "../components/ProductoCard";
import {
    obtenerProductos,
    obtenerCategorias,
} from "../services/productosService";

function Productos({ onAgregar, onVerDetalle }) {
    const [busqueda, setBusqueda] = useState("");
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    // Cargar categorías desde el backend
    useEffect(() => {
        async function cargarCategorias() {
            try {
                const datos = await obtenerCategorias();
                setCategorias(datos.map((categoria) => categoria.nombre));
            } catch (e) {
                setError(e.message);
            }
        }

        cargarCategorias();
    }, []);

    // Consultar productos cuando cambien los filtros
    useEffect(() => {
        let vigente = true;

        async function cargarProductos() {
            setCargando(true);
            setError("");

            try {
                const datos = await obtenerProductos({
                    texto: busqueda,
                    categoria: categoriaSeleccionada,
                });

                if (vigente) {
                    setProductos(datos);
                }
            } catch (e) {
                if (vigente) {
                    setError(e.message);
                    setProductos([]);
                }
            } finally {
                if (vigente) {
                    setCargando(false);
                }
            }
        }

        cargarProductos();

        return () => {
            vigente = false;
        };
    }, [busqueda, categoriaSeleccionada]);

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
                        <option value="Todas">Todas</option>

                        {categorias.map((categoria) => (
                            <option key={categoria} value={categoria}>
                                {categoria}
                            </option>
                        ))}
                    </select>
                </label>
            </section>

            <section className="productos-grid">
                {cargando ? (
                    <p>Cargando productos...</p>
                ) : error ? (
                    <p role="alert">Error al cargar productos: {error}</p>
                ) : productos.length > 0 ? (
                    productos.map((producto) => (
                        <ProductoCard
                            key={producto.codigo}
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
