# QCFeedback

Widget de feedback con captura de pantalla integrada para sitios web.

## Características

- Captura de pantalla completa o por región
- Editor de imágenes integrado (dibujo, formas, texto, flechas)
- Chat de feedback con descripción y prioridad
- Tema claro/oscuro
- API pública para control programático
- Eventos para integración personalizada
- Carga automática de dependencias (html2canvas + fabric.js)

## Instalación

### Desde CDN (jsDelivr)

Incluye la librería directamente desde GitHub:

```html
<script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/qc_feedback/qc_feedback_min.js"></script>
```

> **Nota:** Si experimentas problemas de caché, puedes purgar el CDN usando: https://www.jsdelivr.com/tools/purge

### Desarrollo local

Si prefieres usar el archivo local:

```html
<script src="qc_feedback.js"></script>
```

## Uso Rápido

Agregar el componente:

```html
<qc-feedback
    app-name="MiApp"
    primary-color="#2563eb"
    position="bottom-right"
    endpoint="https://tu-servicio.com/api/feedback"
    title="Enviar feedback"
    subtitle="¿Qué problema encontraste?"
    theme="light">
</qc-feedback>
```

## Atributos

| Atributo | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `app-name` | string | `document.title` | Nombre de la aplicación |
| `primary-color` | string | `#2563eb` | Color principal del widget |
| `position` | string | `bottom-right` | Posición del FAB (bottom-right, bottom-left, top-right, top-left) |
| `endpoint` | string | (vacío) | URL del endpoint para enviar los datos |
| `title` | string | `Enviar feedback` | Título de la ventana de chat |
| `subtitle` | string | `¿Qué te ocurrió?` | Mensaje de bienvenida |
| `size` | string | `md` | Tamaño del FAB (sm, md, lg) |
| `theme` | string | `light` | Tema visual (light, dark) |

## API Pública

```javascript
const widget = document.querySelector('qc-feedback');

// Abrir el widget
widget.openWidget();

// Cerrar el widget
widget.closeWidget();

// Capturar pantalla directamente
widget.capture();

// Cambiar tema
widget.setTheme('dark');

// Enviar feedback manualmente
widget.send();
```

## Eventos

```javascript
const widget = document.querySelector('qc-feedback');

// Se dispara cuando se abre el widget
widget.addEventListener('feedback-open', () => {
    console.log('Widget abierto');
});

// Se dispara cuando se cierra el widget
widget.addEventListener('feedback-close', () => {
    console.log('Widget cerrado');
});

// Se dispara cuando se envía el feedback
widget.addEventListener('feedback-submit', (e) => {
    console.log('Datos enviados:', e.detail);
    // e.detail contiene: app, description, priority, screenshot, url, browser, resolution, timestamp
});
```

## Datos Enviados

Al enviar el feedback, se envía un POST al `endpoint` con el siguiente formato:

```json
{
  "app": "Nombre de la App",
  "description": "Descripción del problema",
  "priority": "media",
  "screenshot": "data:image/png;base64,...",
  "url": "https://...",
  "browser": "Mozilla/5.0...",
  "resolution": "1920x1080",
  "timestamp": "2026-04-30T12:00:00.000Z"
}
```

## Captura de Pantalla

El widget ofrece dos modos de captura:

- **Completa**: Captura toda la página visible
- **Región**: Permite seleccionar un área específica con el mouse

Después de capturar, se abre el editor donde puedes:
- Dibujar a mano alzada
- Agregar rectángulos, círculos y flechas
- Insertar texto
- Deshacer cambios
- Eliminar elementos seleccionados

## Demo

Abre `index.html` en un navegador para ver el ejemplo funcional.

## Navegadores Soportados

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Licencia

MIT