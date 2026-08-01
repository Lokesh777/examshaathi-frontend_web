# ExamSaathi Frontend

AI-powered CET preparation — topic quizzes, mock tests, and an AI tutor.

## Development

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://examshaathi-backend.onrender.com/api
```

## Auth (cross-origin)

The frontend and API run on different origins. Session handling:

- **Access token** — memory only, sent as `Authorization: Bearer` on API requests
- **Refresh token** — HttpOnly cookie on the API domain; sent only on login, refresh, and logout (not on every request)
- **Reload / 401** — silent `POST /user/refresh-token` with credentials, then retry

Backend must set the refresh cookie with `HttpOnly; Secure; SameSite=None` and enable CORS with `credentials: true` and an explicit `Access-Control-Allow-Origin` (not `*`).

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Lucide React icons
- TanStack Query
