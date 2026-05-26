/**
 * lib/api.ts
 * Typed fetch wrapper — throws on non-2xx so TanStack Query
 * treats failures as errors and keeps `data` as undefined (not a stale object).
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      if (typeof body?.error === "string") message = body.error
    } catch {}
    throw new ApiError(res.status, message)
  }
  return res.json() as Promise<T>
}
