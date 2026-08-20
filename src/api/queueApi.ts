// Requests go through the Vite dev-server proxy (/api -> VITE_API_TARGET),
// so the browser never needs to reach the backend directly. This works both
// for local dev (localhost:8080) and the Bolt preview (a public tunnel URL).
const BASE_URL = 'https://proactive-adventure-production-d3d4.up.railway.app';

// ---- Backend model shapes (Spring Boot) ----

export type TokenUser = {
  id: number;
  name: string;
  phoneNumber: string;
};

export type TokenCounter = {
  id: number;
  counterNumber: number;
} | null;

export type Token = {
  id: number;
  tokenNumber: number | string;
  status: string;
  createdAt: string;
  estimatedWaitTimeInMins: number;
  user: TokenUser;
  counter: TokenCounter;
};

export type LiveQueueResponse = {
  pendingCustomers: number;
  servingTokens: Token[];
};

export type TokenRequest = {
  name: string;
  phoneNumber: string;
};

// ---- API helpers ----

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) {
        message = body.message;
      } else if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        // Spring Boot validation errors come back as { field: "message" }
        const firstField = Object.keys(body)[0];
        if (firstField) message = body[firstField];
      }
    } catch {
      // No JSON body — keep default message
    }
    throw new Error(message);
  }

  // Some endpoints may return 200 with an empty body
  const text = await res.text();
  if (!text) return null as T;
  return JSON.parse(text) as T;
}

export function generateToken(data: TokenRequest): Promise<Token> {
  return request<Token>('/api/queue/generate', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getLiveStatus(): Promise<LiveQueueResponse> {
  return request<LiveQueueResponse>('/api/queue/live-status', {
    method: 'GET',
  });
}

export async function callNextCustomer(counterId: number): Promise<Token | null> {
  const res = await request<Record<string, unknown> | Token>(
    `/api/queue/next/${counterId}`,
    { method: 'PUT' }
  );
  // Backend returns { message: "No Pending Customers" } when the queue is empty
  if (res && typeof res === 'object' && 'message' in res && !('tokenNumber' in res)) {
    return null;
  }
  return res as Token;
}
