function DetalleProducto({ producto, onAgregar, onVolver }) {
    return (
        <main className="detalle-producto">
            <button className="boton-volver" onClick={onVolver}>
                ← Volver al catálogo
            </button>

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
        </main>
    );
}

export default DetalleProducto;