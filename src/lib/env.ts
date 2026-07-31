/** Client-safe API base URL (set NEXT_PUBLIC_API_BASE_URL in .env.local). */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://examshaathi-backend.onrender.com/api";
