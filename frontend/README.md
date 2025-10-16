# Frontend - Mapa Interactivo (Prototipo)

Este prototipo implementa únicamente el Mapa Interactivo (heatmap/hotspot) en HTML + Bootstrap + Leaflet.

Cómo probar localmente

1. Asegúrate de que tu backend corra en http://localhost:3000 y exponga `/api/plots`.
2. Servir la carpeta `frontend` con un servidor estático. Ejemplo con npm http-server:

```pwsh
npx http-server .\frontend -p 5500
```

3. Abrir http://localhost:5500 en el navegador.

Notas importantes
- Si el backend usa cookies para auth, el front hace fetch con `credentials: 'include'`.
- Si usas Authorization Bearer, guarda el token en `localStorage` y ajusta `api.js` para enviar header.
- Para desarrollo sin backend puedes activar `USE_MOCK = true` en `assets/js/config.js`.

Estructura
- `index.html` - UI base y contenedores del mapa
- `assets/js/api.js` - cliente REST mínimo
- `assets/js/map.js` - inicialización del mapa y render de features
- `assets/js/ui.js` - sidebar, toasts y búsqueda
- `assets/js/autoRefresh.js` - polling básico
- `assets/css/styles.css` - estilos base
- `mock-data/plots.json` - datos de ejemplo

CORS
Si el frontend está servido desde otro origen, habilitar CORS en el backend y permitir cookies si es necesario:
- Access-Control-Allow-Origin: http://localhost:5500
- Access-Control-Allow-Credentials: true

Si quieres que haga cambios (ej. usar Google Maps, agregar clustering avanzado o WebSocket), dime y lo preparo.