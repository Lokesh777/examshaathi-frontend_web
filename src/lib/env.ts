/** Client-safe API base URL (set NEXT_PUBLIC_API_BASE_URL in .env.local). */
const productionApi = "https://examshaathi-backend.onrender.com/api";
const localApi = "http://localhost:3000/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "development" ? localApi : productionApi);
