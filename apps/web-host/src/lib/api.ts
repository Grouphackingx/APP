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

export async function registerHost(data: any) {
  return fetchAPI<{ access_token: string; user: any }>('/auth/register-host', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getEvents(token: string) {
  return fetchAPI<any[]>('/events/me', { token, cache: 'no-store' });
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

export async function uploadImage(file: File, token: string, type?: 'logo' | 'event' | 'user-avatar', eventId?: string, organizerId?: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  let url = `${API_BASE}/upload`;
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (eventId) params.append('eventId', eventId);
  if (organizerId) params.append('organizerId', organizerId);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
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

export async function getPublicPlans() {
  return fetchAPI<any[]>('/plans', { cache: 'no-store' });
}

export async function getAttendees(token: string) {
  return fetchAPI<any[]>('/orders/attendees/me', { token, cache: 'no-store' });
}

type TicketValidationResult = {
  valid: boolean;
  message: string;
  ticket: { id: string; zone: string; seat: string | number | null; holderName: string; scannedAt: string };
};

export async function validateTicket(qrToken: string, authToken: string) {
  return fetchAPI<TicketValidationResult>('/tickets/validate', {
    method: 'POST',
    body: JSON.stringify({ token: qrToken }),
    token: authToken,
  });
}

export async function validateTicketById(ticketId: string, authToken: string) {
  return fetchAPI<TicketValidationResult>('/tickets/validate-by-id', {
    method: 'POST',
    body: JSON.stringify({ ticketId }),
    token: authToken,
  });
}

export type OrganizerMember = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  memberRole: 'ADMIN' | 'STAFF';
  createdAt: string;
};

export async function uploadMemberAvatar(file: File, memberId: string, token: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const url = `${API_BASE}/upload?type=member-avatar&memberId=${memberId}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al subir imagen' }));
    throw new Error(error.message || 'Error al subir imagen');
  }
  const data = await res.json();
  return data.url;
}

export async function getOrganizerMembers(token: string) {
  return fetchAPI<OrganizerMember[]>('/organizer-members', { token, cache: 'no-store' });
}

export async function createOrganizerMember(data: { name: string; email: string; password: string; memberRole: 'ADMIN' | 'STAFF' }, token: string) {
  return fetchAPI<OrganizerMember>('/organizer-members', { method: 'POST', body: JSON.stringify(data), token });
}

export async function updateOrganizerMember(id: string, data: { name?: string; memberRole?: 'ADMIN' | 'STAFF'; password?: string }, token: string) {
  return fetchAPI<OrganizerMember>(`/organizer-members/${id}`, { method: 'PATCH', body: JSON.stringify(data), token });
}

export async function deleteOrganizerMember(id: string, token: string) {
  return fetchAPI<{ message: string }>(`/organizer-members/${id}`, { method: 'DELETE', token });
}

export async function getMyOrganizerProfile(token: string) {
  return fetchAPI<any>('/auth/me/organizer', { token, cache: 'no-store' });
}

export async function updateMyBasicInfo(data: { name?: string; email?: string; phone?: string; avatarUrl?: string }, token: string) {
  return fetchAPI<any>('/auth/me/basic', { method: 'PATCH', body: JSON.stringify(data), token });
}

export async function changeMyPassword(currentPassword: string, newPassword: string, token: string) {
  return fetchAPI<{ message: string }>('/auth/me/password', {
    method: 'PATCH', body: JSON.stringify({ currentPassword, newPassword }), token,
  });
}

export async function updateMyOrganizerProfileInfo(data: {
  organizationName?: string; organizationDescription?: string;
  organizationLogo?: string; address?: string; province?: string; city?: string;
}, token: string) {
  return fetchAPI<any>('/auth/me/organizer-profile', { method: 'PATCH', body: JSON.stringify(data), token });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return fetchAPI('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  return fetchAPI('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
}
