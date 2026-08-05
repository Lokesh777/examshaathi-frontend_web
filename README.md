# ExamSaathi Frontend

AI prep for Rajasthan CET — daily streak, shared topic banks, topic readiness quizzes, pattern-true mocks, old papers, and a Hindi/English AI Tutor.

Product overview (all surfaces): [`docs/PRODUCT.md`](../docs/PRODUCT.md).

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

## Product surfaces (UI)

| Area | Notes |
|------|--------|
| Landing `/` | Marketing — streak, topic bank, tutor, mocks |
| Topics | Daily streak card on top + topic readiness |
| Topic hub | Generate bank Qs · create practice quizzes · manage bank |
| AI Tutor | Topic-aware chat; language badge; no source links |
| Mock / Old papers | Full mocks + official catalog papers |
| Results | Explanations without broken Sources |

Landing components live under `src/components/landing/`.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Lucide React icons
- TanStack Query
