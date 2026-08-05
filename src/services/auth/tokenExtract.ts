/** Pulls an access token out of the shapes the backend uses. */
export function extractAccessToken(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const nested = (root.data ?? {}) as Record<string, unknown>;
  return (
    (typeof root.accessToken === "string" && root.accessToken) ||
    (typeof root.token === "string" && root.token) ||
    (typeof nested.accessToken === "string" && nested.accessToken) ||
    null
  );
}
