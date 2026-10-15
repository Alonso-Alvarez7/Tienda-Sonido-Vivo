import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import iconoMarcador from "leaflet/dist/images/marker-icon.png";
import iconoMarcador2x from "leaflet/dist/images/marker-icon-2x.png";
import sombraMarcador from "leaflet/dist/images/marker-shadow.png";
import { sucursales } from "../data/sucursales";

// Con Vite los íconos por defecto de Leaflet no se cargan solos,
// por eso se define el ícono a mano.
const iconoSucursal = L.icon({
    iconUrl: iconoMarcador,
    iconRetinaUrl: iconoMarcador2x,
    shadowUrl: sombraMarcador,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Agrupa las sucursales por región: { "Región de Valparaíso": ["Viña del Mar"] }
const regiones = sucursales.reduce((grupos, sucursal) => {
    if (!grupos[sucursal.region]) {
        grupos[sucursal.region] = [];
    }
    if (!grupos[sucursal.region].includes(sucursal.ciudad)) {
        grupos[sucursal.region].push(sucursal.ciudad);
    }
    return grupos;
}, {});

// Una sola sucursal: se centra en ella. Varias: el mapa se ajusta para mostrarlas todas.
const propiedadesMapa =
    sucursales.length === 1
        ? { center: [sucursales[0].lat, sucursales[0].lng], zoom: 15 }
        : {
            bounds: sucursales.map((sucursal) => [sucursal.lat, sucursal.lng]),
            boundsOptions: { padding: [40, 40] },
        };

function Nosotros() {
    return (
        <main className="pagina-nosotros">
            {/* ---------- Quiénes somos ---------- */}
            <section className="nosotros-quienes">
                <div className="nosotros-texto">
                    <p className="nosotros-etiqueta">NOSOTROS</p>
                    <h1>Quiénes somos</h1>
                    <p>
                        Sonido Vivo nació hace 11 años en Viña del Mar con una idea
                        simple: que cualquier persona, desde quien toma una guitarra
                        por primera vez hasta el músico que vive de los escenarios,
                        encuentre en un solo lugar el instrumento correcto y alguien
                        que lo entienda.
                    </p>
                    <p>
                        Somos una tienda especializada en instrumentos musicales,
                        equipos de sonido y accesorios. Nuestro catálogo reúne más de
                        340 referencias entre guitarras, bajos, baterías, teclados,
                        amplificadores, micrófonos y pedales de efectos. Además,
                        contamos con taller de reparación de instrumentos de cuerda.
                    </p>
                    <p>
                        Somos un equipo pequeño, formado por el dueño y dos
                        vendedores, y justamente por eso conocemos cada producto y a
                        cada cliente. Hoy damos un paso más: llevamos la tienda a
                        internet para que puedas ver el catálogo, comprar y hacer
                        seguimiento de tu pedido desde cualquier ciudad de Chile.
                    </p>
                </div>

                <div className="nosotros-imagen">
                    <img
                        src="/imagen/img/PortadaInicio.png"
                        alt="Instrumentos y equipos musicales de Sonido Vivo"
                    />
                </div>
            </section>

            {/* ---------- Mapa ---------- */}
            <section className="nosotros-seccion" aria-labelledby="titulo-mapa">
                <h2 id="titulo-mapa">Dónde encontrarnos</h2>
                <p className="nosotros-seccion-texto">
                    Visítanos en nuestra casa matriz o retira tu pedido en tienda.
                </p>

                <div
                    className="nosotros-mapa-contenedor"
                    role="region"
                    aria-label="Mapa con la ubicación de la tienda"
                >
                    <MapContainer
                        className="nosotros-mapa"
                        scrollWheelZoom={false}
                        {...propiedadesMapa}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {sucursales.map((sucursal) => (
                            <Marker
                                key={sucursal.id}
                                position={[sucursal.lat, sucursal.lng]}
                                icon={iconoSucursal}
                            >
                                <Popup>
                                    <strong>{sucursal.nombre}</strong>
                                    <br />
                                    {sucursal.direccion}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                <div className="nosotros-sucursales">
                    {sucursales.map((sucursal) => (
                        <article key={sucursal.id} className="nosotros-sucursal">
                            <h3>{sucursal.nombre}</h3>
                            <p>{sucursal.direccion}</p>
                            {sucursal.retiroEnTienda && (
                                <p className="nosotros-sucursal-retiro">
                                    Retiro en tienda disponible
                                </p>
                            )}
                            <a
                                className="nosotros-como-llegar"
                                href={`https://www.google.com/maps/dir/?api=1&destination=${sucursal.lat},${sucursal.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Cómo llegar
                            </a>
                        </article>
                    ))}
                </div>
            </section>

            {/* ---------- Regiones ---------- */}
            <section className="nosotros-seccion" aria-labelledby="titulo-regiones">
                <h2 id="titulo-regiones">Regiones en las que estamos</h2>

                <ul className="nosotros-regiones">
                    {Object.entries(regiones).map(([region, ciudades]) => (
                        <li key={region} className="nosotros-region">
                            <h3>{region}</h3>
                            <p>{ciudades.join(", ")}</p>
                        </li>
                    ))}
                </ul>

                <p className="nosotros-seccion-texto">
                    ¿Vives en otra región? También llegamos a ti: despachamos a todo
                    Chile por Starken y Chilexpress.
                </p>
            </section>
        </main>
    );
}

export default Nosotros;