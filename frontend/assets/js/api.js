import { BASE_API, FETCH_TIMEOUT, USE_MOCK } from './config.js';

const timeoutFetch = async (resource, options = {}) => {
  const { timeout = FETCH_TIMEOUT } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

export async function fetchPlots(params = {}) {
  if (USE_MOCK) {
    const r = await fetch('/frontend/mock-data/plots.json');
    return r.json();
  }
  const url = new URL(BASE_API + '/plots');
  Object.keys(params).forEach(k => {
    if (params[k] !== undefined && params[k] !== null) url.searchParams.append(k, params[k]);
  });
  const res = await timeoutFetch(url.toString(), { headers: { 'Accept': 'application/json' }, credentials: 'include' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fetchPlots: ${res.status} ${text}`);
  }
  return res.json();
}

export async function fetchPlotById(id) {
  if (USE_MOCK) {
    const r = await fetch('/frontend/mock-data/plots.json');
    const json = await r.json();
    return json.data.find(p => p.id === Number(id));
  }
  const res = await timeoutFetch(`${BASE_API}/plots/${id}`, { headers: { 'Accept': 'application/json' }, credentials: 'include' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fetchPlotById: ${res.status} ${text}`);
  }
  return res.json();
}

export async function registerUser(body) {
  if (USE_MOCK) {
    // naive mock: succeed
    return { message: 'Usuario creado (mock)' };
  }
  const res = await timeoutFetch(`${BASE_API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function loginUser(body) {
  if (USE_MOCK) {
    return { message: 'Login mock' };
  }
  const res = await timeoutFetch(`${BASE_API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createPlot(body) {
  if (USE_MOCK) {
    return { message: 'Plot created (mock)' };
  }
  const res = await timeoutFetch(`${BASE_API}/plots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include'
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
