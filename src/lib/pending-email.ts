// Remembers the email a pending OTP was sent to, so verify/reset screens still
// work after a page reload (search params can be lost) — sessionStorage only.
const KEY = "examsaathi:pending-email";

export function setPendingEmail(email: string) {
  if (typeof window === "undefined" || !email) return;
  try {
    window.sessionStorage.setItem(KEY, email);
  } catch {
    /* ignore */
  }
}

export function getPendingEmail(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

export function clearPendingEmail() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}