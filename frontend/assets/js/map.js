import { fetchPlots, fetchPlotById } from './api.js';
import { populateSidebar, openSidebar, showToast } from './ui.js';
import { POLL_INTERVAL } from './config.js';

let map, markersLayer, polygonLayer, clusterGroup;
let firstLoad = true;
let searchMarker = null;
let lastFetchError = { msg: null, time: 0 };
let moveTimer = null;

function statusClass(status) {
  if (!status) return '';
  return 'status-' + status;
}

function statusStyle(status) {
  switch ((status || '').toLowerCase()) {
    case 'green':
      return { color: '#16a34a', weight: 1, fillColor: 'rgba(34,197,94,0.5)', fillOpacity: 0.6, className: statusClass(status) };
    case 'red':
      return { color: '#ef4444', weight: 1, fillColor: 'rgba(239,68,68,0.5)', fillOpacity: 0.6, className: statusClass(status) };
    case 'yellow':
      return { color: '#d97706', weight: 1, fillColor: 'rgba(234,179,8,0.5)', fillOpacity: 0.6, className: statusClass(status) };
    case 'blue':
      return { color: '#2563eb', weight: 1, fillColor: 'rgba(59,130,246,0.5)', fillOpacity: 0.6, className: statusClass(status) };
    case 'black':
      return { color: '#111827', weight: 1, fillColor: 'rgba(17,24,39,0.6)', fillOpacity: 0.7, className: statusClass(status) };
    default:
      return { color: '#333', weight: 1, fillColor: 'rgba(100,100,100,0.4)', fillOpacity: 0.4, className: statusClass(status) };
  }
}

export async function initMap() {
  map = L.map('map').setView([-34.60, -58.40], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);    

  clusterGroup = L.markerClusterGroup();
  markersLayer = L.layerGroup();
  // polygonLayer will receive GeoJSON features and apply a CSS class based on status
  polygonLayer = L.geoJSON(null, {
    style: feature => statusStyle(feature.properties?.status),
    onEachFeature: (feature, layer) => {
      const props = feature.properties || {};
      layer.bindTooltip(`${props.cropType || ''} — ${props.status || ''}`);
      layer.on('click', async () => {
        try {
          const detail = await fetchPlotById(props.id);
          const plot = detail.data || detail;
          populateSidebar(plot);
          openSidebar();
        } catch (err) {
          showToast('Error cargando detalle: ' + err.message);
        }
      });
    }
  });

  map.addLayer(clusterGroup);
  map.addLayer(polygonLayer);

  await loadAndRender();

  map.on('moveend', () => {
    // debounce rapid move/zoom events
    if (moveTimer) clearTimeout(moveTimer);
    moveTimer = setTimeout(() => {
      loadAndRender();
    }, 300);
  });

  window.addEventListener('map:search', async (e) => {
    try {
      const data = await loadAndRender({ ownerName: e.detail.q });
      focusOnQueryResult(e.detail.q, data);
    } catch (err) {
      console.error('search handler error', err);
    }
  });
}

async function loadAndRender(params = {}) {
  try {
    const bounds = map.getBounds();
    const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
    const response = await fetchPlots({ bbox, limit: 500, ...params });
    const data = response.data || response;
    renderFeatures(data);
    return data;
  } catch (err) {
    console.error('loadAndRender error', err);
    const now = Date.now();
    const msg = 'No se pudieron cargar parcelas: ' + err.message;
    // suppress identical messages for 5s
    if (lastFetchError.msg !== msg || now - lastFetchError.time > 5000) {
      showToast(msg, 'danger');
      lastFetchError = { msg, time: now };
    } else {
      console.debug('suppressed duplicate fetch error toast');
    }
  }
}

function clearLayers() {
  clusterGroup.clearLayers();
  polygonLayer.clearLayers();
}

function renderFeatures(features) {
  clearLayers();
  features.forEach(f => {
    try {
      const loc = f.location;
      if (!loc) return;
      if (loc.type === 'Point' || loc.type === 'point') {
        const [lon, lat] = loc.coordinates;
        const marker = L.marker([lat, lon]);
        // tag marker with plot id for later lookup
        marker.plotId = f.id;
        marker.bindTooltip(`${f.cropType || ''} — ${f.status || ''}`);
        marker.on('click', async () => {
          try {
            const detail = await fetchPlotById(f.id);
            const plot = detail.data || detail;
            populateSidebar(plot);
            openSidebar();
          } catch (err) {
            showToast('Error cargando detalle: ' + err.message);
          }
        });
        clusterGroup.addLayer(marker);
      } else {
        // Polygon or MultiPolygon: add as GeoJSON to polygonLayer so the layer's
        // style/onEachFeature handlers are applied (and CSS classes for status work)
        const geojson = {
          type: 'Feature',
          geometry: loc,
          properties: { id: f.id, status: f.status, cropType: f.cropType }
        };
        polygonLayer.addData(geojson);
      }
    } catch (err) {
      console.error('renderFeatures error', err);
    }
  });
  // after rendering, if first load, fit map to all features so user is taken to data
  try {
    if (firstLoad) {
      const bounds = L.latLngBounds();
      // extend bounds with polygonLayer bounds
      if (polygonLayer && polygonLayer.getBounds && !polygonLayer.getBounds().isValid()) {
        // no polygon bounds
      }
      if (polygonLayer && polygonLayer.getBounds && polygonLayer.getBounds().isValid()) {
        bounds.extend(polygonLayer.getBounds());
      }
      // extend bounds with clusterGroup markers
      if (clusterGroup && clusterGroup.getBounds && clusterGroup.getBounds().isValid()) {
        bounds.extend(clusterGroup.getBounds());
      }
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.1));
      }
      firstLoad = false;
    }
  } catch (err) {
    console.error('fitBounds error', err);
  }
}

function findPolygonLayerById(id) {
  let found = null;
  polygonLayer.eachLayer(layer => {
    // GeoJSON layer may be a feature group with sub-layers
    if (layer.feature && layer.feature.properties && Number(layer.feature.properties.id) === Number(id)) {
      found = layer;
    }
  });
  return found;
}

function findMarkerById(id) {
  let found = null;
  clusterGroup.eachLayer(layer => {
    if (layer.plotId && Number(layer.plotId) === Number(id)) {
      found = layer;
    }
  });
  return found;
}

function focusOnPlot(id) {
  // try polygon first
  const poly = findPolygonLayerById(id);
  if (poly) {
    const bounds = poly.getBounds();
    const center = bounds.getCenter();
    if (!searchMarker) {
      searchMarker = L.marker(center, { title: 'Resultado búsqueda' }).addTo(map);
    } else {
      searchMarker.setLatLng(center);
      if (!map.hasLayer(searchMarker)) map.addLayer(searchMarker);
    }
    map.fitBounds(bounds.pad(0.1));
    searchMarker.bindPopup(`Parcela ${poly.feature.properties.id}`).openPopup();
    return;
  }

  // else try point marker
  const mk = findMarkerById(id);
  if (mk) {
    const latlng = mk.getLatLng();
    if (!searchMarker) {
      searchMarker = L.marker(latlng, { title: 'Resultado búsqueda' }).addTo(map);
    } else {
      searchMarker.setLatLng(latlng);
      if (!map.hasLayer(searchMarker)) map.addLayer(searchMarker);
    }
    map.setView(latlng, 16);
    searchMarker.bindPopup(`Parcela ${id}`).openPopup();
    return;
  }

  showToast('No se encontró la parcela buscada', 'info');
}

function focusOnQueryResult(query, data) {
  if (!query || !data || data.length === 0) return;
  const q = String(query).toLowerCase().trim();
  // prefer exact code match, then ownerName contains, then name contains
  let match = data.find(d => String(d.code || '').toLowerCase() === q);
  if (!match) match = data.find(d => String(d.ownerName || '').toLowerCase().includes(q));
  if (!match) match = data.find(d => String(d.name || '').toLowerCase().includes(q));
  if (!match) match = data[0];
  focusOnPlot(match.id);
}

// auto-init
window.addEventListener('load', () => {
  initMap().catch(err => console.error('initMap', err));
});

export function updatePlot(plot) {
  // simple: re-run load for now
  loadAndRender();
}
