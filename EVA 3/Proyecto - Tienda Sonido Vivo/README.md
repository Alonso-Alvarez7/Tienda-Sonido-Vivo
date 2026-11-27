# Sonido Vivo — Plataforma de Comercio Electrónico

## 1. Descripción General del Proyecto

**Sonido Vivo** es una aplicación web full-stack orientada a la gestión y comercialización de instrumentos musicales, equipos de audio y accesorios. El sistema implementa una arquitectura cliente-servidor desacoplada que contempla:

- **Frontend (SPA):** Desarrollado en React 19 y Vite, con enrutamiento protegido por roles, catálogo filtrable, carrito de compras con persistencia en almacenamiento local, proceso de checkout (retiro en tienda o despacho a domicilio) y paneles de administración.
- **Backend (API REST):** Desarrollado en Java 21 con Spring Boot 4, Spring Data JPA y Spring Security con autenticación basada en tokens JWT (stateless).
- **Base de Datos Relacional:** Implementada en MySQL / MariaDB (gestionada localmente mediante XAMPP y phpMyAdmin).

---

## 2. Estructura del Directorio de Trabajo

Todos los componentes de la entrega se encuentran organizados dentro del directorio raíz **`EVA3/`** bajo la siguiente estructura:

```text
EVA3/
├── backend/
│   └── sonidoVivoApi/      # Proyecto Maven con la API REST en Spring Boot
├── database/               # Scripts SQL de creación de esquema y carga inicial de datos
├── documentacion/          # Documentación técnica, diagramas y respaldos del proyecto
├── frontend/               # Aplicación cliente en React + Vite
└── README.md               # Manual de instalación, configuración y ejecución local
```

---

## 3. Requisitos del Entorno Local

Para ejecutar correctamente el sistema en un entorno local, se requieren las siguientes herramientas instaladas:

1. **XAMPP** (con los módulos **Apache** y **MySQL** operativos).
2. **Java Development Kit (JDK) 21** configurado en las variables de entorno del sistema (`JAVA_HOME` y `PATH`).
3. **Apache Maven 3.9 o superior** (opcional, ya que el proyecto incluye el wrapper `mvnw` / `mvnw.cmd`).
4. **Node.js (versión 20 LTS o superior)** y **npm**.

---

## 4. Procedimiento de Levantamiento del Proyecto

Para asegurar el correcto funcionamiento del sistema, los servicios deben iniciarse en el siguiente orden estricto: **Base de Datos -> Backend -> Frontend**.

### 4.1. Levantamiento de la Base de Datos (XAMPP y phpMyAdmin)

1. Abra el **Panel de Control de XAMPP (XAMPP Control Panel)**.
2. Inicie los servicios **Apache** y **MySQL** presionando el botón `Start` en cada uno, verificando que ambos queden marcados en verde (puerto `3306` activo para MySQL).
3. Abra su navegador web e ingrese al gestor **phpMyAdmin** mediante la dirección:
   ```text
   http://localhost/phpmyadmin
   ```
4. En el menú superior de phpMyAdmin, seleccione la pestaña **SQL** (o utilice la opción **Importar**).
5. Ejecute el script SQL unificado ubicado en:
   ```text
   EVA3/database/BaseDatos_sonidoVivo.sql
   ```
6. Verifique en el panel izquierdo de phpMyAdmin que se haya creado la base de datos **`sonido_vivo`** con sus 6 tablas (`categorias`, `productos`, `roles`, `usuarios`, `pedidos`, `detalle_pedidos`) y sus registros iniciales (3 roles, 10 categorías y 51 productos).

> **Nota sobre ejecución modular:** Si se desea ejecutar los scripts por separado en lugar del archivo unificado, deben ejecutarse obligatoriamente en el siguiente orden para respetar las restricciones de claves foráneas:
> 1. `EVA3/database/01_catalogo.sql`
> 2. `EVA3/database/02_pedidos.sql`
> 3. `EVA3/database/03_usuarios.sql`

---

### 4.2. Configuración y Ejecución del Backend (API REST)

1. Verifique la configuración de conexión en el archivo:
   ```text
   EVA3/backend/sonidoVivoApi/src/main/resources/application-mysql.properties
   ```
   Por defecto, el sistema está configurado para conectarse a una instalación estándar de XAMPP:
   - **URL:** `jdbc:mariadb://localhost:3306/sonido_vivo`
   - **Usuario:** `root`
   - **Contraseña:** *(vacía)*

   *(En caso de que su instancia local de MySQL utilice un puerto o contraseña distintos, puede ajustarlos mediante las variables de entorno `DB_PORT`, `DB_USER` y `DB_PASSWORD`, o modificando directamente el archivo de propiedades).*

2. Abra una terminal, sitúese en el directorio del backend y ejecute la aplicación:
   ```bash
   cd EVA3/backend/sonidoVivoApi
   ```
   - **En sistemas Windows:**
     ```bash
     mvnw.cmd spring-boot:run
     ```
   - **En sistemas Linux / macOS:**
     ```bash
     ./mvnw spring-boot:run
     ```

3. Espere hasta visualizar en consola el mensaje de inicio exitoso de Spring Boot (`Started SonidoVivoApiApplication`). La API quedará operativa en:
   ```text
   http://localhost:8080
   ```
4. Al arrancar, el componente `AdminInitializer` registrará automáticamente el usuario administrador inicial en la tabla `usuarios` si aún no existe.
5. Para consultar y probar los endpoints de forma interactiva, puede acceder a la interfaz **Swagger UI** en:
   ```text
   http://localhost:8080/swagger-ui.html
   ```

---

### 4.3. Instalación de Dependencias y Ejecución del Frontend

1. Abra una **segunda terminal** (manteniendo el backend en ejecución) y ubíquese en el directorio del frontend:
   ```bash
   cd EVA3/frontend
   ```
2. Instale las dependencias del proyecto definidas en `package.json`:
   ```bash
   npm install
   ```
3. *(Opcional)* El frontend apunta por defecto a `http://localhost:8080/api`. Si requiere modificar esta ruta, cree un archivo `.env` en `EVA3/frontend/` con la siguiente variable:
   ```env
   VITE_API_URL=http://localhost:8080/api
   ```
4. Inicie el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
5. Una vez compilado, ingrese desde su navegador web a la dirección:
   ```text
   http://localhost:5173
   ```

---

## 5. Control de Acceso, Roles y Credenciales

El sistema gestiona tres perfiles de usuario con permisos diferenciados tanto en la interfaz gráfica como en los filtros de seguridad de la API:

| Rol | Credenciales de Acceso | Capacidades y Permisos en el Sistema |
| :--- | :--- | :--- |
| **Administrador** (`ADMIN`) | **Correo:** `admin@sonidovivo.cl`<br>**Clave:** `1234admin` | Acceso completo al panel de administración (`/admin`) para crear usuarios, asignar roles y activar o desactivar cuentas. Acceso al panel de vendedor, gestión de inventario y administración total del catálogo. |
| **Vendedor** (`VENDEDOR`) | *(Crear desde el panel `/admin`)* | Acceso al panel de vendedor (`/vendedor`) para visualizar todos los pedidos registrados, actualizar el estado de despacho/entrega y ajustar el stock disponible de los productos. |
| **Cliente** (`CLIENTE`) | *(Crear mediante registro público en `/registro`)* | Navegación por el catálogo, gestión del carrito de compras, confirmación de pedidos en `/checkout` (retiro en tienda o despacho) y seguimiento de historial en `/mis-pedidos`. |

---

## 6. Ejecución de Pruebas Automatizadas

El proyecto incorpora suites de pruebas unitarias, de integración y de control de seguridad en ambas capas.

### 6.1. Pruebas del Backend (JUnit 5 y MockMvc)

Las pruebas del backend utilizan el perfil `test` configurado con una base de datos **H2 en memoria**, por lo que no requieren conexión a XAMPP ni alteran los datos de MySQL:

```bash
cd EVA3/backend/sonidoVivoApi
mvnw.cmd test
```
*(En Linux o macOS ejecutar `./mvnw test`)*.

### 6.2. Pruebas del Frontend (Vitest y React Testing Library)

Para ejecutar las pruebas de componentes, servicios y validaciones del frontend:

```bash
cd EVA3/frontend
npm test
```

Para generar el informe de cobertura de código:

```bash
npm run test:coverage
```

---

## 7. Resumen de Endpoints de la API (`/api`)

| Método HTTP | Ruta | Rol Requerido | Descripción Funcional |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/registro` | Público | Registra un nuevo usuario con rol `CLIENTE`. |
| `POST` | `/api/auth/login` | Público | Autentica credenciales y retorna el token JWT de sesión. |
| `GET` | `/api/productos` | Público | Lista productos activos. Soporta filtros `?texto=` y `?categoria=`. |
| `GET` | `/api/productos/{codigo}` | Público | Obtiene el detalle de un producto específico por su código. |
| `POST` | `/api/productos` | `ADMIN` | Registra un nuevo producto en el catálogo. |
| `PUT` | `/api/productos/{codigo}` | `ADMIN` | Actualiza los datos de un producto existente. |
| `DELETE` | `/api/productos/{codigo}` | `ADMIN` | Realiza la baja lógica (desactivación) de un producto. |
| `PATCH` | `/api/productos/{codigo}/activar` | `ADMIN` | Reactiva un producto previamente desactivado. |
| `PATCH` | `/api/productos/{codigo}/stock` | `ADMIN`, `VENDEDOR` | Actualiza la cantidad de stock disponible de un producto. |
| `GET` | `/api/categorias` | Público | Lista todas las categorías de productos registradas. |
| `POST` | `/api/pedidos` | `CLIENTE` | Crea un nuevo pedido, calcula el total en servidor y descuenta stock. |
| `GET` | `/api/pedidos/mis-pedidos` | `CLIENTE` | Lista el historial de pedidos del cliente autenticado. |
| `GET` | `/api/pedidos` | `ADMIN`, `VENDEDOR` | Lista todos los pedidos del sistema (filtro opcional `?estado=`). |
| `GET` | `/api/pedidos/{id}` | `CLIENTE`, `VENDEDOR`, `ADMIN` | Obtiene el detalle de un pedido (clientes solo acceden a los propios). |
| `PATCH` | `/api/pedidos/{id}/estado` | `ADMIN`, `VENDEDOR` | Actualiza el estado del pedido respetando las transiciones válidas. |
| `GET` | `/api/usuarios` | `ADMIN` | Lista todos los usuarios registrados en el sistema. |
| `POST` | `/api/usuarios` | `ADMIN` | Crea un usuario asignando explícitamente su rol. |
| `PATCH` | `/api/usuarios/{id}/rol` | `ADMIN` | Modifica el rol de un usuario existente. |
| `PATCH` | `/api/usuarios/{id}/estado` | `ADMIN` | Activa o desactiva la cuenta de un usuario. |