function DetalleProducto({ producto, onAgregar, onVolver }) {
    return (
        <main className="detalle-producto">
            <button className="boton-volver" onClick={onVolver}>
                ← Volver al catálogo
            </button>

            <div className="detalle-contenido">
                <div className="detalle-imagen-contenedor">
                    <img
                        className="detalle-imagen"
                        src={producto.imagen}
                        alt={`${producto.nombre} marca ${producto.marca}`}
                    />
                </div>

                <section className="detalle-informacion">
                    <p className="producto-categoria">{producto.categoria}</p>
                    <h1>{producto.nombre}</h1>

                    <p><strong>Marca:</strong> {producto.marca}</p>
                    <p><strong>Modelo:</strong> {producto.modelo}</p>
                    <p><strong>Código:</strong> {producto.codigo}</p>
                    <p>{producto.descripcion}</p>

                    <p className="producto-precio">
                        ${producto.precio.toLocaleString("es-CL")} CLP
                    </p>
                    <p>Stock disponible: {producto.stock}</p>

                    <button
                        className="boton-agregar"
                        onClick={() => onAgregar(producto)}
                        disabled={producto.stock === 0}
                    >
                        {producto.stock === 0 ? "Sin stock" : "Agregar al carrito"}
                    </button>
                </section>
            </div>
        </main>
    );
}

export default DetalleProducto;