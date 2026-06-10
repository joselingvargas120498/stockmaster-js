Este es un diseño integral para tu sistema de inventarios. Al usar **Supabase**, aprovecharemos PostgreSQL como base de datos y su API automática para interactuar con JavaScript puro y AJAX.

---

### 1. Modelo de Datos (PostgreSQL - Supabase)

Este modelo está normalizado para asegurar la integridad de los datos y permitir un rastreo histórico de movimientos.

#### Tabla: `categories` (Categorías de productos)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Identificador único. |
| `name` | varchar | Nombre de la categoría (ej. Electrónica). |
| `description` | text | Descripción opcional. |
| `created_at` | timestamp | Fecha de creación. |

#### Tabla: `suppliers` (Proveedores)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Identificador único. |
| `name` | varchar | Nombre de la empresa/proveedor. |
| `contact_name` | varchar | Persona de contacto. |
| `email` | varchar | Email de contacto. |
| `phone` | varchar | Teléfono. |

#### Tabla: `products` (Catálogo de productos)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Identificador único. |
| `sku` | varchar (Unique) | Código de barras o SKU único. |
| `name` | varchar | Nombre del producto. |
| `description` | text | Detalles del producto. |
| `price` | numeric(10,2) | Precio de venta. |
| `cost` | numeric(10,2) | Costo de adquisición. |
| `stock_quantity` | int | Stock actual (se actualiza con triggers). |
| `min_stock` | int | Alerta de stock mínimo. |
| `category_id` | uuid (FK) | Relación con `categories`. |
| `supplier_id` | uuid (FK) | Relación con `suppliers`. |

#### Tabla: `inventory_transactions` (Movimientos: Entradas/Salidas)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Identificador único. |
| `product_id` | uuid (FK) | Producto afectado. |
| `type` | varchar | 'IN' (Entrada) o 'OUT' (Salida). |
| `quantity` | int | Cantidad movida. |
| `reason` | varchar | Ej: "Venta", "Compra", "Ajuste", "Devolución". |
| `created_at` | timestamp | Fecha del movimiento. |
| `user_id` | uuid (FK) | Usuario que realizó la acción (Auth de Supabase). |

---

### 2. Informe de Especificaciones de Software

#### 2.1 Información General
*   **Nombre del Proyecto:** Sistema de Gestión de Inventarios "StockMaster JS"
*   **Propósito:** Controlar el flujo de productos, gestionar stock mínimo, proveedores y movimientos de entrada/salida de almacén.
*   **Stack Tecnológico:**
    *   **Backend/Base de Datos:** Supabase (PostgreSQL, Auth, Realtime).
    *   **Frontend:** HTML5, CSS3 (Tailwind CSS).
    *   **Lógica de Negocio:** JavaScript Puro (Vanilla JS - ES6+).
    *   **Comunicación:** AJAX (vía Supabase JS Client / Fetch API).
    *   **Tipografía:** Google Fonts (Inter o Roboto sugeridas).

#### 2.2 Requerimientos Funcionales (RF)
1.  **RF1 - Gestión de Productos:** El sistema debe permitir Crear, Leer, Actualizar y Eliminar (CRUD) productos.
2.  **RF2 - Control de Stock:** El sistema debe actualizar automáticamente el `stock_quantity` en la tabla `products` cada vez que se registre una transacción en `inventory_transactions`.
3.  **RF3 - Alertas de Inventario:** Mostrar visualmente (ej. color rojo) los productos cuya cantidad sea menor al `min_stock`.
4.  **RF4 - Historial de Movimientos:** Listar cronológicamente todas las entradas y salidas.
5.  **RF5 - Autenticación:** Solo usuarios registrados en Supabase Auth pueden acceder al sistema.
6.  **RF6 - Reportes Rápidos:** Visualización de valor total del inventario (Costo * Stock).

#### 2.3 Requerimientos No Funcionales (RNF)
1.  **RNF1 - Interfaz Responsiva:** Uso de Tailwind CSS para garantizar que el sistema funcione en tablets y desktops.
2.  **RNF2 - Velocidad de Carga:** El uso de JS puro y AJAX debe garantizar transiciones rápidas sin recargar toda la página (SPA Style).
3.  **RNF3 - Seguridad:** Implementar Políticas de Seguridad a Nivel de Fila (RLS) en Supabase para proteger los datos.
4.  **RNF4 - Estética:** Tipografía clara mediante Google Fonts para mejorar la legibilidad de tablas de datos.

#### 2.4 Arquitectura del Frontend
Para mantener el código organizado sin frameworks como React o Vue:
*   **`index.html`:** Estructura base y contenedor principal.
*   **`/assets/css/`:** Configuración de Tailwind (vía CDN o CLI).
*   **`/src/auth.js`:** Lógica de inicio de sesión y protección de rutas.
*   **`/src/api.js`:** Funciones asíncronas (AJAX) para interactuar con Supabase (ej: `getProducts()`, `addTransaction()`).
*   **`/src/ui.js`:** Funciones de manipulación del DOM para renderizar tablas y modales.
*   **`/src/app.js`:** Punto de entrada y orquestador de eventos.

---

### 3. Sugerencias de Diseño UI (Tailwind)

*   **Paleta de colores:**
    *   Primario: `bg-slate-900` (Sidebar/Nav)
    *   Acción: `bg-indigo-600` (Botones)
    *   Alerta: `text-red-500` (Stock bajo)
*   **Tipografía:** Usar **'Inter'** desde Google Fonts:
    ```html
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; }</style>
    ```

### 4. Flujo de Trabajo (Ejemplo de Lógica AJAX)

Cuando el usuario registra una **salida** de producto:
1. JS captura el formulario (ID Producto, Cantidad).
2. Se envía una petición `POST` a la tabla `inventory_transactions` vía Supabase Client.
3. Se dispara un **Database Trigger** en Supabase que resta la cantidad en la tabla `products`.
4. El frontend recibe la confirmación y actualiza la tabla en pantalla sin recargar (DOM manipulation).

---

¿Te gustaría que te ayude con el código inicial de la conexión a Supabase o con el diseño de la tabla principal en Tailwind?