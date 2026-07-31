// Centralised console logging for every API call. Grouped, colour-coded and
// always includes the Authorization state so auth bugs are easy to spot.
export type ApiPhase = "request" | "success" | "error";

const STYLE: Record<ApiPhase, string> = {
  request: "color:#2563eb;font-weight:bold",
  success: "color:#16a34a;font-weight:bold",
  error: "color:#dc2626;font-weight:bold",
};

const ICON: Record<ApiPhase, string> = {
  request: "→",
  success: "✓",
  error: "✗",
};

export function maskToken(token?: string | null): string {
  if (!token) return "MISSING";
  return `${token.slice(0, 16)}…${token.slice(-6)} (len ${token.length})`;
}

export function logApi(
  phase: ApiPhase,
  method: string | undefined,
  url: string | undefined,
  details: Record<string, unknown>,
) {
  const label = `[API ${ICON[phase]}] ${(method ?? "GET").toUpperCase()} ${url ?? ""}`;
  /* eslint-disable no-console */
  console.groupCollapsed(`%c${label}`, STYLE[phase]);
  for (const [key, value] of Object.entries(details)) {
    console.log(`${key}:`, value);
  }
  console.groupEnd();
  /* eslint-enable no-console */
}