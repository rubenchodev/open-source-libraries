# Perfil de la IA

Eres un experto en desarrollo de aplicaciones web con **Google Apps Script**, con amplia experiencia en:
- Arquitectura SPA con `google.script.run`
- Integración con Google Drive, Sheets, Docs, Gmail
- Patrones de batch processing para evitar el límite de 30s de ejecución
- Manejo de estado y persistencia en el cliente (IndexedDB, localStorage)
- Diseño responsivo con clases `ak-*` del framework **Agrocity Kit**
- Buenas prácticas de código, estructura modular y control de versiones

Durante todo el desarrollo sigue estrictamente estas convenciones. **La usabilidad y el rendimiento son prioridad**: el usuario debe recibir feedback inmediato, la UI nunca debe congelarse, y todo proceso debe ser reanudable ante interrupciones.

---

# PARTE 1 — Convenciones del proyecto (aplicar siempre)

## 1. Idioma

**Código** (funciones, variables, clases, métodos, archivos): **inglés**.  
**Documentación** (JSDoc, comentarios): **español, concisa, sin extenderse**.

```javascript
// Bien
function calculateTotal(items) { ... }

// Mal
function calcularTotal(items) { ... }
```

---

## 2. Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Variables, funciones, métodos | `camelCase` — inglés | `getUser()`, `totalAmount` |
| Clases, namespaces | `PascalCase` — inglés | `UserService`, `AppConfig` |
| Constantes | `UPPER_SNAKE_CASE` — inglés | `MAX_LOGIN_ATTEMPTS`, `API_URL` |
| Archivos, carpetas | `kebab-case` — inglés | `user-controller.js` |
| Rutas, endpoints | `kebab-case` — inglés | `/api/users/active` |

Abreviaciones aceptadas: `max`, `min`, `id`, `url`, `html`, `db`, `config`, `btn`, `msg`.

Funciones internas (no parte de la interfaz pública) se marcan con `_` al final:

```javascript
function processOrder(order) { ... }       // Pública
function applyDiscounts_(order) { ... }   // Privada
```

---

## 3. Organización del proyecto

```
├── Server/              # Lógica GAS (.js)
│   ├── GlobalParams.js  # Constantes, registro de módulos
│   ├── MainFunctions.js # Funciones compartidas
│   └── ModuleName/
│       └── MainFunctions.js
│
├── Interface/           # Vistas HTML
│   ├── Index.html       # Shell SPA
│   └── ModuleName/
│       └── Index.html
│
├── Javascript/          # Lógica cliente (wrapped en <script>)
│   ├── MainFunctions.html   # Utils compartidos
│   └── ModuleName/
│       └── Functions.html
│
├── Styles/          # Lógica cliente (wrapped en <style>)
│   ├── Root.html   # Utils compartidos
│   └── ModuleName/
│       └── App.html #(wrapped en <style>)
```

### Reglas de estructura

- Cada módulo funcional vive en su propia carpeta en Server/, Interface/, Styles/ y Javascript/
- Los archivos de cada modulo se incluyen con `<?!= includeHtmlFile_('ruta') ?>` ya sea el html, js, o css (aunque si es muy poco mejor solo usar un css)
- Server/ usa `.gs`, todo lo demás usa `.html` con `<script>` o `<style>` según corresponda

---

## 4. Funciones esenciales GAS

### doGet — entry point de la web app

```javascript
/**
 * Maneja las solicitudes GET a la aplicacion web.
 * @param {Object} e - Objeto de evento con parametros de la URL.
 * @return {HtmlOutput} Pagina principal renderizada.
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('Interface/Index');
  const output = template.evaluate();
  output.setTitle(globalParams.appName);
  output.setFaviconUrl('URL_FAVICON');
  output.addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return output;
}
```

### includeHtmlFile — incluir partials HTML

```javascript
/**
 * @desc Funcion encargada de obtener el contenido de un archivo HTML del proyecto.
 * @param {String|String[]} fileName Nombre(s) del archivo HTML.
 * @param {Boolean} isJsCode Es codigo JavaScript entre etiquetas <script>.
 * @param {Array} [params] Parametros para pasar al template.
 * @return {String} Contenido del archivo HTML.
 */
function includeHtmlFile(fileName, isJsCode, params) {
  if (typeof(fileName) == "string") {
    fileName = [fileName];
  }
  let htmlCode = "";
  for (let i = 0; i < fileName.length; i++) {
    const template = HtmlService.createTemplateFromFile(fileName[i]);
    if (params) {
      template.params = params;
    }
    htmlCode += template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).getContent();
    if (isJsCode) {
      htmlCode = htmlCode.replace(/(<script>|<\/script>)/g, "");
      htmlCode = htmlCode.replace(/(^[ \t]*\n)/g, "");
    }
  }
  return htmlCode;
}
```

### GlobalParams — configuración centralizada

En `Server/GlobalParams.gs`:

```javascript
(function(thisRef_) {
  thisRef_.globalParams = {
    projectSheetId: '16umpa65GKqs9vfGf5t5nZ_RbEvugnnj5uHBZP2Nunh0',
    projectFolderId: '1hYsRi3WDyd_Uf8YZWCBUCCe2bxtlkD2f',
    evalSheetId: '11w2HqUEi_3Q0lHiwYot3pCDqzAusdxSTKpEoM4wmcCA',
    evalFolderId: '1hYsRi3WDyd_Uf8YZWCBUCCe2bxtlkD2f',
  };
})(this);
```

### Index.html — shell SPA con Agrocity Kit

```html
<!DOCTYPE html>
<html lang="es" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>TITLE_APP</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/css/agrocity-kit.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/css/agrocity-icons.min.css" />
  <?!= includeHtmlFile('Styles/Root'); ?>
  <?!= includeHtmlFile('Styles/Auth/...'); ?>
</head>
<body class="ak-body">
  BODY_CONTENT
  <script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/js/agrocity-kit.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/js/agrocity-icons.min.js"></script>
  <?!= includeHtmlFile('Javascript/Functions'); ?>
</body>
</html>
```

### Javascript/MainFunctions.html — lógica cliente

```html
<script>
  Ak(function() {
    initComponents_();

    function initComponents_(){}

    <?!= includeHtmlFile("Javascript/__MODULE_NAME__/Functions", true) ?>
  });
</script>
```

---

## 5. Una función, un responsabilidad

```javascript
// Mal
function processOrder(order) {
  validateStock(order);
  calculateTotals(order);
  applyDiscounts(order);
  saveToDB(order);
  sendEmail(order);
  return order;
}

// Bien
function processOrder(order) {
  validateStock(order);
  calculateTotals(order);
  order = saveOrder(order);
  notifyOrder(order);
  return order;
}
```

### Mismo nivel de abstracción

```javascript
// Mal
function prepareOrder() {
  openDBConnection();
  fetchProduct(123);
  var tax = total * 0.21;
  closeDBConnection();
}

// Bien
function prepareOrder() {
  openDBConnection();
  fetchProduct(123);
  calculateTax(total);
  closeDBConnection();
}
```

### Retorno temprano

```javascript
// Mal
function process(id) {
  if (id) {
    if (exists(id)) {
      // 20 líneas
    }
  }
}

// Bien
function process(id) {
  if (!id) return;
  if (!exists(id)) return;
  // 20 líneas
}
```

---

## 6. Manejo de errores

No tragar errores en silencio. No detener todo por un fallo aislado.

```javascript
// Mal
try { process(); } catch (e) {}

// Bien
try {
  process();
} catch (e) {
  console.error('Error al procesar:', e);
  notifyError(e);
}
```

```javascript
items.forEach(function(item) {
  try {
    process(item);
  } catch (e) {
    logError(item, e);
  }
});
```

---

## 7. Persistencia y estado

Separar acceso a datos de lógica de negocio:

```javascript
// Mal
function calculateTotal(orderId) {
  var db = connect();
  var order = db.query(...);
  var total = order.items * order.price;
  db.close();
  return total;
}

// Bien
function calculateTotal(order) {
  return order.items * order.price;
}
```

### Batch processing

Para procesos largos (evitar límite de 30s en GAS):

1. Dividir en lotes (~20s cada uno)
2. Persistir estado en IndexedDB antes de cada lote
3. Permitir pausa, reanudación y recuperación ante fallos

```
State:
  ├── id (único)
  ├── status (running, paused, completed, error)
  ├── pendingItems []
  ├── processedItems []
  ├── resultMap {}
  └── errors []
```

### Operaciones idempotentes

Ejecutar N veces produce el mismo resultado. Esencial para reanudación.

```javascript
function createUser(email) {
  if (db.findByEmail(email)) return;
  return db.insert({ email });
}
```

---

# PARTE 2 — Framework Agrocity Kit (referencia para UI)

## Regla #1: Framework obligatorio

**Todo el HTML/CSS/JS que genere la UI en este proyecto debe usar exclusivamente las clases `ak-*` del framework Agrocity Kit.** No se debe usar Bootstrap, Tailwind, ni CSS custom salvo excepciones justificadas.

> **IMPORTANTE:** Siempre que generes HTML, consulta el catálogo de clases abajo. Si un componente no existe en el framework, pregunta antes de crear CSS personalizado.

---

## Inclusión del framework (CDN)

```html
<!DOCTYPE html>
<html lang="es" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/css/agrocity-kit.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/css/agrocity-icons.min.css" />
</head>
<body class="ak-body">
  <script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/js/agrocity-kit.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/js/agrocity-icons.min.js"></script>
</body>
</html>
```

> Los componentes con `data-ak-*` se auto-inicializan al cargar la página. Para elementos dinámicos usar `AgrocityKit.initElement(contenedor)`.

---

## Design Tokens (variables CSS)

```css
:root {
  --ak-primary: #2B7B41;        --ak-primary-light: #8BAF36;
  --ak-secondary: #2F5597;      --ak-secondary-dark: #012A4E;  --ak-secondary-light: #6488BB;
  --ak-success: #2B7B41;        --ak-danger: #C0392B;
  --ak-warning: #E0A82E;        --ak-info: #6488BB;
  --ak-bg: #FFFFFF;             --ak-surface: #FFFFFF;          --ak-surface-alt: #F4F6F8;
  --ak-text: #1A1A1A;           --ak-text-muted: #696A6A;
  --ak-border: #DEE2E6;         --ak-border-strong: #6488BB;
  --ak-font-family: "Inter", system-ui, sans-serif;
  --ak-font-size: 14.5px;       --ak-line-height: 1.6;
  --ak-radius: 6px;             --ak-radius-sm: 4px;           --ak-radius-lg: 10px;
  --ak-shadow-sm: 0 1px 3px rgba(1,42,78,0.08);
  --ak-shadow: 0 4px 14px rgba(1,42,78,0.1);
  --ak-shadow-lg: 0 10px 32px rgba(1,42,78,0.14);
}

[data-theme="dark"] { /* variables oscuras automáticas */ }
```

---

## Catálogo completo de clases `ak-*`

### 1. Layout — Grid 12 columnas

| Clase | Descripción |
|-------|-------------|
| `.ak-container` | Contenedor responsivo (max-width por breakpoint) |
| `.ak-container-fluid` | Contenedor 100% ancho |
| `.ak-container-{sm\|md\|lg\|xl\|xxl}` | Contenedor con max-width en breakpoint específico |
| `.ak-row` | Fila flexbox con gutter |
| `.ak-col` | Columna flexible equitativa |
| `.ak-col-auto` | Columna de ancho automático |
| `.ak-col-{1..12}` | Columna de N/12 de ancho |
| `.ak-col-{sm\|md\|lg\|xl\|xxl}-{1..12}` | Columna responsiva por breakpoint |
| `.ak-col-{sm\|md\|lg\|xl\|xxl}` | Columna flexible por breakpoint |
| `.ak-col-{sm\|md\|lg\|xl\|xxl}-auto` | Columna auto por breakpoint |
| `.ak-row-cols-{1..4}` | Número de columnas iguales por fila |
| `.ak-row-cols-{sm\|md\|lg}-{2..4}` | Row-cols responsivo |
| `.ak-offset-{1..6}` | Desplazamiento a la derecha (margen izquierdo) |
| `.ak-offset-{md}-{0,3,4}` | Offset responsivo |
| `.ak-g-{0..4}` | Gutter (gap) horizontal y vertical |
| `.ak-gx-{4}` | Gutter solo horizontal |
| `.ak-gy-{2}` | Gutter solo vertical |
| `.ak-gap-{1..4}` | Gap utility (4px/8px/16px/24px) |

### 2. Tipografía

| Clase | Descripción |
|-------|-------------|
| `.ak-h1` a `.ak-h6` | Encabezados (2rem → 0.9rem) |
| `.ak-display-1` a `.ak-display-4` | Display headings (3.5rem → 1.8rem) |
| `.ak-lead` | Párrafo destacado (1.15rem, weight 300) |
| `.ak-small` | Texto pequeño (0.85em) |
| `.ak-mark` / `.ak-highlight` | Texto resaltado con fondo verde |
| `.ak-blockquote` | Cita con borde izquierdo verde |
| `.ak-blockquote-footer` | Pie de cita |
| `.ak-list-unstyled` | Lista sin viñetas |
| `.ak-list-inline` | Lista horizontal inline |

### 3. Imágenes y figuras

| Clase | Descripción |
|-------|-------------|
| `.ak-img-fluid` | Imagen responsiva (max-width: 100%) |
| `.ak-img-thumbnail` | Imagen con borde y padding |
| `.ak-rounded-circle` | Imagen circular |
| `.ak-figure` | Contenedor figure |
| `.ak-figure-img` | Imagen dentro de figure |
| `.ak-figure-caption` | Pie de figura |

### 4. Formularios

| Clase | Descripción |
|-------|-------------|
| `.ak-form-label` | Label de formulario |
| `.ak-form-text` | Texto de ayuda |
| `.ak-form-control` | Input / textarea estándar |
| `.ak-form-control-sm` | Input pequeño |
| `.ak-form-control-lg` | Input grande |
| `.ak-form-select` | Select nativo estilizado |
| `.ak-form-check` | Contenedor checkbox/radio |
| `.ak-form-check-input` | Input checkbox/radio |
| `.ak-form-check-label` | Label de check |
| `.ak-form-switch` | Switch toggle (Material) |
| `.ak-form-switch-input` | Input oculto del switch |
| `.ak-form-switch-toggle` | Toggle visual del switch |
| `.ak-form-range` | Input range estilizado |
| `.ak-input-group` | Grupo input + texto/botón |
| `.ak-input-group-text` | Texto/prefijo del grupo |
| `.ak-form-floating` | Floating label (Material) |
| `.ak-password-wrap` | Wrapper del password toggle |
| `.ak-password-toggle` | Botón ojo mostrar/ocultar |
| `.ak-eye` / `.ak-eye-off` | Iconos ojo del toggle |
| `.ak-form-file` | File input tipo form-control |
| `.ak-form-file-input` | Input file oculto |
| `.ak-form-file-field` | Campo visual del file |
| `.ak-form-file-icon` | Icono SVG en file |
| `.ak-form-file-text` | Texto del placeholder/file |
| `.ak-form-file-clear` | Botón × limpiar |
| `.ak-form-file-list-btn` | Botón ☰ popover lista |
| `.ak-form-file-popover` | Popover lista archivos |
| `.ak-form-file-popover-item` | Item del popover |
| `.ak-form-file-error` | Mensaje error validación |
| `.ak-is-valid` | Estado válido |
| `.ak-is-invalid` | Estado inválido |
| `.ak-valid-feedback` | Feedback de éxito |
| `.ak-invalid-feedback` | Feedback de error |
| `.ak-was-validated` | Clase en form tras validación |

### 5. Botones

| Clase | Descripción |
|-------|-------------|
| `.ak-btn` | Botón base |
| `.ak-btn-primary` | Verde principal |
| `.ak-btn-secondary` | Azul institucional |
| `.ak-btn-success` | Verde éxito |
| `.ak-btn-danger` | Rojo peligro |
| `.ak-btn-warning` | Amarillo advertencia |
| `.ak-btn-info` | Azul info |
| `.ak-btn-light` | Gris claro |
| `.ak-btn-link` | Botón tipo link |
| `.ak-btn-outline-primary` | Outline primary |
| `.ak-btn-outline-secondary` | Outline secondary |
| `.ak-btn-outline-danger` | Outline danger |
| `.ak-btn-outline-success` | Outline success |
| `.ak-btn-outline-warning` | Outline warning |
| `.ak-btn-outline-info` | Outline info |
| `.ak-btn-lg` | Botón grande |
| `.ak-btn-sm` | Botón pequeño |
| `.ak-btn-block` | Botón ancho completo |
| `.ak-active` | Estado activo |
| `.ak-btn-group` | Grupo de botones |
| `.ak-btn-close` | Botón cerrar (×) |

### 6. Componentes

| Clase | Descripción |
|-------|-------------|
| `.ak-badge` | Badge genérico |
| `.ak-badge-pill` | Badge redondeado (pill) |
| `.ak-badge-success/danger/warning/info/primary` | Badge por estado (color) |
| `.ak-alert` | Alerta base |
| `.ak-alert-primary/success/danger/warning/info` | Alerta por tipo |
| `.ak-alert-dismissible` | Alerta descartable |
| `.ak-fade` | Animación fade |
| `.ak-card` | Card base |
| `.ak-card-img-top` | Imagen superior |
| `.ak-card-img-container` | Contenedor flex con fondo y centrado para imagen en card |
| `.ak-card-header` | Header de card |
| `.ak-card-body` | Cuerpo de card |
| `.ak-card-title` | Título de card |
| `.ak-card-subtitle` | Subtítulo |
| `.ak-card-text` | Texto de card |
| `.ak-card-link` | Enlace en card |
| `.ak-card-footer` | Footer de card |
| `.ak-table` | Tabla base |
| `.ak-table-striped` | Filas alternadas |
| `.ak-table-hover` | Hover en filas |
| `.ak-table-bordered` | Bordes en todas las celdas |
| `.ak-table-compact` | Tabla compacta |
| `.ak-table-responsive` | Wrapper scroll horizontal |
| `.ak-nav` | Nav base |
| `.ak-nav-item` | Item de nav |
| `.ak-nav-link` | Link de nav |
| `.ak-nav-tabs` | Tabs |
| `.ak-nav-pills` | Pills |
| `.ak-tab-content` | Contenedor de paneles tab |
| `.ak-tab-pane` | Panel individual de tab |
| `.ak-navbar` | Barra de navegación |
| `.ak-navbar-brand` | Marca/logo |
| `.ak-navbar-toggler` | Botón hamburguesa |
| `.ak-navbar-collapse` | Menú colapsable |
| `.ak-navbar-nav` | Lista de links |
| `.ak-breadcrumb` | Migas de pan |
| `.ak-breadcrumb-item` | Item de breadcrumb |
| `.ak-pagination` | Paginación base |
| `.ak-pagination-sm` | Paginación pequeña |
| `.ak-page-item` | Item de página |
| `.ak-page-link` | Link de página |
| `.ak-list-group` | Lista agrupada |
| `.ak-list-group-item` | Item de list-group |
| `.ak-disabled` | Estado deshabilitado |
| `.ak-accordion` | Acordeón base |
| `.ak-accordion-item` | Item de acordeón |
| `.ak-accordion-header` | Header del item |
| `.ak-accordion-button` | Botón del item |
| `.ak-accordion-body` | Cuerpo colapsable |
| `.ak-collapse` | Contenido colapsable |
| `.ak-collapsed` | Estado colapsado |
| `.ak-show` | Estado visible |
| `.ak-dropdown` | Dropdown container |
| `.ak-dropdown-menu` | Menú desplegable |
| `.ak-dropdown-item` | Item del menú |
| `.ak-dropdown-header` | Header del menú |
| `.ak-dropdown-divider` | Separador |
| `.ak-dropdown-menu-end` | Alineado derecha |
| `.ak-modal` | Modal overlay |
| `.ak-modal-dialog` | Diálogo modal |
| `.ak-modal-dialog-centered` | Centrado vertical |
| `.ak-modal-dialog-sm` | Modal pequeño (340px) |
| `.ak-modal-dialog-lg` | Modal grande (800px) |
| `.ak-modal-content` | Contenido del modal |
| `.ak-modal-header` | Header |
| `.ak-modal-body` | Cuerpo |
| `.ak-modal-footer` | Footer |
| `.ak-modal-title` | Título |
| `.ak-offcanvas` | Panel lateral |
| `.ak-offcanvas-start/end/top/bottom` | Posiciones |
| `.ak-offcanvas-header` | Header offcanvas |
| `.ak-offcanvas-body` | Cuerpo offcanvas |
| `.ak-offcanvas-title` | Título offcanvas |
| `.ak-drawer` | Drawer navegación |
| `.ak-drawer-backdrop` | Fondo oscuro |
| `.ak-drawer-content` | Panel (320px) |
| `.ak-drawer-header` | Header con avatar |
| `.ak-drawer-header-avatar` | Círculo avatar |
| `.ak-drawer-header-title` | Nombre usuario |
| `.ak-drawer-header-subtitle` | Email/rol |
| `.ak-drawer-body` | Área scrollable |
| `.ak-drawer-footer` | Footer fijo |
| `.ak-drawer-subheader` | Etiqueta sección |
| `.ak-drawer-divider` | Separador |
| `.ak-drawer-item` | Item navegación |
| `.ak-drawer-item-icon` | Icono del item |
| `.ak-drawer-sub` | Submenú colapsable |
| `.ak-drawer-sub-item` | Item de submenú |
| `.ak-drawer-persistent` | Drawer persistente (sidebar en desktop, overlay en mobile) |
| `.ak-page` | Panel navegable para drawer-item (show/hide con ak-active) |
| `.ak-avatar` | Imagen avatar circular 32×32 |
| `.ak-nav-user` | Info de usuario en navbar |
| `.ak-nav-user-text` | Contenedor texto del nav-user |
| `.ak-nav-user-name` | Nombre en nav-user |
| `.ak-nav-user-email` | Email en nav-user |
| `.ak-progress` | Barra de progreso |
| `.ak-progress-bar` | Barra interna |
| `.ak-progress-bar-striped` | Rayada |
| `.ak-progress-bar-animated` | Animada |
| `.ak-spinner-border` | Spinner circular |
| `.ak-spinner-border-sm` | Spinner pequeño |
| `.ak-spinner-grow` | Spinner de crecimiento |
| `.ak-toast-container` | Contenedor de toasts |
| `.ak-top-right/left/bottom-right/left` | Posiciones |
| `.ak-toast` | Toast individual |
| `.ak-toast-success/danger/warning/info/primary` | Toast por tipo |
| `.ak-toast-icon-wrap` | Círculo del icono |
| `.ak-toast-icon` | Icono SVG |
| `.ak-toast-body` | Cuerpo texto |
| `.ak-toast-title` | Título |
| `.ak-placeholder-glow` | Animación glow skeleton |
| `.ak-placeholder` | Placeholder skeleton |
| `.ak-carousel` | Carrusel base |
| `.ak-carousel-indicators` | Indicadores |
| `.ak-carousel-inner` | Contenedor slides |
| `.ak-carousel-item` | Slide individual |
| `.ak-carousel-caption` | Texto superpuesto |
| `.ak-carousel-control-prev/next` | Controles |
| `.ak-carousel-control-icon` | Icono control |
| `.ak-scrollspy` | Scroll spy |

### 7. App Layout (Navbar + Drawer + Main)

| Clase | Descripción |
|-------|-------------|
| `.ak-app` | Flex column, min-height 100vh |
| `.ak-app-body` | Flex row, drawer + main |
| `.ak-app-main` | Main content, flex:1, scroll |

### 8. Utilidades CSS

#### Spacing (margin/padding)
Patrón: `ak-{m|p}{t|b|s|e|x|y}-{0..5}` + `.ak-m-auto`
- Niveles: 0=0, 1=4px, 2=8px, 3=16px, 4=24px, 5=32px

#### Sizing
`.ak-w-{25|50|75|100|auto}`
`.ak-h-{25|50|75|100|auto}`

#### Colors (texto)
`.ak-text-{primary|secondary|success|danger|warning|info|muted|white|dark}`

#### Colors (fondo)
`.ak-bg-{primary|secondary|success|danger|warning|info|light|dark|white|surface}`

#### Display
`.ak-d-{none|inline|inline-block|block|flex|inline-flex|grid|table}`
`.ak-d-{sm|md|lg|xl|xxl}-{none|block|flex|...}`

#### Flex
`.ak-flex-{row|column|row-reverse|column-reverse}`
`.ak-flex-{wrap|nowrap|wrap-reverse}`
`.ak-flex-{fill|grow-0|grow-1|shrink-0|shrink-1}`
`.ak-justify-content-{start|end|center|between|around|evenly}`
`.ak-align-items-{start|end|center|baseline|stretch}`
`.ak-align-self-{start|end|center|baseline|stretch}`
`.ak-order-{0..5}`

#### Borders
`.ak-border`, `.ak-border-0`, `.ak-border-{top|end|bottom|start}`
`.ak-border-{primary|secondary|success|danger|warning|info|light|dark}`
`.ak-rounded`, `.ak-rounded-{sm|lg|circle|pill|0}`

#### Shadows
`.ak-shadow-sm`, `.ak-shadow`, `.ak-shadow-lg`, `.ak-shadow-none`

#### Typography
`.ak-fw-{bold|bolder|semibold|normal|light|lighter}`
`.ak-fst-{italic|normal}`
`.ak-text-{start|center|end}`, `.ak-text-{lowercase|uppercase|capitalize}`
`.ak-text-truncate`
`.ak-lh-{1|sm|base|lg}`

#### Overflow
`.ak-overflow-{auto|hidden|scroll|visible}`
`.ak-overflow-{x|y}-{auto|hidden|scroll|visible}`

#### Position
`.ak-position-{relative|absolute|fixed|sticky}`
`.ak-{top|end|bottom|start}-{0|50}`
`.ak-translate-middle`

#### Opacity
`.ak-opacity-{25|50|75|100}`

#### Ratio
`.ak-ratio`, `.ak-ratio-{1x1|4x3|16x9|21x9}`

#### Stacks
`.ak-vstack`, `.ak-hstack`, `.ak-vr`

#### Helpers
`.ak-visually-hidden`, `.ak-clearfix`, `.ak-float-{start|end|none}`
`.ak-stretched-link`, `.ak-focus-ring`, `.ak-z-{0|1|2|3}`

---

## Atributos `data-ak-*` (auto-init)

| Atributo | Componente | Descripción |
|----------|-----------|-------------|
| `data-ak-select` | Custom Select | `<select>` reemplazado |
| `data-ak-datatable` | Data Table | `<table>` interactiva |
| `data-ak-datepicker` | DatePicker | `<input>` selector fecha |
| `data-ak-timepicker` | TimePicker | `<input>` selector hora |
| `data-ak-date-range` | DateRange | Contenedor con 2 datepickers |
| `data-ak-time-range` | TimeRange | Contenedor con 2 timepickers |
| `data-ak-toggle` | Modal/Offcanvas/Collapse/Dropdown/Accordion/Tab/Drawer/Drawer-item/Drawer-sub | Abre/cierra |
| `data-ak-callback` | Drawer-item | Función global a ejecutar al hacer clic (ej: `miFuncion`) |
| `data-ak-dismiss` | Modal/Offcanvas/Alert/Toast | Cierra |
| `data-ak-target` | Todos | Selector del target (#id) |
| `data-ak-carousel` | Carousel | Inicializa carrusel |
| `data-ak-interval` | Carousel | Ms entre slides |
| `data-ak-scrollspy` | ScrollSpy | Container con scroll |
| `data-ak-tooltip` | Tooltip | Tooltip en hover |
| `data-ak-popover` | Popover | Popover en click/hover |
| `data-ak-title` | Tooltip/Popover | Título |
| `data-ak-content` | Popover | Contenido |
| `data-ak-placement` | Tooltip/Popover | top/bottom/left/right |
| `data-ak-trigger` | Popover | click/hover |
| `data-ak-search` | Select | Habilita/deshabilita búsqueda |
| `data-ak-placeholder` | Select/DatePicker | Placeholder |
| `data-ak-ampm` | TimePicker | true = formato 12h |
| `data-ak-no-toggle` | Password | Desactiva el ojo automático |
| `data-ak-icon` | Iconos | Nombre del icono |
| `data-ak-icon-size` | Iconos | Tamaño en px |
| `data-ak-file-list` | File Input | Activa popover lista archivos |
| `data-ak-max-files` | File Input | Máx archivos permitidos |
| `data-ak-max-size` | File Input | Máx tamaño (ej: 2MB) |
| `data-ak-accept` | File Input | Tipos permitidos (.pdf,.jpg) |
| `data-ak-exclude-dates` | DatePicker | Fechas excluidas |
| `data-ak-validation` | Form | Habilita validación reactiva en el formulario |
| `data-ak-validate` | Input/Select/Textarea/File | Reglas de validación separadas por `\|` (ej: `required\|email\|min:3`) |
| `data-ak-msg` | Campo validado | Mensaje de error genérico |
| `data-ak-msg-{rule}` | Campo validado | Mensaje específico por regla (ej: `data-ak-msg-required`) |
| `data-ak-multiple` | Accordion | Permite múltiples paneles abiertos |

---

## API JavaScript (`AgrocityKit`)

```javascript
// Core
AgrocityKit.theme('light' | 'dark' | 'toggle');
AgrocityKit.autoInit();
AgrocityKit.initElement(contenedorOModal, deep = true);
AgrocityKit.destroy(selector);
AgrocityKit.getInstance(element);

// Componentes programáticos (retornan instancia)
AgrocityKit.select(selector, options);
AgrocityKit.dataTable(selector, options);
AgrocityKit.datepicker(selector, options);
AgrocityKit.timepicker(selector, options);
AgrocityKit.dateRange(inputStart, inputEnd);
AgrocityKit.timeRange(inputStart, inputEnd);
AgrocityKit.modal(selector).show() / .hide();
AgrocityKit.offcanvas(selector).show() / .hide();
AgrocityKit.collapse(selector).show() / .hide() / .toggle();
AgrocityKit.dropdown(selector).show() / .hide() / .toggle();
AgrocityKit.drawer(selector).show() / .hide();
AgrocityKit.tab(selector).show();
AgrocityKit.tooltip(selector, { title, placement });
AgrocityKit.popover(selector, { title, content, placement, trigger });
AgrocityKit.carousel(selector, { interval });
AgrocityKit.alert(selector).close();
AgrocityKit.scrollspy(selector, { target, offset });

// Utilidades
AgrocityKit.passwordToggle(root);
AgrocityKit.fileInput(root);
AgrocityKit.formValidation('init', formSelector, { onSuccess, onError });
AgrocityKit.formValidation('field', fieldElement);
AgrocityKit.formValidation('validate', formSelector); // fuerza validación completa, retorna true/false
AgrocityKit.formValidation('reset', formSelector); // limpia estado visual de validación
AgrocityKit.showToast(message, { type, position, duration, title });
AgrocityKit.loader(show, [messages]);
AgrocityKit.loader(true).setMessages(['nuevos', 'mensajes']); // actualiza sin reiniciar animación
AgrocityKit.alert(msg);
AgrocityKit.confirm(msg, callback);
AgrocityKit.prompt(msg, defaultValue, callback);

// Eventos de componentes
// document.addEventListener('ak:drawer:item:click', (e) => { e.detail.target, e.detail.panel });

// Iconos (con agrocity-icons.js)
AgrocityKit.icon(name, size = 20, { class });
```

---

## Iconos SVG (+50)

| Nombre | Icono | Nombre | Icono |
|--------|-------|--------|-------|
| `home` | 🏠 | `search` | 🔍 |
| `menu` | ☰ | `close` | ✕ |
| `chevron-down/up/left/right` | ⬇⬆◀▶ | `arrow-left/right` | ← → |
| `plus` / `minus` | + − | `settings` | ⚙ |
| `more-vertical` | ⋮ | `edit` / `trash` | ✎ 🗑 |
| `download` / `upload` | ⬇ ⬆ | `external` / `refresh` | 🔗 🔄 |
| `user` / `users` | 👤 👥 | `bell` / `mail` | 🔔 ✉ |
| `info` / `alert` | ℹ ⚠ | `check` / `x` | ✓ ✗ |
| `seed` / `sprout` | 🌱 🌿 | `sun` / `droplet` | ☀ 💧 |
| `map-pin` / `map` | 📍 🗺 | `tractor` | 🚜 |
| `calendar` / `clock` | 📅 🕐 | `target` | 🎯 |
| `bar-chart` | 📊 | `trending-up/down` | 📈📉 |
| `star` / `heart` | ★ ♥ | `file` / `folder` | 📄 📁 |
| `image` / `printer` | 🖼 🖨 | `smartphone` / `wifi` | 📱 📶 |
| `columns` | 📋 | | |

Uso: `<span data-ak-icon="home"></span>` o `AgrocityKit.icon('search', 24)`

Clases para iconos:
- Tamaños: `.ak-icon-{xs\|sm\|md\|lg\|xl}`
- Colores: `.ak-icon-{primary\|muted\|danger}`
- Estados: `.ak-icon-spin`, `.ak-icon-pulse`
- Botón: `.ak-icon-btn`

---

## Ejemplos de layouts comunes

### Dashboard con sidebar
```html
<body class="ak-body ak-app">
  <nav class="ak-navbar">
    <a href="#" class="ak-navbar-brand">🌱 App</a>
    <button class="ak-navbar-toggler" data-ak-toggle="drawer" data-ak-target="#drawer">☰</button>
  </nav>
  <div class="ak-app-body">
    <div class="ak-drawer" id="drawer">
      <div class="ak-drawer-backdrop"></div>
      <div class="ak-drawer-content">
        <div class="ak-drawer-header">
          <div class="ak-drawer-header-avatar">AK</div>
          <div>
            <div class="ak-drawer-header-title">Usuario</div>
            <div class="ak-drawer-header-subtitle">email@email.com</div>
          </div>
        </div>
        <div class="ak-drawer-body">
          <div class="ak-drawer-subheader">Menú</div>
          <button class="ak-drawer-item ak-active">
            <span class="ak-drawer-item-icon" data-ak-icon="bar-chart"></span>
            <span>Dashboard</span>
          </button>
          <button class="ak-drawer-item" data-ak-toggle="drawer-sub" data-ak-target="#sub1">
            <span class="ak-drawer-item-icon" data-ak-icon="folder"></span>
            <span>Trámites</span>
            <svg class="bd-chevron" viewBox="0 0 24 24" width="16" height="16" style="margin-left:auto;">...</svg>
          </button>
          <div id="sub1" class="ak-drawer-sub">
            <a class="ak-drawer-sub-item">Opción 1</a>
            <a class="ak-drawer-sub-item">Opción 2</a>
          </div>
        </div>
        <div class="ak-drawer-footer">
          <button class="ak-drawer-item" data-ak-icon="log-out">Cerrar sesión</button>
        </div>
      </div>
    </div>
    <main class="ak-app-main ak-p-4">
      <!-- Contenido aquí -->
    </main>
  </div>
</body>
```

### Formulario con validación
```html
<form class="ak-container ak-mt-4" data-ak-validation novalidate>
  <div class="ak-row">
    <div class="ak-col-12 ak-col-md-6 ak-mb-3">
      <label class="ak-form-label" for="nombre">Nombre <span class="ak-text-danger">*</span></label>
      <input type="text" id="nombre" name="nombre" class="ak-form-control" data-ak-validate="required" data-ak-msg="Campo requerido" required />
    </div>
    <div class="ak-col-12 ak-col-md-6 ak-mb-3">
      <label class="ak-form-label" for="email">Email <span class="ak-text-danger">*</span></label>
      <input type="email" id="email" name="email" class="ak-form-control" data-ak-validate="required|email" data-ak-msg-email="Email inválido" required />
    </div>
  </div>
  <button type="submit" class="ak-btn ak-btn-primary">Guardar</button>
</form>
```
> Los divs `.ak-valid-feedback` y `.ak-invalid-feedback` se crean automáticamente si no existen en el DOM.

### Tabla con DataTable
```html
<div class="ak-table-responsive">
  <table data-ak-datatable class="ak-table ak-table-striped ak-table-hover">
    <thead>
      <tr>
        <th>Nombre</th>
        <th data-type="number">Cantidad</th>
        <th data-sortable="false">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Item 1</td><td>10</td><td><button class="ak-btn ak-btn-sm ak-btn-primary">Editar</button></td></tr>
    </tbody>
  </table>
</div>
```

### Modal
```html
<button class="ak-btn ak-btn-primary" data-ak-toggle="modal" data-ak-target="#miModal">Abrir</button>
<div class="ak-modal" id="miModal" tabindex="-1" aria-hidden="true">
  <div class="ak-modal-dialog ak-modal-dialog-centered">
    <div class="ak-modal-content">
      <div class="ak-modal-header">
        <h5 class="ak-modal-title">Título</h5>
        <button class="ak-btn-close" data-ak-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="ak-modal-body">Contenido</div>
      <div class="ak-modal-footer">
        <button class="ak-btn ak-btn-secondary" data-ak-dismiss="modal">Cancelar</button>
        <button class="ak-btn ak-btn-primary">Guardar</button>
      </div>
    </div>
  </div>
</div>
```

---

## 🔴 Recordatorio final

**Siempre revisar este archivo (AGENTS.md) antes de generar cualquier HTML/CSS/JS en este proyecto. No usar clases Bootstrap, Tailwind ni CSS externo. Todo debe construirse con clases `ak-*` del framework Agrocity Kit.**

Si necesitas un componente o estilo que no existe en el framework, preguntar antes de crear CSS personalizado.
