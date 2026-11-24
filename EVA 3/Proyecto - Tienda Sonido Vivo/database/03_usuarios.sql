-- ============================================================
-- Sonido Vivo - Esquema de usuarios y roles (T-08)
-- Ejecutar después de 01_catalogo.sql y 02_pedidos.sql.
-- Motor: MariaDB / MySQL.
-- ============================================================

USE sonido_vivo;

CREATE TABLE IF NOT EXISTS roles (
  id     BIGINT      NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(30) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usuarios (
  id              BIGINT       NOT NULL AUTO_INCREMENT,
  nombre_completo VARCHAR(120) NOT NULL,
  correo          VARCHAR(160) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  activo          BOOLEAN      NOT NULL DEFAULT TRUE,
  rol_id          BIGINT       NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_correo (correo),
  KEY idx_usuarios_rol (rol_id),
  CONSTRAINT fk_usuarios_rol
    FOREIGN KEY (rol_id) REFERENCES roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (nombre) VALUES
  ('ADMIN'),
  ('VENDEDOR'),
  ('CLIENTE')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Relaciona cada pedido con el usuario que lo realizó.
ALTER TABLE pedidos
  ADD CONSTRAINT fk_pedidos_usuario
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id);

-- Verificación
SELECT * FROM roles;
DESCRIBE usuarios;
DESCRIBE pedidos;