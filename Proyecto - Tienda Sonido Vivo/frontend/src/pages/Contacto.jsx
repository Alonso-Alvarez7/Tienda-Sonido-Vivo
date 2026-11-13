import { useState } from "react";

const CORREO_TIENDA = "contacto@sonidovivo.cl";

export default function Contacto() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");

  function enviarFormulario(event) {
    event.preventDefault();

    const asunto = `Mensaje de contacto de ${nombre.trim()}`;
    const cuerpo = `Nombre: ${nombre.trim()}
Correo del cliente: ${email.trim()}

Mensaje:
${mensaje.trim()}`;

    const url =
      `mailto:${CORREO_TIENDA}` +
      `?subject=${encodeURIComponent(asunto)}` +
      `&body=${encodeURIComponent(cuerpo)}`;

    window.location.href = url;
  }

  return (
    <main className="pagina-contacto">
      <section className="contacto-intro">
        <h1>Contáctanos</h1>
        <p>
          ¿Tienes dudas sobre nuestros instrumentos? Escríbenos y te ayudaremos.
        </p>
      </section>

      <section className="contacto-tarjeta">
        <div className="contacto-informacion">
          <h2>Hablemos de música</h2>
          <p>Completa el formulario para comunicarte con nuestro equipo.</p>

          <p>
            <strong>Correo de la tienda</strong>
            <br />
            <a href={`mailto:${CORREO_TIENDA}`}>{CORREO_TIENDA}</a>
          </p>

          <p>
            <strong>Teléfono de contacto</strong>
            <br />
            <a href="tel:+56912345678">+56 9 1234 5678</a>
          </p>
        </div>

        <form className="contacto-formulario" onSubmit={enviarFormulario}>
          <label htmlFor="contacto-nombre">Nombre completo</label>
          <input
            id="contacto-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ingresa tu nombre"
            required
            maxLength={100}
          />

          <label htmlFor="contacto-email">Correo electrónico</label>
          <input
            id="contacto-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@correo.com"
            required
            maxLength={254}
          />

          <label htmlFor="contacto-mensaje">Mensaje</label>
          <textarea
            id="contacto-mensaje"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe tu consulta..."
            rows={6}
            maxLength={3000}
            required
          />

          <button className="contacto-boton" type="submit">
            Enviar mensaje
          </button>
        </form>
      </section>
    </main>
  );
}
