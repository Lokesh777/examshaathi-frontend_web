// Centralised console logging for API calls — disabled in production builds.
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

const ENABLED =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_DEBUG_API === "true";

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
  if (!ENABLED) return;
  const label = `[API ${ICON[phase]}] ${(method ?? "GET").toUpperCase()} ${url ?? ""}`;
  /* eslint-disable no-console */
  console.groupCollapsed(`%c${label}`, STYLE[phase]);
  for (const [key, value] of Object.entries(details)) {
    // Never dump passwords / OTP bodies even in dev
    if (key === "body" && value && typeof value === "object") {
      const scrubbed = { ...(value as Record<string, unknown>) };
      for (const secret of ["password", "newPassword", "otp", "token", "refreshToken"]) {
        if (secret in scrubbed) scrubbed[secret] = "[redacted]";
      }
      console.log(`${key}:`, scrubbed);
      continue;
    }
    console.log(`${key}:`, value);
  }
  console.groupEnd();
  /* eslint-enable no-console */
}
