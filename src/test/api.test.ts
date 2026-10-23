import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, json } from "../api";
const response = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
afterEach(() => vi.unstubAllGlobals());
describe("session API client", () => {
  it("fetches a fresh CSRF token and includes session credentials for a mutation", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        response({ token: "masked-token", headerName: "X-CSRF-TOKEN" }),
      )
      .mockResolvedValueOnce(response({ name: "Updated" }));
    vi.stubGlobal("fetch", fetch);
    await expect(
      api("/profile", json("PUT", { name: "Updated" })),
    ).resolves.toEqual({ name: "Updated" });
    expect(fetch.mock.calls[0][0]).toBe("/api/auth/csrf");
    const options = fetch.mock.calls[1][1];
    expect(options.credentials).toBe("same-origin");
    expect(options.headers.get("X-CSRF-TOKEN")).toBe("masked-token");
    expect(options.headers.get("Content-Type")).toBe("application/json");
  });
  it("does not set a content type for multipart upload boundaries", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        response({ token: "token", headerName: "X-CSRF-TOKEN" }),
      )
      .mockResolvedValueOnce(response({ eventId: 1 }));
    vi.stubGlobal("fetch", fetch);
    await api("/events", { method: "POST", body: new FormData() });
    expect(fetch.mock.calls[1][1].headers.has("Content-Type")).toBe(false);
  });
  it("accepts empty login/logout responses and never retries mutations automatically", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        response({ token: "token", headerName: "X-CSRF-TOKEN" }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetch);
    await expect(
      api("/auth/logout", { method: "POST" }),
    ).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("surfaces server validation and rejects redirected HTML", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          response({ message: "Not enough tickets available." }, 409),
        ),
    );
    await expect(api("/events/1")).rejects.toMatchObject({
      status: 409,
      message: "Not enough tickets available.",
    });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("<html>login</html>", {
            headers: { "Content-Type": "text/html" },
          }),
        ),
    );
    await expect(api("/events/1")).rejects.toBeInstanceOf(ApiError);
  });
});
