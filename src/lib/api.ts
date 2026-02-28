const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "ph_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isGet = !options.method || options.method === "GET";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(isGet ? { "Cache-Control": "no-cache", "Pragma": "no-cache" } : {}),
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers, cache: isGet ? "no-store" : "default" });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

// For FormData uploads — does NOT set Content-Type (let browser set multipart boundary)
async function requestForm<T>(path: string, formData: FormData, method: "POST" | "PATCH" = "POST"): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    body: formData,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || `Request failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  postForm:  <T>(path: string, formData: FormData) => requestForm<T>(path, formData, "POST"),
  patchForm: <T>(path: string, formData: FormData) => requestForm<T>(path, formData, "PATCH"),
};
