function ProductoCard({ producto, onAgregar, onVerDetalle }) {
    return (
        <article className="producto-card">
            <p className="producto-categoria">{producto.categoria}</p>
            <h2>{producto.nombre}</h2>

            <p><strong>Marca:</strong> {producto.marca}</p>
            <p><strong>Modelo:</strong> {producto.modelo}</p>

            <p className="producto-precio">
                ${producto.precio.toLocaleString("es-CL")} CLP
            </p>
            <p>Stock disponible: {producto.stock}</p>

            <div className="producto-botones">
                <button
                    onClick={() => onAgregar(producto)}
                    disabled={producto.stock === 0}
                >
                    {producto.stock === 0 ? "Sin stock" : "Agregar al carrito"}
                </button>

                <button className="boton-detalle" onClick={() => onVerDetalle(producto)}>
                    Ver detalle
                </button>
            </div>
        </article>
    );
}

export default ProductoCard;