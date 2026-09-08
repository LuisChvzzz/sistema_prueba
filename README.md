# CloudAcc 📱☁️
### Sistema de Gestión 100% en la Nube para Negocios de Accesorios de Celulares

Un sistema web moderno, minimalista, reactivo y escalable diseñado específicamente para el control de inventario, punto de venta (POS), cobros ágiles, emisión de tickets térmicos y analítica en tiempo real para tiendas de accesorios para smartphones.

---

## 🌟 Características Principales

1. **Especializado en Accesorios para Smartphones**:
   - Atributos por modelo de teléfono compatible (*iPhone 15 Pro, Galaxy S24 Ultra, Xiaomi Redmi Note 13, Universal*, etc.).
   - Categorías predefinidas: Fundas & Cases, Micas & Vidrio Templado 9D, Cargadores GaN & Cables reforzados, Audio & TWS con cancelación de ruido, Soportes MagSafe y Baterías Portátiles.
   - Generador automático de SKUs inteligentes y códigos de barras.
   - Cálculo dinámico de **Margen de Ganancia (%)** y ganancia neta en tiempo real.

2. **Terminal Punto de Venta (POS) Ultra Ágil**:
   - Búsqueda predictiva instantánea por accesorio, marca, modelo o SKU.
   - Filtros rápidos tipo pastilla/chips por modelo compatible y categoría.
   - Carrito de venta interactivo con selector de cantidades y descuentos.
   - Métodos de pago flexibles: Efectivo (con botones rápidos de denominación y cálculo de cambio), Tarjeta, Transferencia Digital / QR y Pago Mixto.
   - **Comprobante Térmico Digital (80mm)**: listo para imprimir en impresoras térmicas de tickets o compartir por WhatsApp con 1 clic.

3. **Control de Inventario & Alertas de Stock**:
   - Tabla de existencias con semáforos de estado (*En Stock, Stock Bajo, Agotado*).
   - Alertas automáticas de desabastecimiento según el stock mínimo configurado.
   - Modal de ajuste rápido de existencias (entradas por proveedor o salidas por merma/garantía).
   - Exportación de catálogo completo a formato CSV.

4. **Auditoría de Ventas & Devoluciones**:
   - Historial detallado de todas las transacciones realizadas.
   - Reimpresión de tickets en cualquier momento.
   - Función de devolución o reembolso con reingreso automático de piezas al stock.
   - Exportación de libro de ventas a CSV.

5. **100% en la Nube & Conectividad Multi-Terminal**:
   - **Offline-First**: Funciona de inmediato sin requerir configuración compleja.
   - **Conector Cloud**: Listo para vincularse con **Supabase (PostgreSQL)**, **Firebase Firestore** o **API REST**.
   - **Centro de Respaldos (Snapshot JSON)**: Exporta e importa copias de seguridad de toda la base de datos con un clic.
   - Diseño adaptable con soporte nativo para **Modo Oscuro** y **Modo Claro**.

---

## 🚀 Cómo Ejecutar Localmente

No requiere instalación de dependencias pesadas. Puedes iniciar un servidor local en segundos con cualquiera de los siguientes métodos:

### Opción 1: Con Python (Mac / Linux / Windows)
```bash
python3 -m http.server 3000
```
Luego abre tu navegador en: `http://localhost:3000`

### Opción 2: Con Node.js / NPX
```bash
npx serve .
```

---

## ☁️ Guía de Despliegue 100% en la Nube (Gratis)

CloudAcc está optimizado para funcionar en la nube con alta disponibilidad, certificado SSL (HTTPS) y latencia mínima.

### 1. Despliegue en Vercel
1. Ingresa a [vercel.com](https://vercel.com) e inicia sesión.
2. Arrastra y suelta la carpeta del proyecto en el panel, o conéctalo con tu repositorio de GitHub.
3. Haz clic en **Deploy**. En menos de 30 segundos tendrás tu enlace público (ej. `https://tu-tienda.vercel.app`).

### 2. Despliegue en Netlify
1. Ingresa a [netlify.com](https://netlify.com).
2. En la sección "Sites", arrastra la carpeta del proyecto a la zona "Drag and drop your site output folder".
3. Tu sistema estará en línea al instante.

### 3. Despliegue en Cloudflare Pages
1. Sube tu proyecto a un repositorio en GitHub.
2. Ve a Cloudflare Dashboard > Workers & Pages > Create application > Pages > Connect to Git.
3. Selecciona tu repositorio y presiona "Save and Deploy".

### 4. Conectar con Supabase (Base de datos en la nube en tiempo real)
1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Ve al menú **Configuración Nube** dentro de CloudAcc.
3. Pega tu `Project URL` y tu `Public Anon Key`.
4. Haz clic en **Probar Conexión (Ping)** y **Guardar Conexión Cloud**. ¡Listo! Todas tus terminales compartirán el mismo inventario en tiempo real.

---

## 🛠️ Estructura del Código

```
├── index.html               # Estructura semántica principal y shell SPA
├── css/
│   ├── main.css             # Tokens de diseño, tipografía y variables de modo oscuro/claro
│   ├── layout.css           # Sidebar reactivo, header adhesivo y contenedores
│   └── components.css       # Tarjetas KPI, tablas, catálogo POS, ticket térmico y modales
├── js/
│   ├── app.js               # Enrutador por hash y ciclo de vida de la aplicación
│   ├── store.js             # Gestor de estado reactivo y motor de sincronización nube
│   ├── sample-data.js       # Catálogo inicial curado para telefonía celular
│   ├── views/
│   │   ├── dashboard.js     # Tablero ejecutivo y gráficos de ventas
│   │   ├── pos.js           # Terminal de venta, cobro y recibo térmico
│   │   ├── inventory.js     # Catálogo, CRUD y cálculo de márgenes
│   │   ├── sales.js         # Historial, reembolsos y exportación
│   │   └── settings.js      # Parámetros cloud, perfil y respaldos
│   └── utils/
│       ├── formatters.js    # Moneda, fechas, cálculo de márgenes y SKUs
│       └── notifications.js # Sistema flotante de avisos Toast
└── README.md                # Documentación del sistema
```
