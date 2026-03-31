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

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...restOptions,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error del servidor' }));
    throw new Error(error.message || `Error ${res.status}`);
  }

  // Handle empty responses (204, etc.)
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text);
}

// ===== Auth API =====
export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return fetchAPI<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name: string, email: string, password: string): Promise<RegisterResponse> {
  return fetchAPI<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

// ===== Events API =====
export interface Zone {
  id: string;
  name: string;
  description?: string;
  price: string | number;
  capacity: number;
  isReservedSeating: boolean;
  seats?: Seat[];
}

export interface Seat {
  id: string;
  row: string | null;
  number: string | null;
  isSold: boolean;
}

export interface EventOrganizer {
  name: string;
  email: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  province?: string | null;
  city?: string | null;
  imageUrl: string | null;
  seatingMapImageUrl?: string | null;
  hasSeatingChart?: boolean;
  mapUrl?: string | null;
  videoUrl?: string | null;
  galleryUrls?: string[];
  status: string;
  organizerId: string;
  organizer?: EventOrganizer;
  zones: Zone[];
  createdAt: string;
}

export async function getEvents(query?: string): Promise<EventItem[]> {
  const url = query ? `/events?q=${encodeURIComponent(query)}` : '/events';
  return fetchAPI<EventItem[]>(url, { cache: 'no-store' });
}

export async function getEventById(id: string): Promise<EventItem> {
  return fetchAPI<EventItem>(`/events/${id}`, { cache: 'no-store' });
}

export async function createEvent(data: any, token: string): Promise<EventItem> {
  return fetchAPI<EventItem>('/events', {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

// ===== Orders API =====
export interface LockSeatsResponse {
  locked: boolean;
  seatIds: string[];
  expiresInSeconds: number;
  message: string;
}

export interface TicketInfo {
  id: string;
  qrCodeToken: string;
  status: string;
}

export interface PurchaseResponse {
  orderId: string;
  totalAmount: number;
  status: string;
  ticketCount: number;
  tickets: TicketInfo[];
}

export async function lockSeats(eventId: string, seatIds: string[], token: string): Promise<LockSeatsResponse> {
  return fetchAPI<LockSeatsResponse>('/orders/lock-seats', {
    method: 'POST',
    body: JSON.stringify({ eventId, seatIds }),
    token,
  });
}

export async function unlockSeats(eventId: string, seatIds: string[], token: string): Promise<any> {
  return fetchAPI('/orders/unlock-seats', {
    method: 'POST',
    body: JSON.stringify({ eventId, seatIds }),
    token,
  });
}

export async function purchaseTickets(eventId: string, seatIds: string[], token: string): Promise<PurchaseResponse> {
  return fetchAPI<PurchaseResponse>('/orders/purchase', {
    method: 'POST',
    body: JSON.stringify({ eventId, seatIds }),
    token,
  });
}

export async function getUserOrders(token: string) {
  return fetchAPI<any[]>('/orders', { token });
}

