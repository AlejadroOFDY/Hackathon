import { POLL_INTERVAL } from './config.js';
import { fetchPlots } from './api.js';
import { updatePlot } from './map.js';

let pollingId = null;

export function startPolling() {
  if (pollingId) return;
  pollingId = setInterval(async () => {
    try {
      const res = await fetchPlots();
      const data = res.data || res;
      // naive: trigger update for each changed plot (in real case compare)
      data.forEach(p => updatePlot(p));
    } catch (err) {
      console.error('Polling error', err);
    }
  }, POLL_INTERVAL);
}

export function stopPolling() {
  if (!pollingId) return;
  clearInterval(pollingId);
  pollingId = null;
}

// start by default
window.addEventListener('load', () => startPolling());
