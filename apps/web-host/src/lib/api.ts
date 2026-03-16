const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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
  return fetchAPI<any[]>('/events', { token });
}

export async function getEventById(id: string, token: string) {
  return fetchAPI<any>(`/events/${id}`, { token });
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
