import { registerUser, loginUser, createPlot } from './api.js';
import { enableParcelSelect, disableParcelSelect } from './map.js';
import { showToast } from './ui.js';

let selectedLatLng = null;

// open modal if needed from elsewhere
const authModalEl = document.getElementById('authModal');
let authModal = null;
if (authModalEl) authModal = new bootstrap.Modal(authModalEl);

// when register tab is shown, enable parcel selection
const registerTab = document.getElementById('register-tab');
if (registerTab) {
  registerTab.addEventListener('shown.bs.tab', () => {
    showToast('Haga click en el mapa para indicar el centro de su parcela', 'info', 4000);
    enableParcelSelect((latlng) => {
      selectedLatLng = latlng;
      showToast(`Parcela seleccionada: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`, 'info', 4000);
    });
  });
  registerTab.addEventListener('hidden.bs.tab', () => {
    disableParcelSelect();
  });
}

// form handlers
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    try {
      await loginUser({ username, password });
      showToast('Login exitoso', 'success');
      if (authModal) authModal.hide();
    } catch (err) {
      showToast('Error login: ' + err.message, 'danger');
    }
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const password = document.getElementById('regPassword').value;
    const cropType = document.getElementById('regCropType').value;

    if (!selectedLatLng) {
      showToast('Marque la parcela en el mapa antes de registrar', 'warning');
      return;
    }

    try {
      await registerUser({ username, email, password, role: 'user', first_name: firstName, last_name: lastName });
      showToast('Usuario registrado', 'success');
      // create the plot
      const location = { type: 'Point', coordinates: [selectedLatLng.lng, selectedLatLng.lat] };
      await createPlot({ name: `${username}- parcela`, location, cropType, area: 1.0, ownerId: null, status: 'blue', sowingDate: new Date().toISOString().slice(0,10), expectedHarvestDate: new Date().toISOString().slice(0,10) });
      showToast('Parcela registrada (mock)', 'success');
      disableParcelSelect();
      if (authModal) authModal.hide();
    } catch (err) {
      showToast('Error en registro: ' + err.message, 'danger');
    }
  });
}

// Expose modal open for convenience
export function openAuth() {
  if (authModal) authModal.show();
}

// Attach a button in navbar to open auth modal
const navBrand = document.querySelector('.navbar-brand');
if (navBrand) {
  const btn = document.createElement('button');
  btn.className = 'btn btn-link';
  btn.textContent = 'Login/Register';
  btn.addEventListener('click', () => openAuth());
  document.querySelector('.navbar .container-fluid').appendChild(btn);
}
