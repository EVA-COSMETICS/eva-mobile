// Web sitesindeki /api/v1 uçlarına istek atan küçük yardımcı.
// Adres .env dosyasındaki EXPO_PUBLIC_API_URL'den gelir (ör. https://evacosmetics.onrender.com)

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export type FieldErrors = Partial<Record<string, string>>;

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public fieldErrors?: FieldErrors
  ) {
    super(code);
  }
}

type Options = { method?: "GET" | "POST"; body?: unknown; token?: string | null; timeoutMs?: number };

export async function api<T>(path: string, { method = "GET", body, token, timeoutMs = 30000 }: Options = {}): Promise<T> {
  if (!API_URL) throw new ApiError(0, "config");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(0, "network"); // internet yok, sunucu uyuyor ya da zaman aşımı
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? "server", data.fieldErrors);
  return data as T;
}