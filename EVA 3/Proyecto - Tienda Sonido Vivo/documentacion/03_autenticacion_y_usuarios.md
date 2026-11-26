# Autenticación y administración de usuarios

## 1. Descripción

La autenticación se realiza en el backend Spring Boot. Las contraseñas se almacenan usando BCrypt. Cuando el usuario inicia sesión, la API entrega un token JWT.

El frontend guarda la sesión para conservarla al recargar la página. La sesión se cierra cuando vence o cuando una solicitud protegida recibe una respuesta `401 Unauthorized`.

Los roles se guardan en la base de datos en mayúsculas. El frontend los muestra en minúsculas:

| Rol en la base de datos | Rol en el frontend | Descripción |
|---|---|---|
| `ADMIN` | `administrador` | Administra usuarios y recursos restringidos. |
| `VENDEDOR` | `vendedor` | Consulta pedidos y actualiza su estado. |
| `CLIENTE` | `cliente` | Accede a las funciones disponibles para clientes. |

## 2. Registro e inicio de sesión

### Registro

**Método y ruta:** `POST /api/auth/registro`

Ejemplo de solicitud:

```json
{
  "nombre": "Cliente de prueba",
  "correo": "cliente@ejemplo.cl",
  "clave": "ContraseñaDePrueba123"
}
```

El registro público crea una cuenta con rol `CLIENTE`. Si se crea correctamente, responde con estado HTTP `201 Created`.

### Inicio de sesión

**Método y ruta:** `POST /api/auth/login`

Ejemplo de solicitud:

```json
{
  "correo": "cliente@ejemplo.cl",
  "clave": "ContraseñaDePrueba123"
}
```

La respuesta exitosa incluye el usuario, el token JWT y su fecha de expiración. El token es personal y no debe compartirse:

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "nombre": "Cliente de prueba",
    "correo": "cliente@ejemplo.cl",
    "rol": "cliente",
    "token": "<JWT>",
    "expira": 1795737600000
  },
  "mensaje": "Inicio de sesión correcto"
}
```

El valor de `expira` del ejemplo es ilustrativo. La API entrega la expiración como fecha en milisegundos.

## 3. Administración de usuarios

Las siguientes rutas requieren autenticación con rol `ADMIN`. Las solicitudes deben incluir el token JWT en el encabezado:

```http
Authorization: Bearer <JWT>
```

| Método | Ruta | Función |
|---|---|---|
| `GET` | `/api/usuarios` | Lista los usuarios. |
| `POST` | `/api/usuarios` | Crea un usuario. |
| `PATCH` | `/api/usuarios/{id}/rol` | Cambia el rol de un usuario. |
| `PATCH` | `/api/usuarios/{id}/estado` | Activa o desactiva una cuenta. |

Al crear un usuario, el campo `rol` debe ser `ADMIN`, `VENDEDOR` o `CLIENTE`.

Ejemplo para cambiar el rol:

```json
{
  "rol": "VENDEDOR"
}
```

Ejemplo para cambiar el estado:

```json
{
  "activo": false
}
```

La API actual no tiene rutas para editar el nombre, correo o contraseña de un usuario, ni para eliminarlo. El panel de administración permite cambiar el rol y el estado.

## 4. Autorización por rol

Las rutas protegidas requieren un JWT válido. El backend revisa el rol antes de permitir las operaciones restringidas.

| Recurso u operación | Acceso |
|---|---|
| Registro e inicio de sesión | Público |
| Lectura de productos y categorías | Público |
| Creación, edición y desactivación de productos | `ADMIN` |
| Listado general de pedidos y cambio de estado | `ADMIN` o `VENDEDOR` |
| Administración de usuarios | `ADMIN` |
| Otras rutas protegidas | Usuario autenticado |

Un usuario autenticado sin permisos suficientes recibe `403 Forbidden`. Una solicitud sin autenticación válida recibe `401 Unauthorized`.

### Pendiente de coordinación sobre pedidos

El endpoint de pedidos de cliente todavía recibe el `usuarioId` desde la ruta, y la creación de pedidos también acepta un identificador de usuario en la solicitud. Debe revisarse con el responsable del módulo de pedidos para que el backend derive al cliente desde el JWT y compruebe la propiedad del pedido. Hasta completar esa revisión, no se debe afirmar que el endpoint garantiza por sí solo que un cliente solo pueda consultar sus propios pedidos.

## 5. Formato de respuesta y errores

Las respuestas de la API utilizan el formato general:

```json
{
  "ok": true,
  "data": {},
  "mensaje": "Operación correcta"
}
```

Estados HTTP principales:

| Estado | Significado |
|---|---|
| `200 OK` | Operación correcta. |
| `201 Created` | Recurso creado. |
| `400 Bad Request` | Datos inválidos. |
| `401 Unauthorized` | Sesión ausente, inválida o vencida. |
| `403 Forbidden` | Usuario autenticado sin permisos suficientes. |
| `404 Not Found` | Recurso no encontrado. |
| `409 Conflict` | Conflicto, por ejemplo, correo ya registrado. |

## 6. Variables de entorno

El backend utiliza estas variables:

| Variable | Uso |
|---|---|
| `JWT_SECRET` | Clave para firmar y validar los JWT. |
| `ADMIN_EMAIL` | Correo del administrador inicial. |
| `ADMIN_PASSWORD` | Contraseña del administrador inicial; debe tener al menos 8 caracteres. |
| `ADMIN_NAME` | Nombre del administrador inicial; opcional. |
| `DB_PORT` | Puerto de MariaDB; por defecto `3306`. |
| `DB_USER` | Usuario de MariaDB; por defecto `root`. |
| `DB_PASSWORD` | Contraseña de MariaDB. |
| `VITE_API_URL` | URL base del backend para el frontend; por defecto `http://localhost:8080/api`. |

Configura los valores reales en el entorno local. No subas contraseñas, tokens ni claves secretas al repositorio. Los archivos de ejemplo deben contener valores ficticios.


## 7. Inicialización de la base de datos

1. Iniciar MariaDB desde XAMPP.
2. Crear o seleccionar la base de datos `sonido_vivo`.
3. Ejecutar los scripts SQL en este orden:
   - `database/01_catalogo.sql`
   - `database/02_pedidos.sql`
   - `database/03_usuarios.sql`
4. Configurar las variables de entorno del backend en la misma terminal donde se iniciará Spring Boot.

El script `03_usuarios.sql` agrega una clave foránea a la tabla de pedidos. Ejecutar los scripts en el orden indicado y evitar volver a ejecutar el tercer script si la clave foránea ya existe.

## 8. Ejecución local

Desde `backend/sonidoVivoApi`, iniciar Spring Boot:

```powershell
.\mvnw.cmd spring-boot:run
```

Desde la carpeta `frontend`, instalar dependencias e iniciar Vite:

```powershell
npm.cmd install
npm.cmd run dev
```

Abrir la dirección indicada por Vite, normalmente:

```text
http://localhost:5173
```

## 9. Swagger/OpenAPI

Con el backend iniciado:

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- Especificación OpenAPI: `http://localhost:8080/v3/api-docs`

Para probar una ruta protegida:

1. Ejecutar `POST /api/auth/login` con una cuenta válida.
2. Copiar el valor de `data.token`.
3. Presionar **Authorize** en Swagger y pegar el token.
4. Ejecutar la ruta protegida.

No compartir el token. En Swagger, escribir solo el token si el cuadro agrega automáticamente el prefijo `Bearer`.

## 10. Verificación realizada

Se verificaron manualmente:

- Registro e inicio de sesión desde el frontend.
- Conservación de la sesión después de recargar la página.
- Cierre de sesión al vencer la sesión.
- Restricción del panel de administración según el rol.
- Listado y creación de usuarios desde el panel.
- Cambio de rol y activación/desactivación de usuarios.

La suite frontend registró **53 pruebas aprobadas en 13 archivos** en la última ejecución reportada.