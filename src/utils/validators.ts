import { MIN_PASSWORD_LENGTH } from "@/constants/auth";

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export type PasswordScore = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  checks: { label: string; ok: boolean }[];
};

export function scorePassword(value: string): PasswordScore {
  const checks = [
    { label: `At least ${MIN_PASSWORD_LENGTH} characters`, ok: value.length >= MIN_PASSWORD_LENGTH },
    { label: "An uppercase letter", ok: /[A-Z]/.test(value) },
    { label: "A number", ok: /\d/.test(value) },
    { label: "A symbol", ok: /[^A-Za-z0-9]/.test(value) },
  ];
  const score = checks.filter((c) => c.ok).length as 0 | 1 | 2 | 3 | 4;
  const label = ["Too weak", "Weak", "Fair", "Good", "Strong"][score];
  return { score, label, checks };
}

export function isStrongEnough(value: string): boolean {
  return scorePassword(value).score >= 3;
}