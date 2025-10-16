export function showToast(message, type = 'info', timeout = 8000) {
  const container = document.getElementById('toastContainer');
  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center text-bg-light border';
  toastEl.setAttribute('role','alert');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>`;
  container.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: timeout });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

export function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
}
export function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
}

export function populateSidebar(plot) {
  const title = document.getElementById('plotName');
  const details = document.getElementById('plotDetails');
  title.textContent = `${plot.name || plot.code || 'Parcela'}`;
  const lastSensor = plot.lastSensor ? `<p><strong>Última lectura:</strong> ${plot.lastSensor.timestamp} - T:${plot.lastSensor.temp}°C H:${plot.lastSensor.humidity}%</p>` : '';
  details.innerHTML = `
    <p><strong>Dueño:</strong> ${plot.ownerName || 'N/A'}</p>
    <p><strong>Cultivo:</strong> ${plot.cropType || 'N/A'}</p>
    <p><strong>Estado:</strong> ${plot.status || 'N/A'}</p>
    <p><strong>Siembra:</strong> ${plot.sowingDate || 'N/A'}</p>
    <p><strong>Cosecha estimada:</strong> ${plot.expectedHarvestDate || 'N/A'}</p>
    ${lastSensor}
    <p><strong>Notas:</strong> ${plot.notes || ''}</p>
    <button id="viewHistory" class="btn btn-sm btn-outline-secondary">Ver historial</button>
  `;
}

// sidebar close handler
const closeBtn = document.getElementById('closeSidebar');
if (closeBtn) closeBtn.addEventListener('click', () => closeSidebar());

// refresh button hookup
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) refreshBtn.addEventListener('click', () => location.reload());

// search box debounce
const searchBox = document.getElementById('searchBox');
let searchTimer = null;
if (searchBox) {
  // debounce for input typing
  searchBox.addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      const evt = new CustomEvent('map:search', { detail: { q: e.target.value } });
      window.dispatchEvent(evt);
    }, 300);
  });
  // Enter key triggers immediate search
  searchBox.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(searchTimer);
      const evt = new CustomEvent('map:search', { detail: { q: e.target.value } });
      window.dispatchEvent(evt);
    }
  });
  // search button
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      clearTimeout(searchTimer);
      const q = searchBox.value;
      const evt = new CustomEvent('map:search', { detail: { q } });
      window.dispatchEvent(evt);
    });
  }
}
