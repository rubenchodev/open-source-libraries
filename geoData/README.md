# 🌍 Cities JSON - Rogelio Salmona Pre-registration

Banco de datos geográficos con **227 países** y **~77,000 ciudades** para el formulario de pre-registro del Premio Latinoamericano de Arquitectura Rogelio Salmona.

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

### Local

```html
<script src="ruta/a/geoData/citiesJson.js"></script>
```

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
| Países | 227 |
| Total ciudades | 76,869 |
| País con más ciudades | US (13,718) |
| Archivo | ~960 KB |

## 🗺️ Países con más ciudades

| Código | País | Ciudades |
|--------|------|----------|
| US | United States | 13,718 |
| FR | France | 12,548 |
| DE | Germany | 7,249 |
| IT | Italy | 4,395 |
| GB | United Kingdom | 2,926 |

## 📄 Licencia

Uso interno para el proyecto Fundación Rogelio Salmona.
