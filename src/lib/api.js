/**
 * Thin API client — all calls to our Vercel API routes go through here.
 * Automatically injects the JWT token from localStorage.
 */

const BASE = '/api';

function getToken() {
  try {
    const session = JSON.parse(localStorage.getItem('ams_session_v1') || 'null');
    return session?.token ?? null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  /** POST /api/auth/login */
  async login(email, password) {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  /** GET /api/users */
  async getUsers() {
    const res = await fetch(`${BASE}/users`, { headers: authHeaders() });
    return handleResponse(res);
  },

  /** POST /api/users/create */
  async createUser(data) {
    const res = await fetch(`${BASE}/users/create`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  /** PUT /api/users/:id */
  async updateUser(id, data) {
    const res = await fetch(`${BASE}/users/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  /** DELETE /api/users/:id */
  async deleteUser(id) {
    const res = await fetch(`${BASE}/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  /** GET /api/routines */
  async getRoutines() {
    const res = await fetch(`${BASE}/routines`, { headers: authHeaders() });
    return handleResponse(res);
  },

  /** POST /api/routines */
  async createRoutine(data) {
    const res = await fetch(`${BASE}/routines`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },
};
