export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
async function decode<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const fallback =
      response.status === 401
        ? "Please sign in to continue."
        : response.status === 403
          ? "Access denied or security token expired. Refresh and try again."
          : "The request could not be completed. Please try again.";
    throw new ApiError(response.status, data.message || fallback);
  }
  if (response.status === 204) return undefined as T;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("application/json"))
    throw new ApiError(
      502,
      "The API returned an unexpected response. Check the backend connection.",
    );
  return response.json() as Promise<T>;
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !(init.body instanceof URLSearchParams)
  )
    headers.set("Content-Type", "application/json");
  if (
    init.method &&
    !["GET", "HEAD", "OPTIONS"].includes(init.method.toUpperCase())
  ) {
    // Fetch a fresh masked token before every mutation, including login and logout.
    const csrf = await decode<{ token: string; headerName: string }>(
      await fetch("/api/auth/csrf", {
        credentials: "same-origin",
        cache: "no-store",
      }),
    );
    headers.set(csrf.headerName, csrf.token);
  }
  try {
    return await decode<T>(
      await fetch(`/api${path}`, {
        ...init,
        headers,
        credentials: "same-origin",
        cache: "no-store",
      }),
    );
  } catch (error) {
    if (
      error instanceof ApiError ||
      (error instanceof DOMException && error.name === "AbortError")
    )
      throw error;
    throw new Error(
      "Cannot connect to the server. Please check your connection and try again.",
    );
  }
}
export const json = (method: string, body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});
