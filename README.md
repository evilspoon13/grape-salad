# Friends App

A tiny private social app for a group of college friends spread across cities. Three features:

1. **Weekly digest** — people post text/photo/voice updates through the week; an LLM rounds them into a funny newsletter (generated manually via a button).
2. **Betting on each other's lives** — fake-currency parimutuel markets with implied odds. Anyone can resolve a market.
3. **Async voice memos** — record a memo, others reply with memos, forming a thread.

MVP for a trusted friend group. **No auth yet** — identity is a spoofable `X-User-Id` header chosen from a profile picker.

## Monorepo layout

```
/backend    FastAPI + SQLModel + Supabase Postgres/Storage + Anthropic   (see BACKEND_PLAN.md)
/frontend   Vite + React + TS + Tailwind + TanStack Query                (see FRONTEND_PLAN.md)
```

The two halves meet at the **API Contract** (base path `/api`, `X-User-Id` header). The backend's
Swagger at `<backend>/docs` is the live source of truth.

## Dividing the work

- **Backend dev** owns `/backend`. Start with `cd backend && cat README.md`.
- **Frontend dev** owns `/frontend`. Start with `cd frontend && cat README.md`.
- Don't touch the other half. When you change a request/response shape, update the relevant
  plan's contract section and tell your counterpart.

## Quick start

Backend:
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in values
uvicorn app.main:app --reload   # Swagger at http://localhost:8000/docs
```

Frontend:
```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL=http://localhost:8000
npm run dev
```
