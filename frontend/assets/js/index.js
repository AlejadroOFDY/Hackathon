// Archivo para renderizar parcelas del usuario en la mitad derecha

// Configuración API
const API_BASE = 'http://localhost:3000/api';

// Estado local de plots (rellenado por fetch)
let plotList = [];
// Usuario actual (si autenticado)
let currentUser = null;
// Leaflet map instance and markers
let map = null;
let markerGroup = null;

async function fetchPlotList(){
  try{
    // Intentamos obtener las parcelas del usuario autenticado
    const token = localStorage.getItem('token');
    let fetchOpts = { credentials: 'include' };
    if (token) fetchOpts.headers = { 'Authorization': 'Bearer ' + token };
    let res = await fetch(`${API_BASE}/plot/me`, fetchOpts);
    if(!res.ok){
      // Fallback a obtener todos (requiere admin)
      res = await fetch(`${API_BASE}/plot`, fetchOpts);
    }
    if(!res.ok) throw new Error('No se pudieron obtener parcelas: ' + res.status);
    const data = await res.json();
    // Si la ruta devuelve un array directamente o un objeto
    plotList = Array.isArray(data) ? data : (data.plots || data);
    renderPlotList(plotList);
    // Si el mapa ya está inicializado, actualizar marcadores
    if (map) renderPlotMarkers(plotList);
  }catch(err){
    console.error('fetchPlots error', err);
    // Mantener UI vacía
    plotList = [];
    renderPlotList(plotList);
  }
}

function createPlotCard(plot){
  const card = document.createElement('div');
  card.className = 'plot-card';
  card.innerHTML = `
    <div class="title">${escapeHtml(plot.name)}</div>
    <div class="plot-actions">
      <button class="btn btn-sm btn-outline-green btn-view" data-id="${plot.id}">Ver</button>
    </div>
  `;
  return card;
}

function renderPlotList(plots){
  const container = document.getElementById('plotContainer');
  const noPlots = document.getElementById('noPlot');
  container.innerHTML = '';

  if(!plots || plots.length === 0){
    noPlots.classList.remove('d-none');
    return;
  }

  noPlots.classList.add('d-none');
  plots.forEach(p => container.appendChild(createPlotCard(p)));
}

function escapeHtml(unsafe){
  return String(unsafe).replace(/[&<>\"]/g, function(m){
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }[m];
  });
}

// Comprobar sesión del usuario y actualizar UI
async function checkSession(){
  try{
    const token = localStorage.getItem('token');
    const opts = token ? { headers: { 'Authorization': 'Bearer ' + token }, credentials: 'include' } : { credentials: 'include' };
    const res = await fetch(`${API_BASE}/me`, opts);
    if(!res.ok) return updateNavbarForUnauth();
    const user = await res.json();
    currentUser = user;
    updateNavbarForAuth(user);
    // Si está autenticado, mostrar parcelas (ya fetchPlotList intenta /plot/me)
    await fetchPlotList();
  }catch(err){
    console.error('checkSession error', err);
    updateNavbarForUnauth();
  }
}

// --- Initialization: wait for DOM content to be ready ---
document.addEventListener('DOMContentLoaded', ()=>{
  try{
    // Hook del botón refrescar — en producción podría volver a fetch
    const refreshBtn = document.getElementById('refreshBtn');
    if(refreshBtn) refreshBtn.addEventListener('click', async ()=>{ await fetchPlotList(); });

    // Inicializar modales y botones que dependen del DOM
    const modalEl = document.getElementById('plotModal');
    if(modalEl) plotModalInstance = new bootstrap.Modal(modalEl);
    const statusEl = document.getElementById('statusModal');
    if(statusEl) statusModalInstance = new bootstrap.Modal(statusEl);
    renderStatusOptions();

    // Hacer chequeo de sesión y cargar parcelas
    checkSession();
    // También lanzar una primera carga de parcelas por si ya hay token
    fetchPlotList();
    // Inicializar mapa inmediatamente (no requiere sesión)
    try{ initMap(); } catch(e){ console.error('initMap failed', e); }
  }catch(e){
    console.error('Initialization error in index.js', e);
  }
});

function updateNavbarForAuth(user){
  const nav = document.querySelector('.navbar-nav');
  if(!nav) return;
  nav.innerHTML = `
    <li class="nav-item me-2"><span class="nav-link">Hola, ${escapeHtml(user.username || user.email || 'Usuario')}</span></li>
    <li class="nav-item"><button id="logoutBtn" class="btn btn-outline-secondary">Cerrar sesión</button></li>
  `;
  const title = document.querySelector('main .d-flex h2');
  if(title) title.classList.remove('d-none');
  // Mostrar mapa (si existe placeholder) y inicializar si es necesario
  // No condicionamos la visualización del mapa a la sesión aquí.
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn) logoutBtn.addEventListener('click', async ()=>{
    const token = localStorage.getItem('token');
    const opts = token ? { method: 'POST', headers: { 'Authorization': 'Bearer ' + token }, credentials: 'include' } : { method: 'POST', credentials: 'include' };
    await fetch(`${API_BASE}/logout`, opts);
    try { localStorage.removeItem('token'); } catch(e) { /* ignore */ }
    currentUser = null;
    updateNavbarForUnauth();
    renderPlotList([]);
  });

  // Mostrar botón de dibujar parcela
  const drawBtn = document.getElementById('drawParcelBtn');
  if(drawBtn){ drawBtn.classList.remove('d-none'); drawBtn.addEventListener('click', ()=> enableDrawMode()); }
}

function updateNavbarForUnauth(){
  const nav = document.querySelector('.navbar-nav');
  if(!nav) return;
  nav.innerHTML = `
    <li class="nav-item me-2"><a class="btn btn-outline-success" href="login.html">Iniciar sesión</a></li>
    <li class="nav-item"><a class="btn btn-success" href="register.html">Registrarse</a></li>
  `;
  const title = document.querySelector('main .d-flex h2');
  if(title) title.classList.add('d-none');
  // Hide draw button when user is not authenticated
  const drawBtn = document.getElementById('drawParcelBtn');
  if(drawBtn) drawBtn.classList.add('d-none');
  // Do not hide the map when user is unauthenticated.
}

// ---------- Modal handling ----------
// Inicializar instancia del modal (Bootstrap 5)
let plotModalInstance;

// Instancia para el modal de estado
let statusModalInstance;
const STATUS_VALUES = [
  { key: 'white', label: 'Sin sembrar' },
  { key: 'violet', label: 'Sembrado' },
  { key: 'blue', label: 'En crecimiento' },
  { key: 'yellow', label: 'Falta madurar' },
  { key: 'green', label: 'Listo para cosechar' },
  { key: 'gray', label: 'Cosechado' },
  { key: 'red', label: 'Dañado' },
];

document.addEventListener('DOMContentLoaded', ()=>{
  const statusEl = document.getElementById('statusModal');
  if(statusEl) statusModalInstance = new bootstrap.Modal(statusEl);
  renderStatusOptions();
});

function attachViewButtons(){
  document.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', (e)=>{
      const id = Number(btn.getAttribute('data-id'));
      const plot = findPlotById(id);
      if(plot) openPlotModal(plot);
    });
  });
}

function findPlotById(id){
  return plotList.find(p => p.id === id);
}

function openPlotModal(plot){
  const details = document.getElementById('plotDetails');
  if(!details) return;

  const rows = [
    ['Nombre', plot.name],
    ['Ubicación', plot.location || '-'],
    ['Tipo de cultivo', plot.cropType || plot.crop || '-'],
    ['Costo lote', plot.lotCost != null ? `${plot.lotCost}` : '-'],
    ['Área (m²)', plot.area != null ? `${plot.area}` : '-'],
    ['Estado', mapStatusToLabel(plot.status)],
    ['Latitud', plot.establishmentLat != null ? `${plot.establishmentLat}` : (plot.latitude != null ? `${plot.latitude}` : '-')],
    ['Longitud', plot.establishmentLng != null ? `${plot.establishmentLng}` : (plot.longitude != null ? `${plot.longitude}` : '-')],
  ['Fecha de siembra', plot.sowingDate || '-'],
  ['Fecha estimada de cosecha', plot.expectedHarvestDate || '-'],
  ['Fecha actual de cosecha', plot.actualHarvestDate || '-'],
    ['Plagas', plot.pests || '-'],
    ['Humedad', plot.humidity != null ? `${plot.humidity}` : '-']
  ];

  details.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'table-responsive';
  const table = document.createElement('table');
  table.className = 'table table-borderless';
  const tbody = document.createElement('tbody');

  rows.forEach(([label, value]) => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.style.width = '30%';
    th.className = 'text-muted-small';
    th.textContent = label;
    const td = document.createElement('td');
    // Si el value ya contiene HTML (badges), insertarlo sin escapar
    if (typeof value === 'string' && value.startsWith('<span')) {
      td.innerHTML = value;
      if(label === 'Estado'){
        // marcar campo status
        td.dataset.field = 'status';
        td.dataset.statusKey = plot.status;
        td.style.cursor = 'pointer';
        td.title = 'Hacer click para cambiar estado';
        td.addEventListener('click', ()=> openStatusModalForPlot(plot));
      }
    } else {
      td.innerHTML = escapeHtml(value);
    }
    tr.appendChild(th);
    tr.appendChild(td);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
  details.appendChild(container);

  // Abrir modal
  if(plotModalInstance) plotModalInstance.show();
}

function renderStatusOptions(){
  const container = document.getElementById('statusOptions');
  if(!container) return;
  container.innerHTML = '';
  STATUS_VALUES.forEach(s => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-outline-secondary btn-sm';
    btn.textContent = s.label;
    btn.dataset.statusKey = s.key;
    btn.addEventListener('click', ()=> selectStatus(s.key));
    container.appendChild(btn);
  });
}

let currentPlotForStatus = null;
function openStatusModalForPlot(plot){
  currentPlotForStatus = plot;
  if(statusModalInstance) statusModalInstance.show();
}

// ---------- Leaflet map helpers ----------
function initMap(){
  if(typeof L === 'undefined'){
    console.warn('Leaflet no está cargado');
    return;
  }
  // Crear el mapa centrado inicialmente en Formosa, Argentina (más específico)
  // Coordenadas aproximadas: lat -26.1845, lng -58.1781
  map = L.map('map', { zoomControl: true }).setView([-26.1845, -58.1781], 12);
  // Tile layer (OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  markerGroup = L.featureGroup().addTo(map);
  // Si ya hay plots cargados, renderizarlos
  if(plotList && plotList.length) renderPlotMarkers(plotList);
}

function renderPlotMarkers(plots){
  if(!map || !markerGroup) return;
  markerGroup.clearLayers();
  const bounds = [];
  plots.forEach(p => {
    const lat = p.establishmentLat ?? p.latitude ?? null;
    const lng = p.establishmentLng ?? p.longitude ?? null;
    if(lat != null && lng != null){
      const marker = L.marker([Number(lat), Number(lng)]).bindPopup(`<strong>${escapeHtml(p.name)}</strong><br/>${escapeHtml(p.location || '')}`);
      markerGroup.addLayer(marker);
      bounds.push([Number(lat), Number(lng)]);
    }
  });
  if(bounds.length) map.fitBounds(bounds, { padding: [50,50] });
}

// ---------- Draw rectangle to create parcel ----------
let drawMode = false;
let drawStartLatLng = null;
let drawRectLayer = null;

function enableDrawMode(){
  if(!map) return alert('Mapa no inicializado');
  drawMode = true;
  map.getContainer().style.cursor = 'crosshair';
  map.on('mousedown', onMapMouseDownForDraw);
  alert('Modo dibujo activado: arrastra para crear un rectángulo.');
}

function disableDrawMode(){
  drawMode = false;
  map.getContainer().style.cursor = '';
  map.off('mousedown', onMapMouseDownForDraw);
  map.off('mousemove', onMapMouseMoveForDraw);
  map.off('mouseup', onMapMouseUpForDraw);
}

function onMapMouseDownForDraw(e){
  drawStartLatLng = e.latlng;
  map.on('mousemove', onMapMouseMoveForDraw);
  map.on('mouseup', onMapMouseUpForDraw);
}

function onMapMouseMoveForDraw(e){
  if(!drawStartLatLng) return;
  const bounds = L.latLngBounds(drawStartLatLng, e.latlng);
  if(drawRectLayer) markerGroup.removeLayer(drawRectLayer);
  drawRectLayer = L.rectangle(bounds, { color: '#28a745', weight: 1, dashArray: '4' }).addTo(markerGroup);
}

function onMapMouseUpForDraw(e){
  map.off('mousemove', onMapMouseMoveForDraw);
  map.off('mouseup', onMapMouseUpForDraw);
  const bounds = L.latLngBounds(drawStartLatLng, e.latlng);
  // Show modal with center coords and bounds
  const center = bounds.getCenter();
  document.getElementById('plotLat').value = center.lat.toFixed(6);
  document.getElementById('plotLng').value = center.lng.toFixed(6);
  document.getElementById('plotBounds').value = JSON.stringify(bounds.toBBoxString());
  // Show modal
  const createModalEl = document.getElementById('createPlotModal');
  const createModal = new bootstrap.Modal(createModalEl);
  createModal.show();
  // disable draw mode
  disableDrawMode();
}

// Handler for save plot button
document.addEventListener('DOMContentLoaded', ()=>{
  const saveBtn = document.getElementById('savePlotBtn');
  if(saveBtn) saveBtn.addEventListener('click', async ()=>{
    const form = document.getElementById('createPlotForm');
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());
    // Bounds comes as a bbox string "southWest_lng,southWest_lat,northEast_lng,northEast_lat" or similar; backend can parse if needed
    // Attach user id if available
      // Ensure we DO NOT send user_id from the client. The server will assign the authenticated user.
      delete body.user_id;
      // Convert numeric fields
      if(body.area) body.area = Number(body.area);
      if(body.lotCost) body.lotCost = Number(body.lotCost);
      try{
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if(token) headers['Authorization'] = 'Bearer ' + token;
        // Use HTTP PUT to create resource per requirement
        const res = await fetch(`${API_BASE}/plot`, { method: 'PUT', headers, credentials: 'include', body: JSON.stringify(body) });
      if(!res.ok) throw new Error('Error creando parcela ' + res.status);
      const created = await res.json();
      // Close modal
      const createModalEl = document.getElementById('createPlotModal');
      const createModal = bootstrap.Modal.getInstance(createModalEl);
      if(createModal) createModal.hide();
      // Refresh
      await fetchPlotList();
        if(drawRectLayer) { markerGroup.removeLayer(drawRectLayer); drawRectLayer = null; }
      alert('Parcela creada');
    }catch(err){
      console.error('No se pudo crear parcela', err);
      alert('No se pudo crear la parcela. Revisa la consola.');
    }
  });
});

function selectStatus(statusKey){
  if(!currentPlotForStatus) return;
  const plot = plotList.find(p => p.id === currentPlotForStatus.id);
  if(!plot) return;
  // Enviar cambio al backend
  const token2 = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token2) headers['Authorization'] = 'Bearer ' + token2;
  fetch(`${API_BASE}/plot/${plot.id}`, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: JSON.stringify({ status: statusKey })
  })
  .then(async res => {
    if(!res.ok) throw new Error('Error actualizando estado ' + res.status);
    const updated = await res.json();
    // Actualizar local y re-render
    // El backend puede devolver el objeto actualizado o la instancia
    const newStatus = updated.status || statusKey;
    plot.status = newStatus;
    renderPlotList(plotList);
    if(plotModalInstance) plotModalInstance.show();
  })
  .catch(err => {
    console.error('No se pudo actualizar el estado', err);
    // Mostrar error básico
    alert('No se pudo guardar el estado. Revisa la consola.');
  })
  .finally(()=>{
    if(statusModalInstance) statusModalInstance.hide();
  });
}

function mapStatusToLabel(status){
  const map = {
    white: '<span class="badge bg-secondary">Sin sembrar</span>',
    violet: '<span class="badge" style="background:#7f5bd9">Sembrado</span>',
    blue: '<span class="badge bg-info text-dark">En crecimiento</span>',
    yellow: '<span class="badge bg-warning text-dark">Falta madurar</span>',
    green: '<span class="badge bg-success">Listo para cosechar</span>',
    gray: '<span class="badge bg-dark">Cosechado</span>',
    red: '<span class="badge bg-danger">Dañado</span>',
  };
  return map[status] || '<span class="badge bg-light text-dark">-</span>';
}

// Re-attach view buttons cada vez que se renderizan las tarjetas
const originalRenderPlotList = renderPlotList;
renderPlotList = function(plots){
  originalRenderPlotList(plots);
  attachViewButtons();
  attachStatusBadgeHandlers();
};

function attachStatusBadgeHandlers(){
  document.querySelectorAll('.plot-status-badge').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', ()=>{
      const id = Number(el.dataset.id);
      const plot = findPlotById(id);
      if(plot) openStatusModalForPlot(plot);
    });
  });
}

/*
Ejemplo para obtener parcelas reales desde el backend:

fetch('/api/plot', { credentials: 'include' })
  .then(r => r.json())
  .then(data => renderPlotList(data || []))
  .catch(err => { console.error(err); renderPlotList([]); });
*/
