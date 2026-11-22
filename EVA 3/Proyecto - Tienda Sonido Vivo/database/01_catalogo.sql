-- ============================================================
-- Sonido Vivo - Carga inicial de categorías y productos
-- Fuente: Catálogo Sonido Vivo.xlsx (51 productos de muestra, 10 categorías)
-- Motor: MariaDB / MySQL (XAMPP). Ejecutar en phpMyAdmin > pestaña SQL.
-- ============================================================

CREATE DATABASE IF NOT EXISTS sonido_vivo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sonido_vivo;

-- Tablas equivalentes a las entidades JPA (si Spring ya las creó, no hace nada)
CREATE TABLE IF NOT EXISTS categorias (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(80)  NOT NULL,
  descripcion VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_categorias_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS productos (
  id           BIGINT       NOT NULL AUTO_INCREMENT,
  codigo       VARCHAR(20)  NOT NULL,
  nombre       VARCHAR(150) NOT NULL,
  marca        VARCHAR(80)  NOT NULL,
  modelo       VARCHAR(80)  NULL,
  descripcion  VARCHAR(500) NULL,
  precio       INT          NOT NULL,
  stock        INT          NOT NULL,
  imagen       VARCHAR(255) NULL,
  activo       BIT(1)       NOT NULL DEFAULT b'1',
  categoria_id BIGINT       NOT NULL,
  version      BIGINT       NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_productos_codigo (codigo),
  KEY fk_productos_categoria (categoria_id),
  CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Categorías
-- ------------------------------------------------------------
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Guitarras Acústicas', 'Folk, Dreadnought, Clásica, Electroacústica, Niños'),
  ('Guitarras Eléctricas', 'Stratocaster, Telecaster, Les Paul, SG, Semi-hollow, Signature'),
  ('Bajos Eléctricos', 'Precision, Jazz, Activo, Acústico, Fretless'),
  ('Baterías', 'Acústica, Electrónica, Cajas, Platillos, Stands'),
  ('Teclados y Pianos', 'Digital, Sintetizador, MIDI Controller, Órgano'),
  ('Amplificadores', 'Guitarra combo, Guitarra cabezal, Bajo, Acústico, Teclado'),
  ('Micrófonos', 'Dinámico, Condensador, USB, Ribbon, Lavalier'),
  ('Pedales de Efectos', 'Distorsión, Overdrive, Fuzz, Reverb, Delay, Chorus, Multi-FX'),
  ('Accesorios', 'Cuerdas, Púas, Soportes, Cables, Correas, Afinadores'),
  ('Estudio y Grabación', 'Interfaces, Auriculares, Monitores, Pop filters, DAW')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- ------------------------------------------------------------
-- Productos (la categoría se resuelve por nombre)
-- ------------------------------------------------------------
INSERT INTO productos
  (codigo, nombre, marca, modelo, descripcion, precio, stock, imagen, activo, categoria_id, version)
VALUES
  ('GA001', 'Guitarra Acústica Folk', 'Yamaha', 'F310', 'Tapa de abeto, aros y fondo de meranti. Ideal para iniciantes.', 129990, 8, '/imagen/productos/GA001.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Guitarras Acústicas'), 0),
  ('GA002', 'Guitarra Acústica Dreadnought', 'Fender', 'CD-60S', 'Tapa de abeto macizo, brazo de caoba. Sonido cálido y proyectado.', 189990, 5, '/imagen/productos/GA002.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Guitarras Acústicas'), 0),
  ('GA003', 'Guitarra Acústica Clásica 4/4', 'Yamaha', 'C40', 'Nailon, tapa de abeto. Ideal para estudio y flamenco.', 89990, 10, '/imagen/productos/GA003.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Guitarras Acústicas'), 0),
  ('GA004', 'Guitarra Electroacústica', 'Takamine', 'GN20CE', 'Pickup integrado, afinador incorporado.', 349990, 3, '/imagen/productos/GA004.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Guitarras Acústicas'), 0),
  ('GA005', 'Guitarra 3/4 Niños', 'Yamaha', 'JR1', 'Tamaño reducido para niños de 6 a 10 años.', 79990, 6, '/imagen/productos/GA005.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Guitarras Acústicas'), 0),
  ('GE001', 'Guitarra Eléctrica Stratocaster', 'Squier', 'Affinity Strat', 'Cuerpo de álamo, mástil de arce, pastillas SSS.', 249990, 5, '/imagen/productos/GE001.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Guitarras Eléctricas'), 0),
  ('GE002', 'Guitarra Eléctrica Les Paul', 'Epiphone', 'Les Paul Std', 'Cuerpo caoba, tapa arce, pastillas humbucker.', 329990, 4, '/imagen/productos/GE002.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Guitarras Eléctricas'), 0),
  ('GE003', 'Guitarra Eléctrica SG', 'Epiphone', 'SG Standard', 'Cuerpo caoba, mástil caoba, 2 humbuckers.', 319990, 3, '/imagen/productos/GE003.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Guitarras Eléctricas'), 0),
  ('GE004', 'Guitarra Eléctrica Telecaster', 'Squier', 'Affinity Tele', 'Cuerpo álamo, clavijero vintage, 2 pastillas single.', 239990, 4, '/imagen/productos/GE004.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Guitarras Eléctricas'), 0),
  ('GE005', 'Guitarra Eléctrica Semi-hollow', 'Epiphone', 'ES-335', 'Semi-hueca, 2 humbuckers, ideal para jazz y blues.', 549990, 2, '/imagen/productos/GE005.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Guitarras Eléctricas'), 0),
  ('BA001', 'Bajo Eléctrico 4 Cuerdas', 'Squier', 'Affinity PJ', 'Pickup PJ, cuerpo álamo, mástil arce.', 299990, 5, '/imagen/productos/BA001.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Bajos Eléctricos'), 0),
  ('BA002', 'Bajo Eléctrico Jazz Bass', 'Fender', 'Player Jazz', 'Alder body, 2 Alnico V Jazz single-coil.', 699990, 2, '/imagen/productos/BA002.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Bajos Eléctricos'), 0),
  ('BA003', 'Bajo Acústico 4 Cuerdas', 'Yamaha', 'APX700II', 'Electroacústico, afinador incorporado.', 429990, 2, '/imagen/productos/BA003.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Bajos Eléctricos'), 0),
  ('BT001', 'Batería Acústica 5 piezas', 'Pearl', 'Roadshow', 'Incluye stands, platillos y pedal de bombo.', 599990, 2, '/imagen/productos/BT001.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Baterías'), 0),
  ('BT002', 'Batería Electrónica 8 pads', 'Roland', 'TD-02KV', 'Módulo TD-02, 8 pads de goma, pedal hi-hat.', 799990, 2, '/imagen/productos/BT002.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Baterías'), 0),
  ('BT003', 'Caja Snare 14"', 'Pearl', 'STE1450', 'Acero, 14x5", 10 tensores.', 89990, 4, '/imagen/productos/BT003.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Baterías'), 0),
  ('BT004', 'Platillo Hi-Hat 14"', 'Zildjian', 'A Series', 'Latón B20, sonido brillante y claro.', 149990, 3, '/imagen/productos/BT004.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Baterías'), 0),
  ('BT005', 'Platillo Crash 16"', 'Zildjian', 'A Series', 'Latón B20, ataque rápido.', 129990, 3, '/imagen/productos/BT005.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Baterías'), 0),
  ('TC001', 'Teclado Digital 61 teclas', 'Yamaha', 'PSR-E373', '61 teclas sensibles al tacto, 622 voces.', 249990, 4, '/imagen/productos/TC001.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Teclados y Pianos'), 0),
  ('TC002', 'Piano Digital 88 teclas', 'Yamaha', 'P-45', '88 teclas pesadas, 10 voces, pedal sustain incluido.', 499990, 2, '/imagen/productos/TC002.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Teclados y Pianos'), 0),
  ('TC003', 'Sintetizador 49 teclas', 'Arturia', 'MiniLab MKII', 'MIDI controller, 49 mini teclas.', 129990, 5, '/imagen/productos/TC003.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Teclados y Pianos'), 0),
  ('TC004', 'Teclado MIDI 88 teclas', 'M-Audio', 'Hammer 88', '88 teclas martillo, sin sonidos propios.', 399990, 2, '/imagen/productos/TC004.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Teclados y Pianos'), 0),
  ('AM001', 'Amplificador Guitarra 15W', 'Fender', 'Frontman 15G', '15W, distorsión incorporada, entrada auxiliar.', 99990, 5, '/imagen/productos/AM001.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Amplificadores'), 0),
  ('AM002', 'Amplificador Guitarra 40W', 'Marshall', 'MG40GFX', '40W, 4 canales, efectos digitales integrados.', 299990, 3, '/imagen/productos/AM002.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Amplificadores'), 0),
  ('AM003', 'Amplificador Bajo 100W', 'Hartke', 'HD100', '100W, tweeter integrado, ecualizador de 4 bandas.', 449990, 2, '/imagen/productos/AM003.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Amplificadores'), 0),
  ('AM004', 'Amplificador Acústico 40W', 'Fishman', 'Loudbox Mini', '60W, 2 canales, reverb y chorus incorporados.', 499990, 2, '/imagen/productos/AM004.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Amplificadores'), 0),
  ('MI001', 'Micrófono Dinámico Cardioide', 'Shure', 'SM58', 'Estándar industria para voz en vivo.', 149990, 8, '/imagen/productos/MI001.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Micrófonos'), 0),
  ('MI002', 'Micrófono Dinámico Instrumento', 'Shure', 'SM57', 'Ideal para captura de instrumentos y amplificadores.', 139990, 6, '/imagen/productos/MI002.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Micrófonos'), 0),
  ('MI003', 'Micrófono Condensador', 'Audio-Tech.', 'AT2020', 'Cardioide, XLR, ideal para grabación en estudio.', 199990, 4, '/imagen/productos/MI003.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Micrófonos'), 0),
  ('MI004', 'Micrófono USB de Condensador', 'Blue', 'Yeti', 'USB, 4 patrones polares, ideal para streaming y podcast.', 299990, 5, '/imagen/productos/MI004.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Micrófonos'), 0),
  ('PE001', 'Pedal Distorsión', 'Boss', 'DS-1', 'Clásico pedal de distorsión, 3 controles.', 79990, 7, '/imagen/productos/PE001.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Pedales de Efectos'), 0),
  ('PE002', 'Pedal Reverb', 'Boss', 'RV-6', '8 modos de reverb, control de shimmer.', 179990, 4, '/imagen/productos/PE002.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Pedales de Efectos'), 0),
  ('PE003', 'Pedal Multi-efectos', 'Boss', 'ME-80', 'Diseño tipo pedalboard, 8 efectos simultáneos.', 349990, 2, '/imagen/productos/PE003.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Pedales de Efectos'), 0),
  ('PE004', 'Pedal Tuner Cromático', 'Boss', 'TU-3', 'Afinador cromático, indicador de tono.', 89990, 8, '/imagen/productos/PE004.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Pedales de Efectos'), 0),
  ('PE005', 'Pedal Delay', 'MXR', 'Carbon Copy', 'Delay analógico cálido, tiempo 600ms.', 179990, 4, '/imagen/productos/PE005.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Pedales de Efectos'), 0),
  ('PE006', 'Pedal Overdrive', 'Ibanez', 'TS9', 'Tube Screamer clásico, sonido suave y orgánico.', 99990, 6, '/imagen/productos/PE006.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Pedales de Efectos'), 0),
  ('AC001', 'Cuerdas Guitarra Eléctrica 09-42', 'Ernie Ball', 'Super Slinky', 'Juego 6 cuerdas, calibre ligero.', 8990, 25, '/imagen/productos/AC001.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Accesorios'), 0),
  ('AC002', 'Cuerdas Guitarra Acústica 12-53', 'Ernie Ball', 'Earthwood', 'Bronce fósforo, sonido cálido.', 10990, 20, '/imagen/productos/AC002.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Accesorios'), 0),
  ('AC003', 'Cuerdas Bajo 45-105', 'Ernie Ball', 'Regular Slinky', 'Cuerdas de níquel enrollado, set 4 cuerdas.', 14990, 12, '/imagen/productos/AC003.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Accesorios'), 0),
  ('AC004', 'Púas de Guitarra x10 (0.73mm)', 'Fender', '351', 'Celulosa, grosor medio.', 3990, 50, '/imagen/productos/AC004.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Accesorios'), 0),
  ('AC005', 'Capotraste Guitarra', 'Dunlop', 'Trigger', 'Capotraste de resorte, compatible 6 cuerdas.', 12990, 15, '/imagen/productos/AC005.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Accesorios'), 0),
  ('AC006', 'Afinador de Clip', 'Snark', 'SN-5', 'Afinador cromático de clip, pantalla giratoria.', 8990, 20, '/imagen/productos/AC006.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Accesorios'), 0),
  ('AC007', 'Cable Instrumento 3m', 'Monster', 'S100-I-3', 'Cable trenzado, conectores dorados, 3 metros.', 12990, 15, '/imagen/productos/AC007.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Accesorios'), 0),
  ('AC008', 'Cable Instrumento 6m', 'Monster', 'S100-I-6', 'Cable trenzado, conectores dorados, 6 metros.', 17990, 10, '/imagen/productos/AC008.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Accesorios'), 0),
  ('AC009', 'Soporte Guitarra de Piso', 'Hercules', 'GS302B', 'Soporte plegable con enganche automático.', 22990, 12, '/imagen/productos/AC009.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Accesorios'), 0),
  ('AC010', 'Soporte Guitarra de Pared', 'Hercules', 'WAH-202', 'Montaje a pared, enganche automático.', 18990, 10, '/imagen/productos/AC010.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Accesorios'), 0),
  ('ES001', 'Interfaz de Audio 2x2 USB', 'Focusrite', 'Scarlett Solo', '1 entrada XLR+instrumento, 2 salidas, 24bit/192kHz.', 149990, 4, '/imagen/productos/ES001.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Estudio y Grabación'), 0),
  ('ES002', 'Auriculares de Estudio', 'Audio-Tech.', 'ATH-M20x', 'Circumaurales, respuesta 15Hz-20kHz.', 79990, 6, '/imagen/productos/ES002.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Estudio y Grabación'), 0),
  ('ES003', 'Auriculares de Estudio Pro', 'Audio-Tech.', 'ATH-M50x', 'Referencia de industria, sonido neutro y detallado.', 219990, 4, '/imagen/productos/ES003.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Estudio y Grabación'), 0),
  ('ES004', 'Monitor de Estudio 5"', 'Yamaha', 'HS5', 'Altavoz activo, respuesta plana, ideal mezcla.', 349990, 2, '/imagen/productos/ES004.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Estudio y Grabación'), 0),
  ('ES005', 'Pop Filter para Micrófono', 'Sennheiser', 'MZP 40', 'Doble malla, brazo flexible con clip.', 14990, 8, '/imagen/productos/ES005.jpg', 1, (SELECT id FROM categorias WHERE nombre = 'Estudio y Grabación'), 0)
ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre), marca = VALUES(marca), modelo = VALUES(modelo),
  descripcion = VALUES(descripcion), precio = VALUES(precio), stock = VALUES(stock),
  imagen = VALUES(imagen), categoria_id = VALUES(categoria_id);

-- Verificación
SELECT c.nombre AS categoria, COUNT(*) AS productos
FROM productos p JOIN categorias c ON c.id = p.categoria_id
GROUP BY c.nombre ORDER BY c.nombre;
