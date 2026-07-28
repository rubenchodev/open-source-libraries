# Framework Web

Framework UI ligero, sin dependencias. Incluye un helper DOM tipo jQuery (`$Q()`) y un módulo de geolocalización para México (`MXGeo`) con datos de INEGI.

---

## Características

- **Sin dependencias** — JavaScript vanilla, sin librerías externas
- **$Q()** — API tipo jQuery: selectores CSS, manipulación DOM, eventos, AJAX
- **MXGeo** — Cascada Estado → Municipio → Localidad con datos reales de INEGI
- **Auto-vinculación declarativa** — `data-mxgeo-*` para conectar selects sin JS
- **Ligero** — ~10 KB `dom-helper.js` + ~5 KB `mx-geo.js` minificados
- **AJAX integrado** — `$Q.ajax`, `$Q.get`, `$Q.getJSON`, `$Q.post`

---

## Instalación

### Desde CDN (jsDelivr)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
  <!-- Tu contenido aquí -->

  <script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/framework_web/dist/dom-helper.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/framework_web/dist/mx-geo.min.js"></script>
</body>
</html>
```

> **Nota:** Si experimentas problemas de caché, purga el CDN en https://www.jsdelivr.com/tools/purge

### Descarga local

Clona el repositorio y usa los archivos directamente:

```html
<script src="dist/dom-helper.min.js"></script>
<script src="dist/mx-geo.min.js"></script>
```

---

## Archivos

```
framework_web/
├── dist/
│   ├── dom-helper.min.js          # Helper DOM minificado
│   ├── mx-geo.min.js              # Módulo geo MX minificado
│   └── mxGeoJSON/
│       ├── index.json             # Lista de estados [{id, name}]
│       ├── 01.json .. 32.json     # Datos por estado (municipios)
│       └── localidades/
│           └── {stateId}{munId}.json  # Localidades por municipio
├── src/
│   ├── dom-helper.js              # Fuente del helper DOM
│   └── mx-geo.js                  # Fuente del módulo geo
├── scripts/
│   └── fetch-localidades.js       # Script para descargar localidades INEGI
├── build.js                       # Script de build (Terser)
├── package.json
└── README.md
```

---

## $Q() — Helper DOM

`$Q()` es una función tipo jQuery que encapsula una colección de elementos DOM con métodos encadenables.

### Selectores

```javascript
// Selector CSS
$Q('#id');
$Q('.clase');
$Q('div > p');

// Elemento DOM
$Q(document.body);

// Crear HTML
$Q('<div class="mi-clase">Contenido</div>');

// Función (DOMContentLoaded)
$Q(function() {
  console.log('DOM listo');
});
```

### Métodos de colección

#### Manipulación de contenido

```javascript
$Q('#input').val();                   // Obtener valor
$Q('#input').val('nuevo');            // Asignar valor
$Q('#el').text();                     // Obtener textContent
$Q('#el').text('Hola');              // Asignar textContent
$Q('#el').html();                     // Obtener innerHTML
$Q('#el').html('<b>Hola</b>');       // Asignar innerHTML
$Q('#el').empty();                    // Vaciar contenido
```

#### Atributos y propiedades

```javascript
$Q('#el').attr('data-id');            // Obtener atributo
$Q('#el').attr('data-id', '123');     // Asignar atributo
$Q('#el').attr({ 'data-a': '1', 'data-b': '2' });  // Múltiples
$Q('#el').removeAttr('data-id');      // Eliminar atributo
$Q('#el').prop('checked');            // Obtener propiedad
$Q('#el').prop('checked', true);      // Asignar propiedad
```

#### Clases CSS

```javascript
$Q('#el').addClass('activo');
$Q('#el').removeClass('activo');
$Q('#el').toggleClass('activo');
$Q('#el').hasClass('activo');         // true / false
```

#### Estilos y visibilidad

```javascript
$Q('#el').css('color');               // Obtener (getComputedStyle)
$Q('#el').css('color', 'red');        // Asignar
$Q('#el').show();                     // display: ""
$Q('#el').hide();                     // display: none
```

#### DOM traversal

```javascript
$Q('#el').find('span');               // Buscar descendientes
$Q('#el').parent();                   // Padre directo
$Q('#el').children('.item');          // Hijos
$Q('#el').siblings('div');            // Hermanos
$Q('#el').closest('.contenedor');     // Primer ancestro
$Q('#el').next('p');                  // Hermano siguiente
$Q('#el').prev('p');                  // Hermano anterior
$Q('#el').eq(0);                      // Elemento en índice
$Q('#el').first();                    // Primer elemento
$Q('#el').last();                     // Último elemento
$Q('#el').filter('.visible');         // Filtrar por selector
$Q('#el').not('.hidden');             // Excluir por selector
$Q('#el').is('div');                  // Coincide con selector?
$Q('#el').index();                    // Posición respecto al padre
$Q('#el').slice(0, 3);               // Subconjunto
```

#### Manipulación DOM

```javascript
$Q('#padre').append('<span>Hijo</span>');      // Insertar al final
$Q('#padre').prepend('<span>Inicio</span>');   // Insertar al inicio
$Q('#ref').before('<div>Antes</div>');         // Insertar antes
$Q('#ref').after('<div>Después</div>');        // Insertar después
$Q('#el').remove();                             // Eliminar del DOM
$Q('<div>Nuevo</div>').appendTo('#padre');     // Mover a destino
$Q('#el').replaceWith('<div>Reemplazo</div>');  // Reemplazar
$Q('#el').clone();                              // Clonar
```

#### Eventos

```javascript
$Q('#btn').on('click', function(e) { ... });   // addEventListener
$Q('#btn').off('click', fn);                    // removeEventListener
$Q('#form').submit();                           // Disparar submit
$Q('#form').submit(function(e) { ... });        // Handler submit
$Q('#el').trigger('mi-evento', { clave: valor }); // Custom event
$Q('#el').focus();                              // Enfocar
```

#### Data

```javascript
$Q('#el').data('key');              // Obtener de cache + data-*
$Q('#el').data('key', 'valor');     // Asignar en cache
$Q('#el').data();                   // Todas las data-* como objeto
```

#### Serialización

```javascript
$Q('#form').serialize();            // { name: value, ... }
```

### Utilidades

```javascript
$Q.trim('  texto  ');              // "texto"
$Q.each([1, 2, 3], function(i, v) { ... });
$Q.map([1, 2, 3], function(i, v) { return v * 2; });
$Q.isArray([]);                    // true
$Q.isFunction(function() {});      // true
$Q.isPlainObject({});              // true
$Q.inArray(3, [1, 2, 3]);          // 2
$Q.extend({ a: 1 }, { b: 2 });    // { a: 1, b: 2 }
$Q.extend(true, {}, { a: { b: 1 } }, { a: { c: 2 } });  // deep merge
```

### AJAX

```javascript
$Q.ajax({
  url: '/api/data',
  method: 'GET',
  data: { id: 123 },
  success: function(data, status, xhr) { ... },
  error: function(xhr, status, error) { ... },
  complete: function(xhr, status) { ... },
  dataType: 'json',           // 'json' | 'text' | 'html'
  headers: { 'X-Custom': 'value' },
});

// Atajos
$Q.get('/api/data', { id: 123 }, function(data) { ... });
$Q.getJSON('/api/data', { id: 123 }, function(data) { ... });
$Q.post('/api/data', { nombre: 'Juan' }, function(data) { ... });
```

---

## MXGeo — Módulo de geolocalización para México

`MXGeo` proporciona una cascada de selects para Estado → Municipio → Localidad con datos del INEGI.

### Uso declarativo (auto-vinculación)

Agrega `data-mxgeo-group` a un conjunto de `<select>` y los atributos `data-mxgeo-state`, `data-mxgeo-municipality`, `data-mxgeo-locality`:

```html
<select data-mxgeo-group="direccion" data-mxgeo-state>
  <option value="">Seleccionar estado...</option>
</select>

<select data-mxgeo-group="direccion" data-mxgeo-municipality disabled>
  <option value="">Seleccionar municipio...</option>
</select>

<select data-mxgeo-group="direccion" data-mxgeo-locality disabled>
  <option value="">Seleccionar localidad...</option>
</select>
```

Al seleccionar un estado se cargan los municipios; al seleccionar un municipio se cargan las localidades. Se auto-inicializa al cargar el DOM.

### Inicialización manual

```javascript
// Escanear todo el documento (auto-init al cargar)
MXGeo.init();

// Escanear solo un contenedor
MXGeo.init('#contenedor');
MXGeo.init(document.getElementById('contenedor'));
```

### API programática

```javascript
// Lista de estados [{ id: "01", name: "Aguascalientes" }, ...]
MXGeo.fetchStates().then(function(estados) { ... });

// Municipios de un estado [{ id: "001", name: "Aguascalientes" }, ...]
MXGeo.fetchMunicipalities("01").then(function(municipios) { ... });

// Localidades de un municipio [{ id: "0001", name: "Aguascalientes", ambito: "U" }, ...]
MXGeo.fetchLocalities("01", "001").then(function(localidades) { ... });
```

### Atributos data

| Atributo | Elemento | Descripción |
|---|---|---|
| `data-mxgeo-group` | Grupo de selects | Nombre del grupo (compartido por todos los campos) |
| `data-mxgeo-state` | `<select>` | Select de estado |
| `data-mxgeo-municipality` | `<select>` | Select de municipio |
| `data-mxgeo-locality` | `<select>` | Select de localidad |
| `data-mxgeo-value` | municipality/locality | Valor a auto-asignar tras poblar opciones |

### Integración con AgrocityKit Custom Select

Si `AgrocityKit` está presente, `MXGeo` refresca automáticamente los `data-ak-select` cada vez que se llenan opciones:

```html
<select data-mxgeo-group="dir" data-mxgeo-state
        data-ak-select data-ak-search data-ak-placeholder="Buscar estado...">
</select>
```

### Cache en memoria

Los datos descargados se cachean en `MXGeo.cache`, por lo que llamadas repetidas no generan peticiones adicionales.

---

## Build

El proyecto usa **Terser** para minificar los archivos de `src/` a `dist/`.

```bash
npm install        # Instalar dependencias
node build.js      # Build (minifica src/*.js → dist/*.min.js)
node build.js --watch   # Modo watch (re-build en cambios)
```

### Scripts npm

```bash
npm run build              # Build
npm run watch              # Watch mode
npm run fetch-localidades  # Descargar localidades de INEGI
```

---

## API JavaScript completa

```javascript
// $Q() — Helper DOM
$Q(selector);                          // Seleccionar / crear / ready
$Q.collection.each(fn);                // Iterar
$Q.collection.val([value]);            // Valor
$Q.collection.text([value]);           // Texto
$Q.collection.html([value]);           // HTML
$Q.collection.prop(name, [value]);     // Propiedad
$Q.collection.attr(name, [value]);     // Atributo
$Q.collection.removeAttr(name);        // Eliminar atributo
$Q.collection.data(key, [value]);      // Data
$Q.collection.addClass(cls);           // Agregar clase
$Q.collection.removeClass(cls);        // Quitar clase
$Q.collection.toggleClass(cls);        // Alternar clase
$Q.collection.hasClass(cls);           // Verificar clase
$Q.collection.css(prop, [value]);      // Estilo
$Q.collection.show();                  // Mostrar
$Q.collection.hide();                  // Ocultar
$Q.collection.on(type, fn);            // Evento
$Q.collection.off(type, fn);           // Remover evento
$Q.collection.submit([fn]);            // Submit
$Q.collection.trigger(type, detail);   // Custom event
$Q.collection.find(sel);               // Buscar
$Q.collection.parent();                // Padre
$Q.collection.children([sel]);         // Hijos
$Q.collection.siblings([sel]);         // Hermanos
$Q.collection.closest(sel);            // Ancestro
$Q.collection.next([sel]);             // Hermano siguiente
$Q.collection.prev([sel]);             // Hermano anterior
$Q.collection.eq(index);               // Índice
$Q.collection.first();                 // Primero
$Q.collection.last();                  // Último
$Q.collection.filter(sel);             // Filtrar
$Q.collection.not(sel);               // Excluir
$Q.collection.is(sel);                 // Coincide
$Q.collection.index();                 // Posición
$Q.collection.append(content);         // Insertar al final
$Q.collection.prepend(content);        // Insertar al inicio
$Q.collection.before(content);         // Insertar antes
$Q.collection.after(content);          // Insertar después
$Q.collection.appendTo(target);        // Mover a destino
$Q.collection.remove();                // Eliminar
$Q.collection.replaceWith(content);    // Reemplazar
$Q.collection.clone();                 // Clonar
$Q.collection.empty();                 // Vaciar
$Q.collection.focus();                 // Enfocar
$Q.collection.serialize();             // Serializar form
$Q.trim(str);
$Q.each(arr, fn);
$Q.map(arr, fn);
$Q.isArray(val);
$Q.isFunction(val);
$Q.isPlainObject(val);
$Q.inArray(value, arr);
$Q.extend([deep], target, ...sources);
$Q.ajax(options);
$Q.get(url, [data], [success], [dataType]);
$Q.getJSON(url, [data], [success]);
$Q.post(url, [data], [success], [dataType]);

// MXGeo — Geolocalización
MXGeo.init([container]);                                       // Inicializar
MXGeo.fetchStates();                                           // Promise → estados[]
MXGeo.fetchMunicipalities(stateId);                            // Promise → municipios[]
MXGeo.fetchLocalities(stateId, municipalityId);                // Promise → localidades[]
```

---

## Licencia

MIT © Framework Web
