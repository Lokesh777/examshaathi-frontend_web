/**
 * API base URL for browser + SSR.
 *
 * Production default is same-origin `/api`, rewritten by next.config.ts to
 * Render. That makes the HttpOnly refresh cookie first-party (not blocked).
 *
 * Local: set NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api in .env.local
 * Or use NEXT_PUBLIC_API_BASE_URL=/api with API_PROXY_TARGET=http://localhost:3000
 */
const productionApi = "/api";
const localApi = "http://localhost:3000/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "development" ? localApi : productionApi);
