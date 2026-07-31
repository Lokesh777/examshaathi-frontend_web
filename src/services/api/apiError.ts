import axios from "axios";

/** Normalized error thrown by every service call. */
export class ApiError extends Error {
  readonly status: number;
  /** Machine-readable backend code, e.g. "EMAIL_NOT_VERIFIED". */
  readonly code?: string;
  readonly body?: unknown;

  constructor(message: string, status: number, body?: unknown, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.code = code;
  }
}

/** Converts an axios failure into an ApiError with status / code / body. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const body = error.response?.data as
      | { message?: string; code?: string }
      | undefined;
    if (!error.response) {
      return new ApiError("Network error: could not reach the server.", 0, null);
    }
    return new ApiError(
      body?.message ?? error.message ?? `Request failed (${error.response.status})`,
      error.response.status,
      body,
      typeof body?.code === "string" ? body.code : undefined,
    );
  }

  return new ApiError(
    error instanceof Error ? error.message : "Something went wrong.",
    0,
    null,
  );
}