# Diagrama ER - Pedidos, usuarios y roles

```mermaid
erDiagram
    ROLES ||--o{ USUARIOS : asigna
    USUARIOS ||--o{ PEDIDOS : realiza
    PEDIDOS ||--|{ DETALLE_PEDIDOS : contiene
    PRODUCTOS ||--o{ DETALLE_PEDIDOS : participa

    ROLES {
        bigint id PK
        varchar nombre UK
    }

    USUARIOS {
        bigint id PK
        varchar nombre_completo
        varchar correo UK
        varchar password_hash
        boolean activo
        bigint rol_id FK
    }

    PEDIDOS {
        bigint id PK
        varchar codigo UK
        bigint usuario_id FK
        datetime fecha
        enum estado
        enum tipo_entrega
        varchar direccion
        varchar telefono_contacto
        int total
    }

    DETALLE_PEDIDOS {
        bigint id PK
        bigint pedido_id FK
        bigint producto_id FK
        varchar nombre_producto
        int precio_unitario
        int cantidad
        int subtotal
    }

    PRODUCTOS {
        bigint id PK
        varchar codigo UK
        int precio
        int stock
    }
```

`03_usuarios.sql` crea las tablas `roles` y `usuarios`, e incorpora la clave foránea entre `pedidos.usuario_id` y `usuarios.id`.

**Pendiente de coordinación:** la clave foránea mantiene la relación en la base de datos, pero la API de pedidos debe comprobar que el usuario autenticado solo consulte sus propios pedidos.