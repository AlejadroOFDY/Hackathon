/* Hotspot map for crop parcels - vanilla JS */
(function(){
  const API_BASE = 'http://localhost:3000/api';
  const mapContainer = document.getElementById('parcelMap');
  const detailsPanel = document.getElementById('parcelDetails');
  const detailsTitle = document.getElementById('detailsTitle');
  const detailsBody = document.getElementById('detailsBody');

  // Simple utility to format dates yyyy-mm-dd -> dd/mm/yyyy
  const fmt = (d)=>{
    if(!d) return '-';
    const [y,m,day] = String(d).split('-');
    if(!y||!m||!day) return d;
    return `${day}/${m}/${y}`;
  };

  // Seed demo when backend is not available
  const demoParcels = Array.from({length: 120}).map((_,i)=>{
    const statuses = ['white','violet','blue','yellow','green','gray','red'];
    const cropTypes = ['Trigo','Maíz','Soja','Girasol','Cebada'];
    const status = statuses[Math.floor(Math.random()*statuses.length)];
    const crop = cropTypes[Math.floor(Math.random()*cropTypes.length)];
    const today = new Date();
    const seed = new Date(today.getFullYear(), today.getMonth()-Math.floor(Math.random()*4), 1+Math.floor(Math.random()*28));
    const exp = new Date(seed); exp.setMonth(exp.getMonth()+4);
    return {
      id: i+1,
      name: `Lote ${i+1}`,
      owner: { username: ['Alicia','Bruno','Carla','Diego'][i%4] },
      cropType: crop,
      status,
      area: +(2 + Math.random()*8).toFixed(1),
      sowingDate: seed.toISOString().slice(0,10),
      expectedHarvestDate: exp.toISOString().slice(0,10),
      actualHarvestDate: null,
      pests: Math.random() < 0.15 ? 'Oruga bolillera' : '',
      humidity: +(20+Math.random()*60).toFixed(0)
    };
  });

  async function fetchParcels(){
    try{
      const res = await fetch(`${API_BASE}/plot`,{ credentials:'include' });
      if(!res.ok) throw new Error('No autorizado o backend caído');
      const data = await res.json();
      return Array.isArray(data) ? data : demoParcels;
    }catch(err){
      console.warn('Usando datos demo:', err.message);
      return demoParcels;
    }
  }

  function renderGrid(parcels){
    // Calculate grid size heuristically
    const cols = 16; // fixed for now; could be dynamic
    const rows = Math.ceil(parcels.length / cols);
    mapContainer.style.setProperty('--cols', String(cols));
    mapContainer.style.setProperty('--rows', String(rows));
    mapContainer.innerHTML = '';

    parcels.forEach((p)=>{
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = `parcel ${p.status || 'white'}`;
      tile.dataset.name = p.name;
      tile.setAttribute('aria-label', `${p.name} • ${p.cropType} • ${p.status}`);
      tile.innerHTML = `<span class="chip">${p.area ?? '-'} ha</span>`;
      tile.addEventListener('click', ()=>showDetails(p));
      mapContainer.appendChild(tile);
    });
  }

  function badge(color, text){
    return `<span style="display:inline-flex;align-items:center;gap:.4rem;background:${color};color:#0b1120;font-weight:700;padding:.2rem .5rem;border-radius:999px">${text}</span>`;
  }

  const statusName = {
    white:'Sin sembrar',
    violet:'Sembrado',
    blue:'En crecimiento',
    yellow:'Falta madurar',
    green:'Listo para cosechar',
    gray:'Cosechado',
    red:'Dañado'
  };

  const statusColor = {
    white:'#ffffff', violet:'#8b5cf6', blue:'#3b82f6',
    yellow:'#eab308', green:'#22c55e', gray:'#6b7280', red:'#ef4444'
  };

  function showDetails(p){
    detailsTitle.textContent = `${p.name} — ${p.cropType || ''}`.trim();
    const ownerName = p.owner?.username || p.owner?.email || p.user?.username || '—';
    const sName = statusName[p.status] || p.status || '—';
    const sColor = statusColor[p.status] || '#fff';

    detailsBody.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr;gap:.75rem">
        <div>${badge(sColor, sName)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">
          <div><strong>Dueño</strong><br>${ownerName}</div>
          <div><strong>Área</strong><br>${p.area ?? '-'} ha</div>
          <div><strong>Siembra</strong><br>${fmt(p.sowingDate)}</div>
          <div><strong>Cosecha esperada</strong><br>${fmt(p.expectedHarvestDate)}</div>
          <div><strong>Cosecha real</strong><br>${fmt(p.actualHarvestDate)}</div>
          <div><strong>Humedad</strong><br>${p.humidity ?? '-'}%</div>
        </div>
        ${p.pests ? `<div><strong>Plagas</strong><br>${p.pests}</div>`: ''}
        ${p.damageDescription ? `<div><strong>Daños</strong><br>${p.damageDescription}</div>`: ''}
      </div>
    `;
  }

  // Boot
  fetchParcels().then(renderGrid);
})();
