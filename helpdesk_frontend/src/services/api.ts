import type {
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  Ticket,
  CreateTicketPayload,
  UpdateTicketStatusPayload,
} from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

function getToken(): string | null {
  return localStorage.getItem('helpdesk_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    let message = `Request failed: ${res.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      message = parsed.message ?? parsed.error ?? message;
    } catch {
      // not json
    }
    throw new Error(message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (payload: LoginPayload) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  register: (payload: RegisterPayload) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// ─── Tickets ─────────────────────────────────────────────────────────────────

export const ticketsApi = {
  getAll: () => request<Ticket[]>('/api/tickets'),

  getById: (id: number) => request<Ticket>(`/api/tickets/${id}`),

  create: (payload: CreateTicketPayload) =>
    request<Ticket>('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateStatus: (id: number, payload: UpdateTicketStatusPayload) =>
    request<Ticket>(`/api/tickets/${id}/status?status=${payload.status}`, {
      method: 'PUT',
    }),

  delete: (id: number) =>
    request<void>(`/api/tickets/${id}`, { method: 'DELETE' }),
};
