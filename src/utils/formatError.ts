import { ApiError } from "@/lib/api";

type ErrorBody = {
  message?: string;
  errors?: { field: string; message: string }[];
};

export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    const body = error.body as ErrorBody | undefined;
    return body?.message ?? error.message ?? "Something went wrong.";
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function fieldErrorsFrom(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const body = error.body as ErrorBody | undefined;
  if (!body?.errors?.length) return {};
  const map: Record<string, string> = {};
  body.errors.forEach((e) => (map[e.field] = e.message));
  return map;
}

/** True when the API says the account email still needs verification. */
export function isEmailUnverifiedError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  const message = formatApiError(error).toLowerCase();
  return error.status === 403 && message.includes("verif");
}