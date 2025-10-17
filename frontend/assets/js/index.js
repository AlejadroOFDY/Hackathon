// Archivo para renderizar parcelas del usuario en la mitad derecha

// Configuración API
const API_BASE = 'http://localhost:3000/api';

// Estado local de plots (rellenado por fetch)
let plotList = [];
// Usuario actual (si autenticado)
let currentUser = null;

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
    <div class="meta">Área: <strong>${escapeHtml(plot.area)}</strong></div>
    <div class="meta">Cultivo: <strong>${escapeHtml(plot.crop)}</strong></div>
    <div class="badge-area">
      <span class="plot-badge">ID: ${plot.id}</span>
      <span class="plot-status-badge" data-id="${plot.id}">${mapStatusToLabel(plot.status)}</span>
    </div>
    <div class="plot-actions">
      <button class="btn btn-sm btn-outline-green btn-view" data-id="${plot.id}">Ver</button>
      <button class="btn btn-sm btn-outline-secondary">Editar</button>
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

// Hook del botón refrescar — en producción podría volver a fetch
document.getElementById('refreshBtn').addEventListener('click', async ()=>{
  await fetchPlotList();
});

// Render inicial: obtener lista de parcelas del backend
fetchPlotList();

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

function updateNavbarForAuth(user){
  const nav = document.querySelector('.navbar-nav');
  if(!nav) return;
  nav.innerHTML = `
    <li class="nav-item me-2"><span class="nav-link">Hola, ${escapeHtml(user.username || user.email || 'Usuario')}</span></li>
    <li class="nav-item"><button id="logoutBtn" class="btn btn-outline-secondary">Cerrar sesión</button></li>
  `;
  const title = document.querySelector('main .d-flex h2');
  if(title) title.classList.remove('d-none');
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
}

// Ejecutar check de sesión al cargar
checkSession();

// ---------- Modal handling ----------
// Inicializar instancia del modal (Bootstrap 5)
let plotModalInstance;
document.addEventListener('DOMContentLoaded', ()=>{
  const modalEl = document.getElementById('plotModal');
  if(modalEl) plotModalInstance = new bootstrap.Modal(modalEl);
  attachViewButtons();
});

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
