// Reusable client for the RoboCare FastAPI backend.
// Only the public API base URL lives in the browser bundle. Database and AI provider keys never do.

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1").replace(
  /\/$/,
  "",
);

export type FieldError = { field: string; message: string };

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: FieldError[];

  constructor(status: number, code: string, message: string, details: FieldError[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type Envelope<T> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: FieldError[] };
};

const NETWORK_MESSAGE = "We couldn't reach the booking service. Check your connection and try again.";

// Sent on every state-changing request. The backend requires it (cross-site forms cannot set custom headers).
export const CSRF_HEADERS = { "X-RoboCare-Request": "1" } as const;

export type PageMeta = { page: number; page_size: number; total: number };

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await apiEnvelope<T>(path, init);
  return data;
}

export async function apiEnvelope<T>(path: string, init: RequestInit = {}): Promise<{ data: T; meta?: PageMeta }> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      // Send the admin session cookie. Same-site (localhost), so the browser attaches it.
      credentials: "include",
      headers: { Accept: "application/json", ...(init.headers ?? {}) },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", NETWORK_MESSAGE);
  }

  let body: Envelope<T> | null = null;
  try {
    body = (await response.json()) as Envelope<T>;
  } catch {
    body = null;
  }

  if (!response.ok || !body || body.success !== true) {
    const code = body?.error?.code ?? (response.status >= 500 ? "SERVER_ERROR" : "HTTP_ERROR");
    const message =
      body?.error?.message ??
      (response.status >= 500
        ? "Something went wrong on our side. Please try again shortly."
        : "The request could not be completed.");
    throw new ApiError(response.status, code, message, body?.error?.details ?? []);
  }
  return { data: body.data as T, meta: (body as { meta?: PageMeta }).meta };
}

export function getJson<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "GET" });
}

export function postJson<T>(path: string, payload: unknown, headers: Record<string, string> = {}): Promise<T> {
  return apiRequest<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...CSRF_HEADERS, ...headers },
    body: JSON.stringify(payload),
  });
}

export function patchJson<T>(path: string, payload: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...CSRF_HEADERS },
    body: JSON.stringify(payload),
  });
}

export function postForm<T>(path: string, form: FormData): Promise<T> {
  // No Content-Type header: the browser sets the multipart boundary itself.
  return apiRequest<T>(path, { method: "POST", body: form, headers: { ...CSRF_HEADERS } });
}

export function postEmpty<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "POST", headers: { ...CSRF_HEADERS } });
}
