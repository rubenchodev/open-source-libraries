# 🌍 Cities JSON - Rogelio Salmona Pre-registration

Banco de datos geográficos con **223 países** y **~168,000 ciudades**
## 🚀 Instalación

### Desde CDN (jsDelivr)

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.jsdelivr.net/gh/rubenchodev/open-source-libraries@main/geoData/citiesJson.js"></script>
</head>
<body class="ak-body">

  <!-- Tu contenido aquí -->
</body>
</html>
```

> **Nota:** Si experimentas problemas de caché, purga el CDN en https://www.jsdelivr.com/tools/purge

## 📦 Estructura del objeto

```js
const G_CITIES_OBJECT = {
  "CO": ["Bogotá", "Medellín", "Cali", "Barranquilla", ...],
  "AR": ["Buenos Aires", "Córdoba", "Rosario", ...],
  "MX": ["Ciudad de México", "Guadalajara", "Monterrey", ...],
  // ... 227 países en total
};
```

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| Países | 223 |
| Total ciudades | 168,707 |
| País con más ciudades | US (11,940) |
| Archivo | ~2.26 MB |

## 🗺️ Países con más ciudades

| Código | País | Ciudades |
|--------|------|----------|
| US | United States | 11,940 |
| MX | Mexico | 8,048 |
| ES | Spain | 8,342 |
| IT | Italy | 9,636 |
| DE | Germany | 6,846 |
