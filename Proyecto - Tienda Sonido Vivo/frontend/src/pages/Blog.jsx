import { useState } from "react";
import { categoriasBlog, publicaciones } from "../data/blog";

function formatearFecha(fecha) {
    return new Date(`${fecha}T12:00:00`).toLocaleDateString("es-CL", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function Blog() {
    const [categoria, setCategoria] = useState("Todas");
    const [abiertaId, setAbiertaId] = useState(null);

    const visibles =
        categoria === "Todas"
            ? publicaciones
            : publicaciones.filter((item) => item.categoria === categoria);

    function alternarPublicacion(id) {
        setAbiertaId(abiertaId === id ? null : id);
    }

    return (
        <main className="pagina-blog">
            <header className="blog-intro">
                <p className="blog-etiqueta">BLOG</p>
                <h1>Música en vivo, bandas y conciertos</h1>
                <p>
                    Noticias, documentales y crónicas del mundo de la música para
                    quienes viven y respiran sonido.
                </p>
            </header>

            <div className="blog-filtros" role="group" aria-label="Filtrar por categoría">
                {categoriasBlog.map((nombre) => (
                    <button
                        key={nombre}
                        type="button"
                        className={`blog-filtro ${categoria === nombre ? "activo" : ""}`}
                        aria-pressed={categoria === nombre}
                        onClick={() => {
                            setCategoria(nombre);
                            setAbiertaId(null);
                        }}
                    >
                        {nombre}
                    </button>
                ))}
            </div>

            <div className="blog-grid">
                {visibles.map((publicacion) => {
                    const abierta = abiertaId === publicacion.id;

                    return (
                        <article key={publicacion.id} className="blog-card">
                            <img
                                src={publicacion.imagen}
                                alt={`Imagen de la publicación: ${publicacion.titulo}`}
                                loading="lazy"
                            />

                            <div className="blog-card-cuerpo">
                                <p className="blog-card-meta">
                                    <span className="blog-card-categoria">
                                        {publicacion.categoria}
                                    </span>
                                    <span>{formatearFecha(publicacion.fecha)}</span>
                                </p>

                                <h2>{publicacion.titulo}</h2>
                                <p>{publicacion.resumen}</p>

                                {abierta &&
                                    publicacion.contenido.map((parrafo) => (
                                        <p key={parrafo}>{parrafo}</p>
                                    ))}

                                <button
                                    type="button"
                                    className="blog-card-boton"
                                    aria-expanded={abierta}
                                    onClick={() => alternarPublicacion(publicacion.id)}
                                >
                                    {abierta ? "Leer menos" : "Leer más"}
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </main>
    );
}

export default Blog;