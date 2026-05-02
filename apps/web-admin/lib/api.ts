const isBrowser = typeof window !== 'undefined';
const defaultApiUrl = isBrowser ? `http://${window.location.hostname}:3000/api` : 'http://127.0.0.1:3000/api';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...restOptions } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((customHeaders as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...restOptions, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error del servidor' }));
    throw new Error(error.message || `Error ${res.status}`);
  }
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text);
}

export async function login(email: string, password: string) {
  return fetchAPI<{ access_token: string; user: { id: string; email: string; name: string; role: string } }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name: string, email: string, password: string) {
  return fetchAPI<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function getEvents(token: string) {
  return fetchAPI<any[]>('/events', { token, cache: 'no-store' });
}

export async function getEventById(id: string, token: string) {
  return fetchAPI<any>(`/events/${id}`, { token, cache: 'no-store' });
}

export async function createEvent(data: any, token: string) {
  return fetchAPI<any>('/events', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export async function uploadImage(file: File, token: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error uploading image' }));
    throw new Error(error.message || 'Error uploading image');
  }

  const data = await res.json();
  return data.url;
}

export async function updateEvent(id: string, data: any, token: string) {
  return fetchAPI<any>(`/events/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteEvent(id: string, token: string) {
  return fetchAPI<any>(`/events/${id}`, {
    method: 'DELETE',
    token,
  });
}

// Admin Integrations

export async function getOrganizers(token: string) {
  return fetchAPI<any[]>('/admin/organizers', { token, cache: 'no-store' });
}

export async function createOrganizer(data: any, token: string) {
  return fetchAPI<any>('/admin/organizers', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export async function setOrganizerStatus(id: string, status: string, token: string) {
  return fetchAPI<any>(`/admin/organizers/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    token,
  });
}

export async function updateOrganizer(id: string, data: any, token: string) {
  return fetchAPI<any>(`/admin/organizers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteOrganizer(id: string, token: string) {
  return fetchAPI<any>(`/admin/organizers/${id}`, {
    method: 'DELETE',
    token,
  });
}

// Plans Integration

export async function getPlans(token: string) {
  return fetchAPI<any[]>('/admin/plans', { token, cache: 'no-store' });
}

export async function createPlan(data: any, token: string) {
  return fetchAPI<any>('/admin/plans', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export async function updatePlan(id: string, data: any, token: string) {
  return fetchAPI<any>(`/admin/plans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  });
}

export async function deletePlan(id: string, token: string) {
  return fetchAPI<any>(`/admin/plans/${id}`, {
    method: 'DELETE',
    token,
  });
}
