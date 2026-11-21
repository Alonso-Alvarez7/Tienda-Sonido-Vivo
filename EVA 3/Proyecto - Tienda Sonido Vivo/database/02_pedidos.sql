-- ============================================================
-- Sonido Vivo - Esquema de pedidos (T-04)
-- Tablas: pedidos y detalle_pedidos (equivalentes a las entidades JPA Pedido y DetallePedido)
-- Motor: MariaDB / MySQL (XAMPP). Ejecutar en phpMyAdmin > pestaña SQL, después de 01_catalogo.sql.
-- Si Spring ya creó las tablas (ddl-auto=update), este script no cambia nada.
-- ============================================================

USE sonido_vivo;

CREATE TABLE IF NOT EXISTS pedidos (
  id                BIGINT       NOT NULL AUTO_INCREMENT,
  codigo            VARCHAR(20)  NULL,
  usuario_id        BIGINT       NOT NULL,
  fecha             DATETIME(6)  NOT NULL,
  estado            ENUM('EN_PREPARACION','DESPACHADO','ENTREGADO') NOT NULL DEFAULT 'EN_PREPARACION',
  tipo_entrega      ENUM('RETIRO','DESPACHO') NOT NULL,
  direccion         VARCHAR(255) NULL,
  telefono_contacto VARCHAR(20)  NOT NULL,
  total             INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pedidos_codigo (codigo),
  KEY idx_pedidos_usuario (usuario_id),
  KEY idx_pedidos_estado (estado),
  KEY idx_pedidos_fecha (fecha),
  CONSTRAINT ck_pedidos_total CHECK (total >= 0),
  CONSTRAINT ck_pedidos_direccion CHECK (tipo_entrega <> 'DESPACHO' OR direccion IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS detalle_pedidos (
  id              BIGINT       NOT NULL AUTO_INCREMENT,
  pedido_id       BIGINT       NOT NULL,
  producto_id     BIGINT       NOT NULL,
  nombre_producto VARCHAR(150) NOT NULL,
  precio_unitario INT          NOT NULL,
  cantidad        INT          NOT NULL,
  subtotal        INT          NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_detalle_pedido_producto (pedido_id, producto_id),
  KEY fk_detalle_producto (producto_id),
  CONSTRAINT fk_detalle_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos (id),
  CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES productos (id),
  CONSTRAINT ck_detalle_cantidad CHECK (cantidad > 0),
  CONSTRAINT ck_detalle_precio CHECK (precio_unitario > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PENDIENTE (cuando Benjamín cree la tabla usuarios, T-08, con id BIGINT):
-- ALTER TABLE pedidos
--   ADD CONSTRAINT fk_pedidos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id);

-- Verificación
DESCRIBE pedidos;
DESCRIBE detalle_pedidos;