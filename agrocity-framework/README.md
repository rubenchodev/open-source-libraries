# 🌱 Agrocity Kit

Framework UI ligero, sin dependencias, construido con CSS y JavaScript vanilla. Inspirado en Bootstrap 5 y optimizado para aplicaciones agrícolas y de gestión de recursos naturales.

---

## ✨ Características

- **Sin dependencias** — CSS y JS puros, sin jQuery ni librerías externas
- **Diseño Bootstrap × Material** — Lo mejor de ambos mundos: utilidad de Bootstrap + elegancia de Material Design
- **Tema claro/oscuro** — Toggle automático via `data-theme="dark"` o JS
- **Grid de 12 columnas** — Con breakpoints `sm / md / lg / xl / xxl`
- **+30 componentes** — Todos los componentes equivalentes a Bootstrap 5
- **Accesible** — ARIA roles, focus ring, visually-hidden
- **Ligero** — ~85KB CSS + ~75KB JS sin minificar
- **Password toggle automático** — Ojo mostrar/ocultar en todo input[type="password"] (desactivable con `data-ak-no-toggle`)
- **API JavaScript declarativa** — `data-ak-*` attributes + API JS

---

## 🚀 Instalación

### Desde CDN (jsDelivr)

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

  <!-- Tu contenido aquí -->

  <script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/js/agrocity-kit.min.js"></script>
  <!-- Opcional: iconos SVG -->
  <script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/js/agrocity-icons.min.js"></script>
</body>
</html>
```

> **Nota:** Si experimentas problemas de caché, purga el CDN en https://www.jsdelivr.com/tools/purge

### Descarga local

Clona el repositorio y usa los archivos directamente:

```html
<link rel="stylesheet" href="dist/css/agrocity-kit.min.css" />
<script src="dist/js/agrocity-kit.min.js"></script>
<!-- Opcional: iconos SVG -->
<link rel="stylesheet" href="dist/css/agrocity-icons.min.css" />
<script src="dist/js/agrocity-icons.min.js"></script>
```

> **Nota:** El atributo `class="ak-body"` en `<body>` activa el reset de estilos base. Incluye `agrocity-icons.min.js` para +50 iconos SVG vía `data-ak-icon` o `AgrocityKit.icon()`.

---

## 📦 Archivos

```
agrocity-framework/
├── dist/
│   ├── css/agrocity-kit.min.css       # Framework CSS minificado
│   ├── css/agrocity-icons.min.css     # Utilidades iconos minificado
│   ├── js/agrocity-kit.min.js         # Framework JS minificado
│   └── js/agrocity-icons.min.js       # Iconos SVG minificado
├── src/
│   ├── css/agrocity-kit.css           # Fuente CSS
│   └── js/agrocity-kit.js             # Fuente JS
├── examples/
│   ├── index.html                     # Documentación y demos de todos los componentes
│   ├── example.html                   # Ejemplo completo de componentes
│   ├── dashboard.html                 # Dashboard agrícola con sidebar + stats + tabla
│   ├── landing.html                   # Página promocional con hero, features, precios
│   ├── form.html                      # Formulario de registro con validación
│   ├── app-mobile.html                # Layout tipo app móvil con bottom nav
│   └── navbar-drawer.html             # Navbar + Drawer responsive (sidebar desktop, overlay móvil)
├── build.mjs                          # Script de build (Rollup + Terser + CleanCSS)
├── package.json
└── README.md
```

> **Iconos:** Incluye `agrocity-icons.min.js` después de `agrocity-kit.min.js` para +50 iconos SVG vía `AgrocityKit.icon()` o `data-ak-icon`.

---

## 🎨 Variables CSS (Design Tokens)

Todas las variables están definidas en `:root` y se sobrescriben para el tema oscuro en `[data-theme="dark"]`.

```css
:root {
  /* Colores principales */
  --ak-primary:         #2B7B41;   /* Verde principal */
  --ak-primary-light:   #8BAF36;   /* Verde lima */
  --ak-secondary:       #2F5597;   /* Azul institucional */
  --ak-secondary-dark:  #012A4E;   /* Azul profundo */
  --ak-secondary-light: #6488BB;   /* Azul acero */

  /* Estados */
  --ak-success: #2B7B41;
  --ak-danger:  #C0392B;
  --ak-warning: #E0A82E;
  --ak-info:    #6488BB;

  /* Tipografía */
  --ak-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --ak-font-size:   14px;

  /* Formas */
  --ak-radius:    8px;
  --ak-radius-sm: 4px;
  --ak-radius-lg: 12px;

  /* Sombras */
  --ak-shadow-sm: 0 1px 2px rgba(1,42,78,0.08);
  --ak-shadow:    0 4px 12px rgba(1,42,78,0.12);
  --ak-shadow-lg: 0 10px 30px rgba(1,42,78,0.18);
}
```

### Tema oscuro

```html
<!-- Activar tema oscuro en el HTML -->
<html data-theme="dark">

<!-- O con JavaScript -->
<script>
  AgrocityKit.theme('dark');    // activar oscuro
  AgrocityKit.theme('light');   // activar claro
  AgrocityKit.theme('toggle');  // alternar
</script>
```

---

## 📐 Layout

### Contenedores

```html
<!-- Contenedor con ancho máximo responsivo -->
<div class="ak-container">...</div>

<!-- Contenedor fluido (100% siempre) -->
<div class="ak-container-fluid">...</div>
```

### Grid de 12 columnas

```html
<div class="ak-row">
  <div class="ak-col-12">Ancho completo</div>
  <div class="ak-col-6">Mitad</div>
  <div class="ak-col-6">Mitad</div>
  <div class="ak-col-4">Un tercio</div>
  <div class="ak-col-4">Un tercio</div>
  <div class="ak-col-4">Un tercio</div>
</div>
```

### Breakpoints

| Breakpoint | Prefijo   | Ancho mínimo |
|------------|-----------|-------------|
| Extra small| (ninguno) | `< 576px`   |
| Small      | `sm`      | `≥ 576px`   |
| Medium     | `md`      | `≥ 768px`   |
| Large      | `lg`      | `≥ 992px`   |
| X-Large    | `xl`      | `≥ 1200px`  |
| XX-Large   | `xxl`     | `≥ 1400px`  |

```html
<!-- Apila en móvil, 8/4 en desktop -->
<div class="ak-row">
  <div class="ak-col-12 ak-col-md-8">Contenido principal</div>
  <div class="ak-col-12 ak-col-md-4">Sidebar</div>
</div>
```

### Gutters

```html
<div class="ak-row ak-g-2">   <!-- gap small -->
<div class="ak-row ak-g-3">   <!-- gap medium -->
<div class="ak-row ak-gx-4">  <!-- gap horizontal -->
<div class="ak-row ak-gy-2">  <!-- gap vertical -->
```

### Offset

```html
<div class="ak-row">
  <div class="ak-col-6 ak-offset-3">Centrado con offset</div>
</div>
```

---

## 📝 Tipografía

### Encabezados

```html
<h1 class="ak-h1">Encabezado 1</h1>
<h2 class="ak-h2">Encabezado 2</h2>
<h3 class="ak-h3">Encabezado 3</h3>
<h4 class="ak-h4">Encabezado 4</h4>
<h5 class="ak-h5">Encabezado 5</h5>
<h6 class="ak-h6">Encabezado 6</h6>
```

### Display headings

```html
<p class="ak-display-1">Display 1</p>
<p class="ak-display-2">Display 2</p>
<p class="ak-display-3">Display 3</p>
<p class="ak-display-4">Display 4</p>
```

### Elementos de texto

```html
<p class="ak-lead">Párrafo destacado con fuente más grande.</p>

<blockquote class="ak-blockquote">
  "Cita importante."
  <footer class="ak-blockquote-footer">Autor</footer>
</blockquote>

<code>código inline</code>
<kbd>Ctrl+S</kbd>
<mark>texto resaltado</mark>
```

---

## 📋 Formularios

### Controles básicos

```html
<div class="ak-mb-3">
  <label class="ak-form-label" for="nombre">Nombre</label>
  <input type="text" id="nombre" class="ak-form-control" placeholder="Escribe aquí..." />
</div>

<div class="ak-mb-3">
  <label class="ak-form-label" for="comentario">Comentario</label>
  <textarea id="comentario" class="ak-form-control" rows="3"></textarea>
</div>
```

### Select nativo

```html
<select class="ak-form-select">
  <option>Elige una opción...</option>
  <option value="maiz">Maíz</option>
  <option value="trigo">Trigo</option>
</select>
```

### Custom Select (con búsqueda y múltiple)

> La búsqueda está habilitada por defecto. Para desactivarla: `data-ak-search="false"`

```html
<!-- Simple con búsqueda -->
<select data-ak-select data-ak-placeholder="Buscar...">
  <option value="maiz">Maíz</option>
  <option value="trigo">Trigo</option>
</select>

<!-- Múltiple con grupos -->
<select data-ak-select multiple data-ak-search="true">
  <optgroup label="Cereales">
    <option value="maiz">Maíz</option>
    <option value="trigo">Trigo</option>
  </optgroup>
</select>
```

**Inicialización por JS:**

```javascript
// Inicializar selector individual
AgrocityKit.select('#mi-select', {
  search: true,
  multiple: false,
  placeholder: 'Selecciona...',
  allowClear: true,
  maxSelectedLabels: 3,
});

// Con carga remota (AJAX)
AgrocityKit.select('#mi-select', {
  search: true,
  remoteUrl: '/api/cultivos?q={query}',
});
```

**API de la instancia:**

```javascript
const sel = AgrocityKit.select('#mi-select');

sel.getValue();              // Retorna valor(es) seleccionados
sel.setValue('valor');       // Establece valor programáticamente
sel.setOptions([             // Reemplaza opciones dinámicamente
  { value: '1', label: 'Uno', selected: true },
  { value: '2', label: 'Dos' },
]);
sel.refresh();               // Relee <option> del nativo y re-renderiza
sel.clear();                 // Limpia toda la selección
sel.open();                  // Abre el dropdown
sel.close();                 // Cierra el dropdown
sel.toggle();                // Alterna el dropdown
sel.setLoading(true);        // Estado de carga
sel.setDisabled(true);       // Deshabilitar
sel.setReadonly(true);       // Solo lectura
sel.setError('Mensaje');     // Estado error
sel.destroy();               // Elimina y restaura <select> nativo
```

**Eventos:**

```javascript
document.getElementById('mi-select').addEventListener('ak:select:change', (e) => {
  console.log('Selección:', e.detail.value);
});
document.getElementById('mi-select').addEventListener('ak:select:open', () => {});
document.getElementById('mi-select').addEventListener('ak:select:close', () => {});
```

### Checks, Radios y Switches

```html
<!-- Checkbox -->
<div class="ak-form-check">
  <input class="ak-form-check-input" type="checkbox" id="chk1" />
  <label class="ak-form-check-label" for="chk1">Opción</label>
</div>

<!-- Radio -->
<div class="ak-form-check">
  <input class="ak-form-check-input" type="radio" name="grupo" id="rad1" />
  <label class="ak-form-check-label" for="rad1">Opción A</label>
</div>

<!-- Switch -->
<div class="ak-form-check ak-form-switch">
  <input class="ak-form-check-input" type="checkbox" id="sw1" />
  <label class="ak-form-check-label" for="sw1">Activar</label>
</div>
```

### DatePicker (Selector de fecha)

Selección de fecha con 3 vistas (días, meses, años), soporte de fechas mín/máx, fechas excluidas y rango vinculado.

```html
<!-- Declarativo -->
<input type="text" id="date1" class="ak-form-control" data-ak-datepicker
       data-ak-placeholder="Selecciona fecha..." />

<!-- Con fechas mín/máx -->
<input type="text" id="date2" class="ak-form-control" data-ak-datepicker
       min="2025-01-01" max="2027-12-31" />

<!-- Con fechas excluidas -->
<input type="text" id="date3" class="ak-form-control" data-ak-datepicker
       data-ak-exclude-dates="2026-07-04,2026-12-25" />
```

**Via JS:**
```javascript
AgrocityKit.datepicker('#mi-input', {
  placeholder: 'Fecha de siembra',
  minDate: '2025-01-01',
  maxDate: '2027-12-31',
  excludeDates: ['2026-07-04', '2026-12-25'],
  daysOfWeekDisabled: [0, 6],    // deshabilitar fines de semana
  autoclose: true,                // cerrar al seleccionar
  todayBtn: true,                 // botón "Hoy"
  clearBtn: true,                 // botón "Limpiar"
  todayHighlight: true,           // resaltar fecha actual
  startView: 0,                   // 0=días, 1=meses, 2=años
});
```

**Eventos:**
```javascript
document.getElementById('mi-input').addEventListener('ak:datepicker:change', (e) => {
  console.log('Fecha seleccionada:', e.detail.value);
});
```

**Navegación por vistas:**
- Vista días: haz clic en el mes/año → vista meses.
- Vista meses: haz clic en el año → vista años; clic en un mes → vista días.
- Vista años: clic en un año → vista meses.
- Flechas ← → navegan: meses (vista días), años (vista meses), décadas (vista años).
- Teclado: flechas para moverse entre días, Enter para seleccionar.

**API:**
- `getValue()` — Retorna `YYYY-MM-DD` (o `YYYY-MM-DD HH:mm` en modo datetime) o `null`.
- `setValue('2026-07-15')` o `setValue(new Date())` — Establece una fecha (string o Date).
- `refresh()` — Re-renderiza si está abierto (útil tras cambiar `minDate`/`maxDate`).
- `show()`, `hide()`, `toggle()` — Control manual del overlay.
- `destroy()` — Elimina el DatePicker.

---

### DatePicker con hora (datetime)

El DatePicker se convierte automáticamente en selector de fecha y hora cuando el formato incluye `HH` (horas) o `mm` (minutos). Aparece un botón de reloj en el pie del calendario que alterna a la vista de selección de hora.

```html
<!-- Formato 24h -->
<input type="text" class="ak-form-control" data-ak-datepicker
       data-ak-format="DD/MM/YYYY HH:mm"
       data-ak-placeholder="DD/MM/AAAA HH:mm" />

<!-- Formato ISO -->
<input type="text" class="ak-form-control" data-ak-datepicker
       data-ak-format="YYYY-MM-DD HH:mm" />

<!-- Solo minutos, sin horas -->
<input type="text" class="ak-form-control" data-ak-datepicker
       data-ak-format="DD/MM/YYYY mm" />
```

**Via JS:**
```javascript
AgrocityKit.datepicker('#mi-input', {
  format: 'DD/MM/YYYY HH:mm',
  placeholder: 'Fecha y hora...',
  autoclose: false,     // no cerrar automáticamente para permitir ajustar hora
});
```

**Navegación:**
- En vista días, hay un botón de reloj en el footer con la hora actual.
- Haz clic en el botón para cambiar a la vista de selección de hora.
- Ajusta hora y minuto con las flechas del teclado o haciendo clic.
- La selección completa (fecha + hora) se guarda al cerrar o al hacer clic en "Hoy".

**API específica:**
- `getValue()` — Retorna `YYYY-MM-DD HH:mm` o `null`.
- `setValue('2026-07-15 14:30')` — Fecha y hora en formato string.
- `setValue(new Date())` — También acepta objetos Date.

---

### DateRange — Rango de fechas vinculado

Enlaza dos DatePickers para que se validen mutuamente: el campo "fin" no puede ser menor que "inicio", y viceversa.

```html
<div data-ak-date-range class="ak-date-range">
  <div class="ak-flex-fill">
    <label>Fecha inicio</label>
    <input type="text" class="ak-form-control" data-ak-datepicker
           data-ak-placeholder="Inicio..." />
  </div>
  <div class="ak-flex-fill">
    <label>Fecha fin</label>
    <input type="text" class="ak-form-control" data-ak-datepicker
           data-ak-placeholder="Fin..." />
  </div>
</div>
```

**Via JS:**
```javascript
AgrocityKit.dateRange('#input-inicio', '#input-fin');
```

**API:**
- `getStart()` — Retorna el DatePicker de inicio.
- `getEnd()` — Retorna el DatePicker de fin.
- `destroy()` — Elimina ambos DatePickers.

---

### TimePicker (Selector de hora)

Selección de hora con formato 12h o 24h y paso configurable de minutos.

```html
<!-- 24h (por defecto) -->
<input type="text" id="time1" class="ak-form-control" data-ak-timepicker />

<!-- 12h con AM/PM -->
<input type="text" id="time2" class="ak-form-control" data-ak-timepicker
       data-ak-ampm="true" />
```

**Via JS:**
```javascript
AgrocityKit.timepicker('#mi-input', {
  ampm: true,       // false = 24h
  minuteStep: 10,   // paso de minutos
});
```

**API:**
- `getValue()` — Retorna la hora como string (`HH:mm` o `HH:mm AM/PM`) o `null`.
- `setValue('14:30')` o `setValue(new Date())` — Establece la hora (string o Date).
- `show()`, `hide()`, `toggle()` — Control manual del overlay.
- `destroy()` — Elimina el TimePicker.

**Eventos:**
```javascript
document.getElementById('mi-input').addEventListener('ak:timepicker:change', (e) => {
  console.log('Hora seleccionada:', e.detail.value);
});
```

---

### Geo (cascada de selects México)

Agrupa selects en cascada para Estado → Municipio → Colonia + Código Postal. Todos los campos del grupo comparten el mismo `data-ak-geo-name`.

```html
<div class="ak-row">
  <div class="ak-col-4">
    <select data-ak-geo-name="direccion" data-ak-geo-state
            data-ak-select data-ak-search>
      <option value="">Seleccionar estado...</option>
    </select>
  </div>
  <div class="ak-col-4">
    <select data-ak-geo-name="direccion" data-ak-geo-municipality
            data-ak-select data-ak-search disabled>
      <option value="">Seleccionar municipio...</option>
    </select>
  </div>
  <div class="ak-col-4">
    <select data-ak-geo-name="direccion" data-ak-geo-neighborhood
            data-ak-select data-ak-search disabled>
      <option value="">Seleccionar colonia...</option>
    </select>
  </div>
</div>
```

**Carga en cascada con `data-ak-geo-value`:**

Para precargar valores (ej. al editar), agrega `data-ak-geo-value` en los campos `municipality` y `neighborhood`. Apenas se poblen las opciones, se asigna ese valor y se dispara `change` automáticamente para continuar la cascada:

```html
<select data-ak-geo-name="dir" data-ak-geo-state>
  <!-- se llena con estados -->
</select>
<select data-ak-geo-name="dir" data-ak-geo-municipality
        data-ak-geo-value="015">
  <!-- se llena y auto-selecciona municipio 015 -->
</select>
<select data-ak-geo-name="dir" data-ak-geo-neighborhood
        data-ak-geo-value="CENTRO">
  <!-- se llena y auto-selecciona colonia CENTRO -->
</select>
```

**API programática:**
```javascript
AgrocityKit.geo.fetchStates().then(function(states) { ... });
AgrocityKit.geo.fetchMunicipalities("09").then(function(items) { ... });
AgrocityKit.geo.fetchNeighborhoods("09", "002").then(function(items) { ... });
```

**Atributos data:**
- `data-ak-geo-name` — Nombre del grupo (compartido por todos los campos)
- `data-ak-geo-state` — Select de estado
- `data-ak-geo-municipality` — Select de municipio
- `data-ak-geo-neighborhood` — Select de colonia
- `data-ak-geo-postalcode` — Input de código postal (solo lectura)
- `data-ak-geo-value` — Valor a auto-asignar tras poblar opciones (solo municipality y neighborhood)

---

### Range

```html
<label class="ak-form-label" for="rng1">Humedad: <span id="val">50</span>%</label>
<input type="range" id="rng1" class="ak-form-range" min="0" max="100" value="50"
       oninput="document.getElementById('val').textContent=this.value" />
```

### Input Group

```html
<div class="ak-input-group">
  <span class="ak-input-group-text">@</span>
  <input type="text" class="ak-form-control" placeholder="Usuario" />
</div>

<div class="ak-input-group">
  <input type="text" class="ak-form-control" placeholder="Buscar..." />
  <button class="ak-btn ak-btn-primary">Buscar</button>
</div>
```

### Floating Labels (Material Design)

```html
<div class="ak-form-floating">
  <input type="text" id="fl1" class="ak-form-control" placeholder="Nombre" />
  <label for="fl1">Nombre del productor</label>
</div>
```

### Password (con toggle de visibilidad por defecto)

```html
<!-- El ojo aparece automáticamente en todo campo password -->
<input type="password" class="ak-form-control" placeholder="Contraseña" />

<!-- Para desactivar el toggle, usa el atributo -->
<input type="password" class="ak-form-control" data-ak-no-toggle placeholder="Contraseña" />
```

### File input (tipo form-control con popover de archivos y drag & drop)

- **Auto-build**: solo necesitas `<input type="file" class="ak-form-file-input">` con atributos `data-ak-*`. El framework crea automáticamente el wrapper `.ak-form-file`, el campo visual `.ak-form-file-field`, el icono, el texto, botón limpiar, popover y mensaje de error.
- **Drag & drop**: arrastra y suelta archivos sobre el campo (feedback visual con borde dashed + sombra)
- Botón **×** para limpiar toda la selección (aparece solo cuando hay archivos)
- Atributo `data-ak-file-list` agrega un botón **☰** que abre un popover con la lista de archivos seleccionados y botón eliminar individual

```html
<!-- Simple (sin lista popover) — se auto-construye -->
<input type="file" class="ak-form-file-input"
  data-ak-accept=".pdf,.jpg,.png"
  data-ak-max-files="1"
  data-ak-validate="required" required />

<!-- Con popover + validación — se auto-construye -->
<input type="file" class="ak-form-file-input" multiple
  data-ak-file-list
  data-ak-accept=".pdf,.doc,.jpg,.png,.csv"
  data-ak-max-files="3"
  data-ak-max-size="2MB"
  data-ak-validate="required" required />
```

**Atributos de validación:**

| Atributo | Descripción | Ejemplo |
|---|---|---|
| `data-ak-max-files` | Máximo número de archivos permitidos | `data-ak-max-files="3"` |
| `data-ak-max-size` | Tamaño máximo por archivo (B, KB, MB, GB) | `data-ak-max-size="2MB"` |
| `data-ak-accept` | Tipos de archivo permitidos (extensiones o MIME) | `data-ak-accept=".pdf,.jpg,.png"` |
| `data-ak-file-list` | Activa el botón **☰** y popover con lista de archivos | `data-ak-file-list` |

Los archivos que no cumplan se filtran automáticamente y se muestra un mensaje de error debajo del campo.

- `data-ak-file-list` activa el botón **☰** y el popover con nombres y botón de eliminar individual
- Auto-init via `AgrocityKit.fileInput()`
- Drag & drop: arrastra archivos sobre el campo (se resalta con borde dashed + sombra)
- El botón limpiar (`×`) elimina toda la selección
- En el popover cada archivo tiene su propio botón de eliminar que reconstruye el FileList vía `DataTransfer`
- El popover se cierra al hacer clic fuera
- Los mensajes de error se muestran en `.ak-form-file-error` (generado automáticamente)

### Validación

#### Validación estática (clases CSS)

```html
<!-- Campo válido -->
<input type="text" class="ak-form-control ak-is-valid" value="Correcto" />
<div class="ak-valid-feedback">¡Perfecto!</div>

<!-- Campo inválido -->
<input type="text" class="ak-form-control ak-is-invalid" />
<div class="ak-invalid-feedback">Este campo es requerido.</div>
```

#### Validación reactiva (declarativa)

El framework ofrece un sistema de validación reactiva sin necesidad de JavaScript manual. Solo agrega `data-ak-validation` al `<form>` y `data-ak-validate` con las reglas en cada campo.

**Atributos:**

| Atributo | Elemento | Descripción |
|---|---|---|
| `data-ak-validation` | `<form>` | Habilita la validación reactiva en el formulario |
| `data-ak-validate` | Input/Select/Textarea/File | Reglas separadas por `\|` (ej: `required\|email\|min:3\|max:100\|pattern:^[A-Z]`) |
| `data-ak-msg` | Campo validado | Mensaje de error genérico |
| `data-ak-msg-{rule}` | Campo validado | Mensaje específico por regla (ej: `data-ak-msg-required`) |

**Reglas soportadas:**

| Regla | Descripción | Ejemplo |
|---|---|---|
| `required` | Campo obligatorio (soporta checkbox, radio, file) | `required` |
| `email` | Formato de email válido | `email` |
| `url` | Formato de URL válida | `url` |
| `min:N` | Mínimo N caracteres (texto) o valor mínimo (number) | `min:3` |
| `max:N` | Máximo N caracteres (texto) o valor máximo (number) | `max:100` |
| `pattern:REGEX` | Expresión regular | `pattern:^[A-Z]\d{3}$` |

**Ejemplo completo con todos los tipos de campo:**

```html
<form data-ak-validation novalidate>
  <!-- Text inputs -->
  <div class="ak-form-field-content">
    <label class="ak-form-label">Nombre</label>
    <input type="text" class="ak-form-control"
           data-ak-validate="required" data-ak-msg="Campo requerido" required />
  </div>

  <div class="ak-form-field-content">
    <label class="ak-form-label">Email</label>
    <input type="email" class="ak-form-control"
           data-ak-validate="required|email"
           data-ak-msg="Campo requerido"
           data-ak-msg-email="Email inválido" required />
  </div>

  <div class="ak-form-field-content">
    <label class="ak-form-label">Edad</label>
    <input type="number" class="ak-form-control"
           data-ak-validate="required|min:18|max:120"
           data-ak-msg-min="Edad mínima 18 años" required />
  </div>

  <!-- Select nativo -->
  <div class="ak-form-field-content">
    <label class="ak-form-label">Tipo</label>
    <select class="ak-form-select" data-ak-validate="required" data-ak-msg="Seleccione" required>
      <option value="">Seleccione...</option>
      <option value="A">Opción A</option>
      <option value="B">Opción B</option>
    </select>
  </div>

  <!-- Custom Select -->
  <div class="ak-form-field-content">
    <label class="ak-form-label">Cultivo</label>
    <select class="ak-form-select" data-ak-select
            data-ak-placeholder="Buscar cultivo..."
            data-ak-validate="required" required>
      <option value="">Seleccione...</option>
      <option value="maiz">Maíz</option>
      <option value="trigo">Trigo</option>
    </select>
  </div>

  <!-- DatePicker -->
  <div class="ak-form-field-content">
    <label class="ak-form-label">Fecha</label>
    <input type="text" class="ak-form-control" data-ak-datepicker
           data-ak-format="DD/MM/YYYY" data-ak-placeholder="DD/MM/AAAA"
           data-ak-validate="required" required />
  </div>

  <!-- TimePicker -->
  <div class="ak-form-field-content">
    <label class="ak-form-label">Hora</label>
    <input type="text" class="ak-form-control" data-ak-timepicker
           data-ak-placeholder="HH:MM"
           data-ak-validate="required" required />
  </div>

  <!-- Custom file (auto-build) -->
  <div class="ak-form-field-content">
    <label class="ak-form-label">Archivo</label>
    <input type="file" class="ak-form-file-input"
           data-ak-accept=".pdf,.jpg" data-ak-max-files="1"
           data-ak-validate="required" required />
  </div>

  <!-- Input group -->
  <div class="ak-form-field-content">
    <label class="ak-form-label">Usuario</label>
    <div class="ak-input-group">
      <span class="ak-input-group-text">@</span>
      <input type="text" class="ak-form-control"
             data-ak-validate="required" required />
    </div>
  </div>

  <!-- Checkbox -->
  <div class="ak-form-field-content">
    <label class="ak-form-label">Términos</label>
    <label class="ak-form-check">
      <input type="checkbox" class="ak-form-check-input"
             data-ak-validate="required" data-ak-msg="Debe aceptar" required />
      <span class="ak-form-check-label">Acepto los términos</span>
    </label>
  </div>

  <!-- Radio group -->
  <div class="ak-form-field-content">
    <label class="ak-form-label">Género</label>
    <label class="ak-form-check">
      <input type="radio" class="ak-form-check-input" name="genero"
             data-ak-validate="required" required />
      <span class="ak-form-check-label">Masculino</span>
    </label>
    <label class="ak-form-check">
      <input type="radio" class="ak-form-check-input" name="genero"
             data-ak-validate="required" required />
      <span class="ak-form-check-label">Femenino</span>
    </label>
  </div>

  <button type="submit" class="ak-btn ak-btn-primary">Guardar</button>
</form>
```

**Comportamiento:**
- Los feedbacks `.ak-valid-feedback` y `.ak-invalid-feedback` se crean automáticamente si no existen en el DOM
- Las etiquetas `.ak-form-label` cambian a rojo cuando el campo es inválido
- El formulario se valida en blur/input/change después del primer submit (o al tocar el campo)
- Checkbox/radio validan solo en `change` (no blur ni input)
- Al seleccionar un radio se limpia el error de todos los radios del mismo grupo automáticamente
- El submit se intercepta automáticamente; si hay errores enfoca el primer campo inválido
- Los Custom Select (`data-ak-select`), DatePicker (`data-ak-datepicker`), TimePicker (`data-ak-timepicker`) y File Input (`ak-form-file-input`) se detectan automáticamente
- Input group: `ak-is-invalid` se aplica al `.ak-input-group`, coloreando input y texto del grupo

**Auto-star:**
Si el `<label class="ak-form-label">` dentro de `.ak-form-field-content` tiene el campo `required` pero **no tiene** `<span class="ak-asterisk-field">*</span>`, el framework lo agrega automáticamente al inicializar el formulario. No se duplica si ya existe. El asterisco se muestra en color rojo (`var(--ak-danger)`) con `margin-left: 2px`.

```html
<!-- El * se agrega automáticamente -->
<div class="ak-form-field-content">
  <label class="ak-form-label">Nombre</label>
  <!-- Se convierte en: Nombre<span class="ak-asterisk-field">*</span> -->
  <input type="text" required />
</div>
```

**Campos soportados para validación:**

| Tipo de campo | Clase contenedora | Eventos de validación |
|---|---|---|
| Text / Email / Number / Tel / URL / Password | `.ak-form-control` | blur, input, change |
| Textarea | `.ak-form-control` | blur, input, change |
| Select nativo | `.ak-form-select` | blur, input, change |
| Custom Select | `.ak-select` | blur, input, change |
| DatePicker | `.ak-datepicker` | blur, input, change |
| TimePicker | `.ak-timepicker` | blur, input, change |
| File nativo | `.ak-form-control` | change |
| Custom File | `.ak-form-file` | change |
| Input group | `.ak-input-group` | blur, input, change |
| Password toggle | `.ak-password-wrap` | blur, input, change |
| Checkbox | `.ak-form-check` | change |
| Radio | `.ak-form-check` | change |

**API JavaScript:**

```js
// Inicialización manual (auto-init con data-ak-validation)
AgrocityKit.formValidation('init', '#miForm', {
  onSuccess(form) {
    AgrocityKit.showToast('Guardado', { type: 'success' });
    // form.submit(); // submit real si se desea
  },
  onError(form, errors) {
    AgrocityKit.showToast('Corrige los errores', { type: 'danger' });
  }
});

// Re-validar un campo específico
AgrocityKit.formValidation('field', elementoInput);
```

**Evento:**

```js
document.addEventListener('ak:form:valid', (e) => {
  const form = e.detail.form;
  // Enviar datos con google.script.run, fetch, etc.
});
```

---


## 🔘 Botones

```html
<!-- Variantes -->
<button class="ak-btn ak-btn-primary">Primary</button>
<button class="ak-btn ak-btn-secondary">Secondary</button>
<button class="ak-btn ak-btn-success">Success</button>
<button class="ak-btn ak-btn-danger">Danger</button>
<button class="ak-btn ak-btn-warning">Warning</button>
<button class="ak-btn ak-btn-info">Info</button>
<button class="ak-btn ak-btn-light">Light</button>
<button class="ak-btn ak-btn-link">Link</button>

<!-- Outline -->
<button class="ak-btn ak-btn-outline-primary">Outline Primary</button>
<button class="ak-btn ak-btn-outline-danger">Outline Danger</button>

<!-- Tamaños -->
<button class="ak-btn ak-btn-primary ak-btn-lg">Grande</button>
<button class="ak-btn ak-btn-primary">Normal</button>
<button class="ak-btn ak-btn-primary ak-btn-sm">Pequeño</button>

<!-- Bloque -->
<button class="ak-btn ak-btn-primary ak-btn-block">Bloque completo</button>

<!-- Estados -->
<button class="ak-btn ak-btn-primary" disabled>Deshabilitado</button>
<button class="ak-btn ak-btn-primary ak-active">Activo</button>
```

### Grupos de botones

```html
<div class="ak-btn-group">
  <button class="ak-btn ak-btn-secondary">Izquierda</button>
  <button class="ak-btn ak-btn-secondary">Centro</button>
  <button class="ak-btn ak-btn-secondary">Derecha</button>
</div>
```

---

## 🏷️ Badges

```html
<span class="ak-badge ak-bg-primary">Primary</span>
<span class="ak-badge ak-bg-success">Success</span>
<span class="ak-badge ak-bg-danger">Danger</span>
<span class="ak-badge ak-bg-warning ak-text-dark">Warning</span>

<!-- Pill (redondeado) -->
<span class="ak-badge ak-badge-pill ak-bg-primary">Nuevo</span>
<span class="ak-badge ak-badge-pill ak-bg-danger">99+</span>
```

---

## ⚠️ Alertas

```html
<div class="ak-alert ak-alert-primary" role="alert">Alerta primary</div>
<div class="ak-alert ak-alert-success" role="alert">Éxito</div>
<div class="ak-alert ak-alert-warning" role="alert">Advertencia</div>
<div class="ak-alert ak-alert-danger"  role="alert">Error</div>

<!-- Descartable -->
<div class="ak-alert ak-alert-info ak-alert-dismissible ak-fade" role="alert" id="mi-alerta">
  Mensaje descartable.
  <button class="ak-btn-close" data-ak-dismiss="alert" aria-label="Cerrar"></button>
</div>
```

**Via JS:**
```javascript
AgrocityKit.alert('#mi-alerta').close();
```

---

## 🃏 Cards

```html
<!-- Card estándar -->
<div class="ak-card">
  <img src="imagen.jpg" class="ak-card-img-top" alt="..." />
  <div class="ak-card-header">Título del header</div>
  <div class="ak-card-body">
    <h5 class="ak-card-title">Nombre de la card</h5>
    <p class="ak-card-subtitle ak-text-muted">Subtítulo</p>
    <p class="ak-card-text">Contenido de la card.</p>
    <a href="#" class="ak-btn ak-btn-primary">Acción</a>
    <a href="#" class="ak-card-link">Enlace</a>
  </div>
  <div class="ak-card-footer ak-text-muted">Pie de la card</div>
</div>

<!-- Card con imagen <img> + overlay + badge (estilo galería) -->
<div class="ak-card ak-card-cover" style="min-height:300px;">
  <img class="ak-card-img-cover" src="foto.jpg" alt="Vista del departamento" loading="lazy" />
  <div class="ak-card-body">
    <span class="ak-badge ak-badge-success ak-card-badge">Disponible</span>
    <h5 class="ak-card-title">Departamento</h5>
    <p class="ak-card-text">Descripción del mapa.</p>
    <a href="#" class="ak-btn ak-btn-sm ak-btn-light">Ver aquí</a>
  </div>
</div>

<!-- Card con hover pronunciado -->
<div class="ak-card ak-card-hover" style="cursor:pointer;">
  <div class="ak-card-body">
    <h5 class="ak-card-title">Cultivos</h5>
    <p class="ak-card-text">Texto de la card.</p>
  </div>
</div>
```

**Clases adicionales:**

| Clase | Descripción |
|-------|-------------|
| `.ak-card-cover` | Card con `<img class="ak-card-img-cover">` como fondo + overlay degradado. Texto blanco sobre la imagen |
| `.ak-card-img-cover` | Imagen que se posiciona absolute como fondo de la card cover (usar `object-fit: cover`) |
| `.ak-card-badge` | Badge en esquina superior derecha. Usar con `.ak-badge` dentro de `.ak-card-cover` |
| `.ak-card-hover` | Hover pronunciado: `translateY(-4px)` + `shadow-lg` |

---

## 📊 Tablas

```html
<!-- Tabla básica -->
<table class="ak-table">
  <thead><tr><th>Columna 1</th><th>Columna 2</th></tr></thead>
  <tbody><tr><td>Dato</td><td>Dato</td></tr></tbody>
</table>

<!-- Modificadores -->
<table class="ak-table ak-table-striped ak-table-hover ak-table-bordered">

<!-- Compacta -->
<table class="ak-table ak-table-compact">

<!-- Responsiva (scroll horizontal en móvil) -->
<div class="ak-table-responsive">
  <table class="ak-table">...</table>
</div>
```

### Data Table (interactiva)

```html
<table data-ak-datatable class="ak-table ak-table-striped ak-table-hover">
  <thead>
    <tr>
      <th>Cultivo</th>
      <th data-type="number">Área (ha)</th>
      <th data-sortable="false">Acciones</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Maíz</td><td>12.5</td><td>...</td></tr>
  </tbody>
</table>
```

**Opciones JS:**
```javascript
AgrocityKit.dataTable('#mi-tabla', {
  pageSize: 10,
  searchable: true,
  sortable: true,
});
```

---

## 🧭 Navbar

```html
<nav class="ak-navbar">
  <a href="#" class="ak-navbar-brand">Mi App</a>

  <!-- Toggler para móvil -->
  <button class="ak-navbar-toggler"
          data-ak-toggle="collapse"
          data-ak-target="#navbarMenu">☰</button>

  <div class="ak-navbar-collapse" id="navbarMenu">
    <ul class="ak-navbar-nav">
      <li><a href="#" class="ak-nav-link ak-active">Inicio</a></li>
      <li><a href="#" class="ak-nav-link">Cultivos</a></li>
      <li><a href="#" class="ak-nav-link">Reportes</a></li>
    </ul>
  </div>
</nav>
```

---

## 🗂️ Navs & Tabs

```html
<!-- Nav básico -->
<ul class="ak-nav">
  <li class="ak-nav-item"><a class="ak-nav-link ak-active" href="#">Activo</a></li>
  <li class="ak-nav-item"><a class="ak-nav-link" href="#">Enlace</a></li>
</ul>

<!-- Tabs con contenido -->
<ul class="ak-nav ak-nav-tabs" role="tablist">
  <li class="ak-nav-item" role="presentation">
    <button class="ak-nav-link ak-active"
            data-ak-toggle="tab"
            data-ak-target="#pane1" role="tab">Tab 1</button>
  </li>
  <li class="ak-nav-item" role="presentation">
    <button class="ak-nav-link"
            data-ak-toggle="tab"
            data-ak-target="#pane2" role="tab">Tab 2</button>
  </li>
</ul>
<div class="ak-tab-content">
  <div class="ak-tab-pane ak-active" id="pane1">Contenido Tab 1</div>
  <div class="ak-tab-pane" id="pane2">Contenido Tab 2</div>
</div>

<!-- Pills -->
<ul class="ak-nav ak-nav-pills">
  <li class="ak-nav-item"><a class="ak-nav-link ak-active" href="#">Pill 1</a></li>
  <li class="ak-nav-item"><a class="ak-nav-link" href="#">Pill 2</a></li>
</ul>
```

**Via JS:**
```javascript
AgrocityKit.tab('#pane1').show();
```

---

## 🍞 Breadcrumb

```html
<nav aria-label="breadcrumb">
  <ol class="ak-breadcrumb">
    <li class="ak-breadcrumb-item"><a href="#">Inicio</a></li>
    <li class="ak-breadcrumb-item"><a href="#">Cultivos</a></li>
    <li class="ak-breadcrumb-item ak-active" aria-current="page">Maíz</li>
  </ol>
</nav>
```

---

## 📄 Paginación

```html
<nav aria-label="Paginación">
  <ul class="ak-pagination">
    <li class="ak-page-item ak-disabled"><a class="ak-page-link" href="#">«</a></li>
    <li class="ak-page-item ak-active"><a class="ak-page-link" href="#">1</a></li>
    <li class="ak-page-item"><a class="ak-page-link" href="#">2</a></li>
    <li class="ak-page-item"><a class="ak-page-link" href="#">3</a></li>
    <li class="ak-page-item"><a class="ak-page-link" href="#">»</a></li>
  </ul>
</nav>

<!-- Tamaño pequeño -->
<ul class="ak-pagination ak-pagination-sm">...</ul>
```

---

## 📋 List Group

```html
<ul class="ak-list-group">
  <li class="ak-list-group-item">Ítem 1</li>
  <li class="ak-list-group-item ak-active">Ítem activo</li>
  <li class="ak-list-group-item">Ítem 3</li>
  <li class="ak-list-group-item ak-disabled">Deshabilitado</li>
</ul>

<!-- Con enlaces -->
<div class="ak-list-group">
  <a href="#" class="ak-list-group-item">Enlace 1</a>
  <a href="#" class="ak-list-group-item ak-active">Activo</a>
</div>
```

---

## 🪗 Accordion

Diseño estilo Material: sombra elevada, borde izquierdo verde en panel activo, flecha chevron animada, cuerpo en `--ak-text-muted`.

- **Comportamiento por defecto:** solo un panel abierto a la vez (cierra hermanos automáticamente)
- **`data-ak-multiple`** en el `.ak-accordion` permite tener varios paneles abiertos simultáneamente

```html
<div class="ak-accordion" id="miAccordion">
  <div class="ak-accordion-item">
    <h2 class="ak-accordion-header">
      <button class="ak-accordion-button"
              data-ak-toggle="accordion"
              data-ak-target="#item1">
        Pregunta 1
      </button>
    </h2>
    <div id="item1" class="ak-accordion-body">
      Respuesta del primer panel.
    </div>
  </div>
  <div class="ak-accordion-item">
    <h2 class="ak-accordion-header">
      <button class="ak-accordion-button ak-collapsed"
              data-ak-toggle="accordion"
              data-ak-target="#item2">
        Pregunta 2
      </button>
    </h2>
    <div id="item2" class="ak-accordion-body ak-collapse">
      Respuesta cerrada por defecto.
    </div>
  </div>
</div>
```

- El botón activo muestra una barra lateral verde (3px) y texto en `--ak-primary`
- La flecha chevron rota 90° al abrir/cerrar
- Sombra `--ak-shadow` en el contenedor
- Cuerpo con color `--ak-text-muted` y line-height 1.6

---

## 🔽 Collapse

```html
<button class="ak-btn ak-btn-primary"
        data-ak-toggle="collapse"
        data-ak-target="#contenido">
  Mostrar / Ocultar
</button>

<div id="contenido" class="ak-collapse">
  <div class="ak-card ak-card-body">
    Contenido que se muestra y oculta.
  </div>
</div>
```

**Via JS:**
```javascript
AgrocityKit.collapse('#contenido').show();
AgrocityKit.collapse('#contenido').hide();
AgrocityKit.collapse('#contenido').toggle();
```

---

## ▾ Dropdown

```html
<div class="ak-dropdown">
  <button class="ak-btn ak-btn-primary" data-ak-toggle="dropdown">
    Opciones ▾
  </button>
  <ul class="ak-dropdown-menu">
    <li><span class="ak-dropdown-header">Sección</span></li>
    <li><a class="ak-dropdown-item" href="#">Acción 1</a></li>
    <li><a class="ak-dropdown-item" href="#">Acción 2</a></li>
    <li><hr class="ak-dropdown-divider" /></li>
    <li><a class="ak-dropdown-item" href="#">Eliminar</a></li>
  </ul>
</div>

<!-- Alineado a la derecha -->
<ul class="ak-dropdown-menu ak-dropdown-menu-end">...</ul>
```

**Via JS:**
```javascript
AgrocityKit.dropdown('#mi-dropdown').show();
AgrocityKit.dropdown('#mi-dropdown').hide();
AgrocityKit.dropdown('#mi-dropdown').toggle();
```

---

## 🪟 Modal

```html
<!-- Trigger -->
<button class="ak-btn ak-btn-primary"
        data-ak-toggle="modal"
        data-ak-target="#miModal">
  Abrir modal
</button>

<!-- Modal -->
<div class="ak-modal" id="miModal" tabindex="-1" aria-hidden="true">
  <div class="ak-modal-dialog ak-modal-dialog-centered">
    <div class="ak-modal-content">

      <div class="ak-modal-header">
        <h5 class="ak-modal-title">Título del modal</h5>
        <button class="ak-btn-close" data-ak-dismiss="modal" aria-label="Cerrar"></button>
      </div>

      <div class="ak-modal-body">
        Contenido del modal.
      </div>

      <div class="ak-modal-footer">
        <button class="ak-btn ak-btn-secondary" data-ak-dismiss="modal">Cancelar</button>
        <button class="ak-btn ak-btn-primary">Guardar</button>
      </div>

    </div>
  </div>
</div>
```

**Modificadores:**
```html
<div class="ak-modal-dialog ak-modal-dialog-lg">               <!-- grande 800px -->
<div class="ak-modal-dialog ak-modal-dialog-sm">               <!-- pequeño 340px -->
<div class="ak-modal-dialog ak-modal-dialog-centered">          <!-- centrado vertical -->
<div class="ak-modal-dialog ak-modal-dialog-scrollable">        <!-- scroll interno en body, header/footer fijos -->
```

**Via JS:**
```javascript
AgrocityKit.modal('#miModal').show();
AgrocityKit.modal('#miModal').hide();

// Escuchar eventos
document.getElementById('miModal').addEventListener('ak:modal:show', () => console.log('abierto'));
document.getElementById('miModal').addEventListener('ak:modal:hide', () => console.log('cerrado'));
```

---

## 📌 Offcanvas

```html
<!-- Trigger -->
<button class="ak-btn ak-btn-primary"
        data-ak-toggle="offcanvas"
        data-ak-target="#miPanel">
  Abrir panel
</button>

<!-- Panel -->
<div class="ak-offcanvas ak-offcanvas-start" id="miPanel" tabindex="-1" aria-hidden="true">
  <div class="ak-offcanvas-header">
    <h5 class="ak-offcanvas-title">Menú</h5>
    <button class="ak-btn-close" data-ak-dismiss="offcanvas" aria-label="Cerrar"></button>
  </div>
  <div class="ak-offcanvas-body">
    Contenido del panel lateral.
  </div>
</div>
```

**Posiciones:** `ak-offcanvas-start` | `ak-offcanvas-end` | `ak-offcanvas-top` | `ak-offcanvas-bottom`

---

## 🗄️ Drawer (navegación lateral)

Drawer de navegación con header + body + footer, items con icono, submenús colapsables y divider. Ideal como sidebar de aplicación.

```html
<!-- Trigger -->
<button class="ak-btn ak-btn-primary"
        data-ak-toggle="drawer"
        data-ak-target="#miDrawer">
  Abrir drawer
</button>

<!-- Drawer -->
<div class="ak-drawer" id="miDrawer">
  <div class="ak-drawer-backdrop"></div>
  <div class="ak-drawer-content">
    <div class="ak-drawer-header">
      <div class="ak-drawer-header-avatar">AK</div>
      <div>
        <div class="ak-drawer-header-title">App</div>
        <div class="ak-drawer-header-subtitle">usuario@email.com</div>
      </div>
    </div>
    <div class="ak-drawer-body">
      <div class="ak-drawer-subheader">General</div>
      <button class="ak-drawer-item ak-active">
        <span class="ak-drawer-item-icon">📊</span>
        <span>Dashboard</span>
      </button>
      <button class="ak-drawer-item" data-ak-toggle="drawer-sub" data-ak-target="#subDemo">
        <span class="ak-drawer-item-icon">🌾</span>
        <span>Cultivos</span>
        <svg class="bd-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:auto;"><path d="M9 18l6-6-6-6"/></svg>
      </button>
      <div id="subDemo" class="ak-drawer-sub">
        <a class="ak-drawer-sub-item">Maíz</a>
        <a class="ak-drawer-sub-item">Trigo</a>
      </div>
    </div>
    <div class="ak-drawer-footer">
      <button class="ak-drawer-item">🚪 Cerrar sesión</button>
      <div class="ak-drawer-copyright">© 2026 Agrocity</div>
    </div>
  </div>
</div>
```

**Clases disponibles:**

| Clase | Descripción |
|-------|-------------|
| `.ak-drawer` | Contenedor principal (overlay fijo) |
| `.ak-drawer-backdrop` | Fondo oscuro semitransparente |
| `.ak-drawer-content` | Panel lateral (320px, slide desde izquierda) |
| `.ak-drawer-header` | Header fijo con avatar + datos de usuario |
| `.ak-drawer-header-avatar` | Círculo con iniciales o imagen |
| `.ak-drawer-header-title` | Nombre en el header |
| `.ak-drawer-header-subtitle` | Subtítulo (email/rol) |
| `.ak-drawer-body` | Área scrollable con items |
| `.ak-drawer-footer` | Footer fijo (logout, settings link) |
| `.ak-drawer-copyright` | Texto de copyright en el footer (11px, muted, centrado) |
| `.ak-drawer-subheader` | Etiqueta de sección (mayúscula) |
| `.ak-drawer-divider` | Separador horizontal |
| `.ak-drawer-item` | Elemento de navegación (icono + texto) |
| `.ak-drawer-item-icon` | Icono del item |
| `.ak-drawer-item-text` | Texto del item (opcional, puede usarse `<span>` sin clase) |
| `.ak-drawer-sub` | Submenú colapsable |
| `.ak-drawer-sub-item` | Item de submenú |

**Atributos data:**

| Atributo | Descripción |
|----------|-------------|
| `data-ak-toggle="drawer"` | Abre/cierra el drawer |
| `data-ak-dismiss="drawer"` | Cierra el drawer |
| `data-ak-toggle="drawer-sub"` | Toggle de submenú colapsable |
| `data-ak-target="#id"` | Selector del drawer o submenú objetivo |

**Combinación Navbar + Drawer responsive:**

Usa las clases `.ak-app`, `.ak-app-body`, `.ak-app-main` para crear un layout completo con navbar fija y drawer como sidebar en desktop / overlay en móvil:

```html
<body class="ak-body ak-app">
  <nav class="ak-navbar">
    <a href="#" class="ak-navbar-brand">🌱 App</a>
    <button class="ak-navbar-toggler" data-ak-toggle="drawer" data-ak-target="#appDrawer">☰</button>
  </nav>
  <div class="ak-app-body">
    <div class="ak-drawer" id="appDrawer">...</div>
    <main class="ak-app-main">
      <!-- Contenido -->
    </main>
  </div>
</body>
```

Ver ejemplo completo en `examples/navbar-drawer.html`.

---

## 📊 Progress

```html
<!-- Barra básica -->
<div class="ak-progress">
  <div class="ak-progress-bar" style="width: 65%;">65%</div>
</div>

<!-- Con color -->
<div class="ak-progress">
  <div class="ak-progress-bar ak-bg-success" style="width: 80%;"></div>
</div>

<!-- Rayada y animada -->
<div class="ak-progress">
  <div class="ak-progress-bar ak-progress-bar-striped ak-progress-bar-animated" style="width: 75%;"></div>
</div>
```

---

## ⏳ Spinners

```html
<!-- Borde giratorio -->
<div class="ak-spinner-border" role="status">
  <span class="ak-visually-hidden">Cargando...</span>
</div>

<!-- Tamaño pequeño -->
<div class="ak-spinner-border ak-spinner-border-sm" role="status"></div>

<!-- Crecimiento (grow) -->
<div class="ak-spinner-grow" role="status">
  <span class="ak-visually-hidden">Cargando...</span>
</div>

<!-- Botón con spinner -->
<button class="ak-btn ak-btn-primary" disabled>
  <span class="ak-spinner-border ak-spinner-border-sm" role="status"></span>
  Cargando...
</button>
```

---

## 🔔 Toasts

Diseño Flowbite-inspirado: borde lateral de 4px del color del tipo, icono SVG dentro de círculo coloreado, diseño en fila única sin header.

```html
<!-- Estructura generada via JS -->
<div class="ak-toast-container ak-top-right">
  <div class="ak-toast ak-toast-success ak-show" role="status">
    <div class="ak-toast-icon-wrap">
      <svg class="ak-toast-icon">…</svg>
    </div>
    <div class="ak-toast-body">
      <strong class="ak-toast-title">Título</strong>
      Mensaje del toast.
    </div>
    <button class="ak-btn-close" data-ak-dismiss="toast"></button>
  </div>
</div>
```

**Via JS (recomendado):**
```javascript
// Toast simple (solo mensaje)
AgrocityKit.showToast('¡Guardado correctamente!');

// Con opciones
AgrocityKit.showToast('Error al conectar.', {
  type: 'danger',       // 'success' | 'danger' | 'warning' | 'info' | 'primary'
  position: 'top-right', // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  duration: 4000,       // ms (0 = no auto-cierra, alias: delay)
  title: 'Error',
});
```

**Iconos por tipo:**

| Tipo | Icono |
|------|-------|
| `primary` | Círculo informativo |
| `success` | Check dentro de círculo |
| `danger` | X dentro de círculo |
| `warning` | Triángulo de advertencia |
| `info` | Signo de interrogación |

**Borde lateral:** el color del borde izquierdo (4px) cambia según el tipo.

**Posiciones disponibles:**

| Clase                        | Posición           |
|------------------------------|--------------------|
| `ak-top-right`               | Arriba derecha     |
| `ak-top-left`                | Arriba izquierda   |
| `ak-bottom-right`            | Abajo derecha      |
| `ak-bottom-left`             | Abajo izquierda    |

---

## 💀 Placeholders (Skeleton)

```html
<div class="ak-card" style="max-width: 350px;">
  <div class="ak-card-body ak-placeholder-glow">
    <h5 class="ak-card-title">
      <span class="ak-placeholder ak-col-6"></span>
    </h5>
    <p>
      <span class="ak-placeholder ak-col-7"></span>
      <span class="ak-placeholder ak-col-4"></span>
      <span class="ak-placeholder ak-col-6"></span>
    </p>
    <a href="#" class="ak-btn ak-btn-primary ak-disabled ak-placeholder ak-col-6"></a>
  </div>
</div>
```

---

## 💬 Tooltips

```html
<!-- Declarativo (data-ak-tooltip) -->
<button data-ak-tooltip data-ak-title="Texto del tooltip">Hover sobre mí</button>

<!-- Con posición -->
<button data-ak-tooltip data-ak-title="Tooltip abajo" data-ak-placement="bottom">Abajo</button>
<button data-ak-tooltip data-ak-title="Tooltip izquierda" data-ak-placement="left">Izquierda</button>
<button data-ak-tooltip data-ak-title="Tooltip derecha" data-ak-placement="right">Derecha</button>
```

**Via JS:**
```javascript
AgrocityKit.tooltip('#mi-btn', {
  title: 'Texto del tooltip',
  placement: 'top', // 'top' | 'bottom' | 'left' | 'right'
});
```

---

## 🗯️ Popovers

> Los popovers incluyen flecha decorativa y se reposicionan automáticamente si no hay espacio en la dirección indicada.

```html
<!-- Clic para mostrar -->
<button data-ak-popover
        data-ak-title="Información"
        data-ak-content="Contenido detallado del popover."
        data-ak-placement="top">
  Clic para popover
</button>

<!-- Hover para mostrar -->
<button data-ak-popover
        data-ak-title="Ayuda"
        data-ak-content="<strong>HTML</strong> permitido en content."
        data-ak-trigger="hover">
  Hover para popover
</button>
```

**Via JS:**
```javascript
AgrocityKit.popover('#mi-elemento', {
  title: 'Título',
  content: 'Contenido HTML o texto',
  placement: 'bottom', // 'top' | 'bottom' | 'left' | 'right'
  trigger: 'click',    // 'click' | 'hover'
});
```

---

## 🎠 Carousel

```html
<div class="ak-carousel" id="miCarousel" data-ak-carousel data-ak-interval="5000">

  <!-- Indicadores -->
  <div class="ak-carousel-indicators">
    <button type="button" class="ak-active" aria-label="Slide 1"></button>
    <button type="button" aria-label="Slide 2"></button>
    <button type="button" aria-label="Slide 3"></button>
  </div>

  <!-- Items -->
  <div class="ak-carousel-inner">
    <div class="ak-carousel-item ak-active">
      <img src="imagen1.jpg" alt="Slide 1" />
      <div class="ak-carousel-caption">
        <h5>Título</h5>
        <p>Descripción del slide.</p>
      </div>
    </div>
    <div class="ak-carousel-item">
      <img src="imagen2.jpg" alt="Slide 2" />
    </div>
  </div>

  <!-- Controles -->
  <button class="ak-carousel-control-prev" type="button">
    <span class="ak-carousel-control-icon">‹</span>
    <span class="ak-visually-hidden">Anterior</span>
  </button>
  <button class="ak-carousel-control-next" type="button">
    <span class="ak-carousel-control-icon">›</span>
    <span class="ak-visually-hidden">Siguiente</span>
  </button>
</div>
```

**Via JS:**
```javascript
const carousel = AgrocityKit.carousel('#miCarousel', { interval: 3000 });
carousel.next();
carousel.prev();
carousel.to(2); // ir al slide 2 (0-indexed)
```

---

## 🔍 ScrollSpy

```html
<!-- Nav que se actualiza según el scroll -->
<nav id="miNav">
  <ul class="ak-nav ak-nav-pills" style="flex-direction: column;">
    <li><a class="ak-nav-link" href="#seccion1">Sección 1</a></li>
    <li><a class="ak-nav-link" href="#seccion2">Sección 2</a></li>
    <li><a class="ak-nav-link" href="#seccion3">Sección 3</a></li>
  </ul>
</nav>

<!-- Contenedor con scroll -->
<div data-ak-scrollspy data-ak-target="#miNav" style="height: 300px; overflow-y: auto;">
  <h4 id="seccion1">Sección 1</h4>
  <p>Contenido...</p>
  <h4 id="seccion2">Sección 2</h4>
  <p>Contenido...</p>
  <h4 id="seccion3">Sección 3</h4>
  <p>Contenido...</p>
</div>
```

**Via JS:**
```javascript
AgrocityKit.scrollspy('#miContenedor', { target: '#miNav', offset: 10 });
```

---

## 🖼️ Figuras e imágenes

```html
<!-- Imagen fluida -->
<img src="foto.jpg" class="ak-img-fluid" alt="..." />

<!-- Thumbnail con borde -->
<img src="foto.jpg" class="ak-img-thumbnail" alt="..." />

<!-- Figure con pie de foto -->
<figure class="ak-figure">
  <img src="foto.jpg" class="ak-figure-img ak-img-fluid ak-rounded" alt="..." />
  <figcaption class="ak-figure-caption">Descripción de la imagen.</figcaption>
</figure>
```

---

## 🛠️ Utilidades CSS

### Espaciado (margin / padding)

Las utilidades siguen el patrón `ak-{propiedad}{lado}-{nivel}`:

- **Propiedades:** `m` (margin), `p` (padding)
- **Lados:** vacío (todos), `t` (top), `b` (bottom), `s` (start/left), `e` (end/right), `x` (horizontal), `y` (vertical)
- **Niveles:** `0` a `5` (0px · 4px · 8px · 16px · 24px · 32px)

```html
<div class="ak-mt-3 ak-mb-2 ak-px-4">...</div>
<div class="ak-m-auto">centrado</div>
```

### Sizing

```html
<div class="ak-w-25">25%</div>
<div class="ak-w-50">50%</div>
<div class="ak-w-75">75%</div>
<div class="ak-w-100">100%</div>
<div class="ak-w-auto">auto</div>
<div class="ak-h-100">height 100%</div>
```

### Colores

```html
<!-- Texto -->
<p class="ak-text-primary">primary</p>
<p class="ak-text-success">success</p>
<p class="ak-text-danger">danger</p>
<p class="ak-text-warning">warning</p>
<p class="ak-text-muted">muted</p>
<p class="ak-text-white">white</p>

<!-- Fondos -->
<div class="ak-bg-primary">primary</div>
<div class="ak-bg-success">success</div>
<div class="ak-bg-danger">danger</div>
<div class="ak-bg-light">light</div>
<div class="ak-bg-dark">dark</div>
```

### Display

```html
<div class="ak-d-none">oculto</div>
<div class="ak-d-block">bloque</div>
<div class="ak-d-inline">inline</div>
<div class="ak-d-inline-block">inline-block</div>
<div class="ak-d-flex">flex</div>
<div class="ak-d-grid">grid</div>

<!-- Responsivos -->
<div class="ak-d-none ak-d-md-block">visible solo ≥ md</div>
<div class="ak-d-block ak-d-md-none">visible solo < md</div>
```

### Flexbox

```html
<div class="ak-d-flex ak-justify-content-center ak-align-items-center ak-gap-3">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Justify content: start | end | center | between | around | evenly -->
<!-- Align items:     start | end | center | baseline | stretch -->
<!-- Flex direction:  row | row-reverse | column | column-reverse -->
<!-- Flex wrap:       wrap | nowrap | wrap-reverse -->
```

### Borders

```html
<div class="ak-border">borde completo</div>
<div class="ak-border-top">solo arriba</div>
<div class="ak-border-0">sin borde</div>
<div class="ak-border ak-border-primary">borde primary</div>
<div class="ak-border ak-border-danger">borde danger</div>

<!-- Border radius -->
<div class="ak-rounded">radius normal</div>
<div class="ak-rounded-sm">radius pequeño</div>
<div class="ak-rounded-lg">radius grande</div>
<div class="ak-rounded-circle">círculo</div>
<div class="ak-rounded-pill">pill</div>
<div class="ak-rounded-0">sin radius</div>
```

### Sombras

```html
<div class="ak-shadow-sm">sombra pequeña</div>
<div class="ak-shadow">sombra normal</div>
<div class="ak-shadow-lg">sombra grande</div>
<div class="ak-shadow-none">sin sombra</div>
```

### Tipografía

```html
<p class="ak-fw-bold">negrita</p>
<p class="ak-fw-normal">normal</p>
<p class="ak-fw-light">ligero</p>
<p class="ak-fst-italic">cursiva</p>
<p class="ak-text-center">centrado</p>
<p class="ak-text-start">izquierda</p>
<p class="ak-text-end">derecha</p>
<p class="ak-text-uppercase">MAYÚSCULAS</p>
<p class="ak-text-lowercase">minúsculas</p>
<p class="ak-text-capitalize">Capitalizado</p>
<p class="ak-text-truncate" style="max-width: 200px;">Texto largo truncado...</p>
```

### Overflow

```html
<div class="ak-overflow-auto">auto</div>
<div class="ak-overflow-hidden">hidden</div>
<div class="ak-overflow-scroll">scroll</div>
<div class="ak-overflow-x-auto">x-auto</div>
<div class="ak-overflow-y-auto">y-auto</div>
```

### Position

```html
<div class="ak-position-relative">relativo</div>
<div class="ak-position-absolute">absoluto</div>
<div class="ak-position-fixed">fijo</div>
<div class="ak-position-sticky">sticky</div>

<!-- Coordenadas -->
<div class="ak-position-absolute ak-top-0 ak-end-0">arriba derecha</div>
<div class="ak-position-absolute ak-top-50 ak-start-50 ak-translate-middle">centrado</div>
```

### Opacity

```html
<div class="ak-opacity-25">25%</div>
<div class="ak-opacity-50">50%</div>
<div class="ak-opacity-75">75%</div>
<div class="ak-opacity-100">100%</div>
```

### Ratio (aspect-ratio)

```html
<div class="ak-ratio ak-ratio-16x9">
  <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" allowfullscreen></iframe>
</div>

<!-- Variantes: ak-ratio-1x1 | ak-ratio-4x3 | ak-ratio-16x9 | ak-ratio-21x9 -->
```

### Stacks

```html
<!-- Vertical -->
<div class="ak-vstack ak-gap-2">
  <div>Elemento 1</div>
  <div>Elemento 2</div>
</div>

<!-- Horizontal -->
<div class="ak-hstack ak-gap-3">
  <div>Izquierda</div>
  <div class="ak-vr"></div>
  <div class="ak-ms-auto">Derecha</div>
</div>

### App layout (Navbar + Drawer + Main)

```html
<body class="ak-body ak-app">
  <nav class="ak-navbar">...</nav>
  <div class="ak-app-body">
    <div class="ak-drawer">...</div>
    <main class="ak-app-main">...</main>
  </div>
</body>
```

| Clase | Descripción |
|-------|-------------|
| `.ak-app` | `display:flex; flex-direction:column; min-height:100vh` |
| `.ak-app-body` | `display:flex; flex:1; min-height:0` — wrapper drawer + main |
| `.ak-app-main` | `flex:1; min-width:0; overflow-y:auto` — contenido principal |

### Helpers adicionales

```html
<!-- Visually hidden (accesible a lectores de pantalla) -->
<span class="ak-visually-hidden">Solo para lectores de pantalla</span>

<!-- Clearfix -->
<div class="ak-clearfix">
  <div class="ak-float-start">Flotado izquierda</div>
  <div class="ak-float-end">Flotado derecha</div>
</div>

<!-- Stretched link (toda la card clicable) -->
<div class="ak-card" style="position:relative;">
  <div class="ak-card-body">
    <h5 class="ak-card-title">Card clicable</h5>
    <a href="#" class="ak-stretched-link">Link</a>
  </div>
</div>

<!-- Focus ring -->
<button class="ak-focus-ring">Botón con focus ring</button>

<!-- Z-index -->
<div class="ak-z-0">z-0</div>
<div class="ak-z-1">z-1</div>
<div class="ak-z-2">z-2</div>
<div class="ak-z-3">z-3</div>
```

---

## 🎨 Iconos SVG (+50)

Agrocity incluye un set de iconos SVG livianos (estilo Feather) para agricultura y UI general.

### Uso en HTML (auto-init)

```html
<!-- Basta con cargar agrocity-icons.js después de agrocity-kit.js -->
<script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/js/agrocity-kit.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/js/agrocity-icons.min.js"></script>

<!-- Los atributos data-ak-icon se reemplazan automáticamente por SVG -->
<span data-ak-icon="home"></span>
<span data-ak-icon="search" data-ak-icon-size="24"></span>
<span data-ak-icon="user" class="ak-icon-lg ak-icon-primary"></span>
<button class="ak-icon-btn" data-ak-icon="settings"></button>
```

### Uso via JavaScript

```javascript
// Devuelve string SVG para usar en innerHTML
btn.innerHTML = AgrocityKit.icon('search') + ' Buscar';
btn.innerHTML = AgrocityKit.icon('edit', 16) + ' Editar';

// Icono con clase personalizada
AgrocityKit.icon('alert', 24, { class: 'ak-icon ak-icon-danger' });
```

### Lista completa de iconos

| Icono | Nombre | Icono | Nombre |
|-------|--------|-------|--------|
| 🏠 | `home` | 🔍 | `search` |
| ☰ | `menu` | ✕ | `close` |
| ⬇ | `chevron-down` | ⬆ | `chevron-up` |
| ◀ | `chevron-left` | ▶ | `chevron-right` |
| ← | `arrow-left` | → | `arrow-right` |
| + | `plus` | − | `minus` |
| ⚙ | `settings` | ⋮ | `more-vertical` |
| ✎ | `edit` | 🗑 | `trash` |
| ⬇ | `download` | ⬆ | `upload` |
| 🔗 | `external` | 🔄 | `refresh` |
| 👤 | `user` | 👥 | `users` |
| 🔔 | `bell` | ✉ | `mail` |
| ℹ | `info` | ⚠ | `alert` |
| ✓ | `check` | ✗ | `x` |
| 🌱 | `seed` | 🌿 | `sprout` |
| ☀ | `sun` | 💧 | `droplet` |
| 📍 | `map-pin` | 🗺 | `map` |
| 🚜 | `tractor` | 📅 | `calendar` |
| 🕐 | `clock` | 🎯 | `target` |
| 📊 | `bar-chart` | 📈 | `trending-up` |
| 📉 | `trending-down` | ★ | `star` |
| ♥ | `heart` | 📄 | `file` |
| 📁 | `folder` | 🖼 | `image` |
| 🖨 | `printer` | 📱 | `smartphone` |
| 📶 | `wifi` | 📋 | `columns` |

### Clases CSS para iconos

```html
<!-- Tamaños -->
<span data-ak-icon="home" class="ak-icon-xs"></span>
<span data-ak-icon="home" class="ak-icon-sm"></span>
<span data-ak-icon="home" class="ak-icon-md"></span>
<span data-ak-icon="home" class="ak-icon-lg"></span>
<span data-ak-icon="home" class="ak-icon-xl"></span>

<!-- Colores (usan variables del tema) -->
<span data-ak-icon="user" class="ak-icon-primary"></span>
<span data-ak-icon="user" class="ak-icon-muted"></span>
<span data-ak-icon="user" class="ak-icon-danger"></span>

<!-- Estados -->
<span data-ak-icon="refresh" class="ak-icon-spin"></span>
<span data-ak-icon="bell" class="ak-icon-pulse"></span>

<!-- Botón icono circular -->
<button class="ak-icon-btn" data-ak-icon="edit" aria-label="Editar"></button>
```

---

## ⚙️ API JavaScript completa

### Referencia de métodos

```javascript
// Tema
AgrocityKit.theme('light' | 'dark' | 'toggle');
AgrocityKit.setTheme({ light: { '--ak-primary': '...' }, dark: { '--ak-secondary': '...' } });

// Loader
AgrocityKit.loader(true, ['Iniciando...', 'Procesando...']);
AgrocityKit.loader(false);
AgrocityKit.initLoader({ brand: { name: 'MI<span>APP</span>', slogan: 'Mi slogan' } });

// Custom Select
AgrocityKit.select(selector, options);

// DataTable
AgrocityKit.dataTable(selector, options);

// DatePicker
AgrocityKit.datepicker(selector, options);

// TimePicker
AgrocityKit.timepicker(selector, options);

// Alert
AgrocityKit.alert(selector).close();

// Collapse
AgrocityKit.collapse(selector).show();
AgrocityKit.collapse(selector).hide();
AgrocityKit.collapse(selector).toggle();

// Dropdown
AgrocityKit.dropdown(selector).show();
AgrocityKit.dropdown(selector).hide();
AgrocityKit.dropdown(selector).toggle();

// Modal
AgrocityKit.modal(selector).show();
AgrocityKit.modal(selector).hide();

// Drawer
AgrocityKit.drawer(selector).show();
AgrocityKit.drawer(selector).hide();

// Offcanvas
AgrocityKit.offcanvas(selector).show();
AgrocityKit.offcanvas(selector).hide();

// Password Toggle
AgrocityKit.passwordToggle(rootElement);

// File Input
AgrocityKit.fileInput(rootElement);

// Tab
AgrocityKit.tab(selector).show();

// Toast
AgrocityKit.showToast(message, options);

// Tooltip
AgrocityKit.tooltip(selector, options);

// Popover
AgrocityKit.popover(selector, options);

// Carousel
AgrocityKit.carousel(selector, options);

// ScrollSpy
AgrocityKit.scrollspy(selector, options);

// Instancia y destrucción
AgrocityKit.getInstance(element);
AgrocityKit.destroy(selector);

// Re-inicializar todo
AgrocityKit.autoInit();

// Inicializar componentes dinámicos
AgrocityKit.initElement(contenedorOModalDinamico);
```

### Inicialización de elementos dinámicos

Cuando agregas componentes al DOM después de la carga inicial (SPA, infinite scroll, modales dinámicos, etc.), usa `AgrocityKit.initElement()` para inicializarlos:

```javascript
// Después de agregar HTML dinámico con data-ak-*:
contenedor.innerHTML = `
  <select data-ak-select data-ak-placeholder="Buscar cultivo...">
    <option value="maiz">Maíz</option>
    <option value="trigo">Trigo</option>
  </select>
  <input type="text" class="ak-form-control" data-ak-datepicker />
`;

// Inicializa todos los componentes dentro del contenedor
AgrocityKit.initElement(contenedor);
```

Soporta todos los componentes con `data-ak-*`: `data-ak-select`, `data-ak-datatable`, `data-ak-datepicker`, `data-ak-timepicker`, `data-ak-tooltip`, `data-ak-popover`, `data-ak-carousel`, `data-ak-scrollspy`, además de `passwordToggle`, `fileInput` y `data-ak-toggle`/`data-ak-dismiss` (drawer, drawer-sub).

### Eventos personalizados

Todos los componentes JS emiten eventos en formato `ak:{componente}:{acción}`:

```javascript
document.getElementById('miModal').addEventListener('ak:modal:show', () => {});
document.getElementById('miModal').addEventListener('ak:modal:hide', () => {});
document.getElementById('miCarousel').addEventListener('ak:carousel:slide', (e) => {
  console.log('Slide actual:', e.detail.index);
});
```

### Atributos data-ak-* para auto-init

| Atributo                  | Componente       |
|---------------------------|------------------|
| `data-ak-select`          | Custom Select    |
| `data-ak-datatable`       | Data Table       |
| `data-ak-datepicker`      | DatePicker       |
| `data-ak-exclude-dates`   | Fechas excluidas en DatePicker |
| `data-ak-days-of-week-disabled` | Días de semana deshabilitados (0-6, separados por coma) |
| `data-ak-autoclose`       | Cerrar al seleccionar (true/false) |
| `data-ak-today-btn`       | Botón "Hoy" (true/false) |
| `data-ak-clear-btn`       | Botón "Limpiar" (true/false) |
| `data-ak-start-view`      | Vista inicial: 0=días, 1=meses, 2=años |
| `data-ak-date-range`      | Rango de fechas vinculado     |
| `data-ak-timepicker`      | TimePicker       |
| `data-ak-toggle="modal"`       | Modal              |
| `data-ak-dismiss="modal"`      | Cierra Modal       |
| `data-ak-toggle="offcanvas"`   | Offcanvas          |
| `data-ak-dismiss="offcanvas"`  | Cierra Offcanvas   |
| `data-ak-toggle="drawer"`      | Drawer             |
| `data-ak-dismiss="drawer"`     | Cierra Drawer      |
| `data-ak-toggle="drawer-sub"`  | Drawer submenu toggle |
| `data-ak-toggle="collapse"`    | Collapse           |
| `data-ak-toggle="dropdown"`    | Dropdown           |
| `data-ak-toggle="tab"`         | Tabs               |
| `data-ak-toggle="accordion"`   | Accordion          |
| `data-ak-dismiss="alert"`      | Cierra Alerta      |
| `data-ak-tooltip`              | Tooltip            |
| `data-ak-popover`              | Popover            |
| `data-ak-carousel`             | Carousel           |
| `data-ak-scrollspy`            | ScrollSpy          |
| `data-ak-icon`                 | Icono SVG (requiere agrocity-icons.js) |
| `data-ak-password-toggle`      | Password Toggle (por defecto en todo input[type="password"]) |
| `data-ak-file-list`            | Selector de lista de archivos para File Input |
| `data-ak-no-toggle`            | Excluye input del password toggle automático |

---

## 🗺️ Mapa de clases CSS

### Prefijos y convenciones

Todas las clases usan el prefijo `ak-` para evitar conflictos con otros frameworks.

| Categoría      | Ejemplo de clases                                     |
|----------------|-------------------------------------------------------|
| Layout         | `ak-container`, `ak-row`, `ak-col-*`, `ak-offset-*`, `ak-app`, `ak-app-body`, `ak-app-main` |
| Tipografía     | `ak-h1`…`ak-h6`, `ak-display-*`, `ak-lead`           |
| Formularios    | `ak-form-control`, `ak-form-select`, `ak-form-check`, `ak-form-file` |
| Botones        | `ak-btn`, `ak-btn-primary`, `ak-btn-lg`, `ak-btn-sm`  |
| Badges         | `ak-badge`, `ak-badge-pill`, `ak-bg-*`                |
| Alertas        | `ak-alert`, `ak-alert-success`, `ak-alert-dismissible`|
| Cards          | `ak-card`, `ak-card-body`, `ak-card-header`           |
| Tablas         | `ak-table`, `ak-table-striped`, `ak-table-hover`      |
| Navegación     | `ak-navbar`, `ak-nav`, `ak-nav-tabs`, `ak-nav-pills`  |
| Componentes    | `ak-modal`, `ak-dropdown`, `ak-accordion`, `ak-datepicker`, `ak-timepicker`, `ak-drawer`, `ak-drawer-item`, `ak-drawer-sub` |
| Feedback       | `ak-spinner-border`, `ak-progress`, `ak-toast`, `ak-placeholder` |
| Utilidades     | `ak-m-*`, `ak-p-*`, `ak-d-*`, `ak-text-*`, `ak-bg-*` |

---

## 🌙 Soporte de tema oscuro

El tema oscuro se activa añadiendo `data-theme="dark"` al elemento `<html>` o llamando a `AgrocityKit.theme('dark')`. Todos los colores se redefinen automáticamente mediante variables CSS.

```javascript
// Detectar preferencia del sistema
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (prefersDark) AgrocityKit.theme('dark');

// Guardar preferencia en localStorage
function toggleTheme() {
  AgrocityKit.theme('toggle');
  localStorage.setItem('ak-theme', document.documentElement.getAttribute('data-theme'));
}

// Restaurar al cargar
const saved = localStorage.getItem('ak-theme');
if (saved) AgrocityKit.theme(saved);
```

### `AgrocityKit.setTheme(config)`

Configura colores personalizados para modo light y dark. Inyecta un bloque `<style>` con reglas `:root` y `[data-theme="dark"]`. Aplica inmediatamente según el tema actual.

```javascript
// Aplica tema "tierra" — todos los componentes que usen --ak-* se actualizan
AgrocityKit.setTheme({
  light: {
    '--ak-primary': '#8B5E3C',
    '--ak-primary-light': '#C49A6C',
    '--ak-secondary': '#5C4033',
    '--ak-secondary-dark': '#3E2723',
    '--ak-secondary-light': '#8D6E63',
    '--ak-bg': '#FFF8F0',
    '--ak-surface': '#FFF8F0',
    '--ak-surface-alt': '#F5EDE4'
  },
  dark: {
    '--ak-primary': '#C49A6C',
    '--ak-primary-light': '#8B5E3C',
    '--ak-secondary': '#A1887F',
    '--ak-secondary-dark': '#4E342E',
    '--ak-secondary-light': '#8D6E63',
    '--ak-bg': '#1A1410',
    '--ak-surface': '#2C221C',
    '--ak-surface-alt': '#3E322B'
  }
});
```

### `AgrocityKit.initLoader(config)`

Configura la marca (nombre, slogan) del loader de pantalla completa antes de mostrarlo.

```javascript
AgrocityKit.initLoader({
  brand: {
    name: 'AGRO<span>CITY</span>',  // HTML permitido para acento
    slogan: 'Sembrando tecnología'
  }
});

// Luego usalo como siempre
AgrocityKit.loader(true, ['Iniciando...', 'Cargando datos...']);
```

> **Nota:** los colores del loader usan variables `--ak-loader-*` que por defecto se definen en `.ak-loader-overlay`. Se adaptan automáticamente al tema claro/oscuro y a cualquier `setTheme()` que se haya aplicado.

---

## 🏗️ Plantillas de layout

### Header + Body

```html
<!DOCTYPE html>
<html lang="es" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/css/agrocity-kit.min.css" />
</head>
<body class="ak-body">
  <header class="ak-navbar">
    <a href="#" class="ak-navbar-brand">Mi App</a>
    <nav class="ak-navbar-nav">
      <a href="#" class="ak-nav-link ak-active">Inicio</a>
      <a href="#" class="ak-nav-link">Cultivos</a>
    </nav>
  </header>
  <main class="ak-container ak-py-4">
    <h1 class="ak-h3">Título</h1>
    <p>Contenido principal aquí.</p>
  </main>
  <script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/js/agrocity-kit.min.js"></script>
</body>
</html>
```

### Header fijo + Body con scroll

```html
<body class="ak-body">
  <header class="ak-navbar ak-fixed-top">
    <a href="#" class="ak-navbar-brand">Mi App</a>
    <nav class="ak-navbar-nav">
      <a href="#" class="ak-nav-link">Inicio</a>
      <a href="#" class="ak-nav-link">Cultivos</a>
    </nav>
  </header>
  <main class="ak-container ak-py-4" style="margin-top: 64px;">
    <h1>Contenido con scroll</h1>
    <p>El header permanece fijo arriba.</p>
  </main>
  <script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/js/agrocity-kit.min.js"></script>
</body>
</html>
```

### Header + Offcanvas lateral + Body responsive

```html
<body class="ak-body">
  <!-- Botón menú solo en móvil -->
  <header class="ak-navbar">
    <button class="ak-navbar-toggler ak-d-md-none"
            data-ak-toggle="offcanvas"
            data-ak-target="#menuOffcanvas">☰</button>
    <a href="#" class="ak-navbar-brand">Mi App</a>
  </header>

  <!-- Offcanvas (móvil) / Sidebar (desktop) -->
  <div class="ak-offcanvas ak-offcanvas-start" id="menuOffcanvas" tabindex="-1">
    <div class="ak-offcanvas-header">
      <h5 class="ak-offcanvas-title">Menú</h5>
      <button class="ak-btn-close" data-ak-dismiss="offcanvas"></button>
    </div>
    <div class="ak-offcanvas-body">
      <nav class="ak-nav ak-flex-column">
        <a href="#" class="ak-nav-link ak-active">Inicio</a>
        <a href="#" class="ak-nav-link">Cultivos</a>
        <a href="#" class="ak-nav-link">Reportes</a>
      </nav>
    </div>
  </div>

  <div class="ak-container-fluid ak-py-4">
    <div class="ak-row">
      <aside class="ak-d-none ak-d-md-block ak-col-md-3">
        <nav class="ak-nav ak-flex-column ak-border ak-rounded ak-p-2">
          <a href="#" class="ak-nav-link ak-active">Inicio</a>
          <a href="#" class="ak-nav-link">Cultivos</a>
          <a href="#" class="ak-nav-link">Reportes</a>
        </nav>
      </aside>
      <main class="ak-col-12 ak-col-md-9">
        <h1>Contenido principal</h1>
        <p>En desktop el menú se ve como sidebar; en móvil como offcanvas.</p>
      </main>
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/js/agrocity-kit.min.js"></script>
</body>
</html>
```

### Navbar + Drawer (sidebar desktop, overlay móvil)

```html
<!DOCTYPE html>
<html lang="es" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/css/agrocity-kit.min.css" />
</head>
<body class="ak-body ak-app">
  <!-- Navbar fija -->
  <nav class="ak-navbar">
    <button class="ak-navbar-toggler" data-ak-toggle="drawer" data-ak-target="#appDrawer">☰</button>
    <a href="#" class="ak-navbar-brand">🌱 Agro App</a>
  </nav>

  <div class="ak-app-body">
    <!-- Drawer (sidebar >=768px, overlay <768px) -->
    <div class="ak-drawer" id="appDrawer">
      <div class="ak-drawer-backdrop"></div>
      <div class="ak-drawer-content">
        <div class="ak-drawer-header">
          <div class="ak-drawer-header-avatar">AG</div>
          <div>
            <div class="ak-drawer-header-title">AgroCity</div>
            <div class="ak-drawer-header-subtitle">admin@agrocity.com</div>
          </div>
        </div>
        <div class="ak-drawer-body">
          <div class="ak-drawer-subheader">General</div>
          <a href="#" class="ak-drawer-item ak-active">
            <span class="ak-drawer-item-icon">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" class="ak-drawer-item" data-ak-toggle="drawer-sub" data-ak-target="#sub1">
            <span class="ak-drawer-item-icon">🌾</span>
            <span>Cultivos</span>
            <svg class="bd-chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </a>
          <div id="sub1" class="ak-drawer-sub">
            <a href="#" class="ak-drawer-sub-item">Maíz</a>
            <a href="#" class="ak-drawer-sub-item">Trigo</a>
          </div>
        </div>
        <div class="ak-drawer-footer">
          <a href="#" class="ak-drawer-item">🚪 Cerrar sesión</a>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <main class="ak-app-main ak-p-3">
      <h1>Dashboard</h1>
      <p>Contenido aquí...</p>
    </main>
  </div>

  <script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/agrocity-framework/dist/js/agrocity-kit.min.js"></script>
</body>
</html>
```

Ver ejemplo completo en `examples/navbar-drawer.html`.

---

## 📊 Data Table — más opciones

La Data Table se activa con `data-ak-datatable` en una `<table>` o mediante `AgrocityKit.dataTable(selector, config)`.

### Ejemplo con opciones avanzadas

```html
<table id="tabla-cultivos" class="ak-table ak-table-striped ak-table-hover"
       data-ak-datatable
       data-ak-page-size="15"
       data-ak-search="true"
       data-ak-pagination="true"
       data-ak-sortable="true"
       data-ak-export-csv="true"
       data-ak-sticky-header="true"
       data-ak-responsive-cards="true">
  <thead>
    <tr>
      <th data-key="nombre" data-sortable="true">Cultivo</th>
      <th data-key="area" data-type="number">Área (ha)</th>
      <th data-key="rendimiento" data-type="number">Rendimiento</th>
      <th data-key="estado" data-sortable="false">Estado</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Maíz</td><td>12.5</td><td>8.2</td><td><span class="ak-badge-success">Activo</span></td></tr>
    <tr><td>Trigo</td><td>8.3</td><td>5.1</td><td><span class="ak-badge-warning">Pendiente</span></td></tr>
  </tbody>
</table>
```

### Configuración vía JS

```javascript
AgrocityKit.dataTable('#tabla-cultivos', {
  pageSize: 10,
  pageSizeOptions: [5, 10, 25, 50],
  searchable: true,
  sortable: true,
  pagination: true,
  exportCsv: true,
  exportFileName: 'cultivos.csv',
  stickyHeader: true,
  responsiveCards: true,
  emptyText: 'No se encontraron cultivos',
  loading: false,
  columns: [
    { key: 'nombre', label: 'Cultivo', sortable: true },
    { key: 'area', label: 'Área (ha)', sortable: true },
    { key: 'rendimiento', label: 'Rendimiento', sortable: true },
    {
      key: 'estado',
      label: 'Estado',
      sortable: false,
      render: (val) => `<span class="ak-badge-success">${val}</span>`
    },
  ],
  data: [
    { nombre: 'Maíz', area: 12.5, rendimiento: 8.2, estado: 'Activo' },
    { nombre: 'Trigo', area: 8.3, rendimiento: 5.1, estado: 'Pendiente' },
  ],
});
```

### Columnas con render personalizado

```javascript
columns: [
  {
    key: 'acciones',
    label: 'Acciones',
    sortable: false,
    render: (val, row) => {
      const btn = document.createElement('button');
      btn.className = 'ak-btn ak-btn-sm ak-btn-primary';
      btn.textContent = 'Editar';
      btn.onclick = () => alert('Editando ' + row.nombre);
      return btn;
    },
  },
]
```

---

## 🏷️ Versión

| Versión | Descripción                        |
|---------|------------------------------------|
| 1.2.1   | Modal scrollable, tabs vertical border-radius, asterisk fix, mejoras de validación |
| 1.2.0   | DatePicker (3 vistas), TimePicker, `initElement()`, DateRange vinculado |
| 1.1.0   | Diseño intermedio Bootstrap × Material Design, password toggle, switches y floating labels mejorados |
| 1.0.0   | Release inicial — todos los componentes Bootstrap 5 parity |

---

## 📄 Licencia

MIT © Agrocity Framework
