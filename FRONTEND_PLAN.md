# Frontend Plan — Friends App (the UI half)

> Hand this to Claude Code. You own the React app. Your counterpart builds the FastAPI backend and database; you consume the API described in the **API Contract** section below. Their live Swagger docs at `<backend>/docs` are the source of truth — you can build against it (or a mock) before their implementation is finished.

## Project context

A tiny private social app for a group of college friends now living in different cities. Three features:

1. **Weekly digest** — a funny AI-written newsletter rounding up the week's updates. Generated on demand via a button.
2. **Betting on each other's lives** — fake-currency markets ("Will Jake hit the gym 3x this week?") with simple staking and implied odds. Anyone can resolve a market.
3. **Async voice memos** — record a memo, others reply with memos, forming a thread.

MVP for a trusted friend group. **No login yet** — identity is a simple "who are you" picker (see below). Build for shipping and iteration, not robustness.

## Your stack

- **Vite + React + TypeScript** — SPA, builds to static files.
- **React Router** for navigation.
- **TanStack Query** for all data fetching — fits the "reload to refresh" model (caches, refetches on mount/focus, gives you loading/error states for free). Use it for every API call; avoid hand-rolled `fetch` + `useEffect`.
- **Tailwind CSS** for styling.
- Optional: generate a typed API client from the backend's `openapi.json` (e.g. `openapi-typescript`) so calls are type-checked.
- Host on **Cloudflare Pages** or **Vercel** (static, free, no cold start).

## Repo layout (monorepo)

You work in `/frontend`. Don't touch `/backend`.

```
/frontend
  /src
    main.tsx, App.tsx       # router + QueryClientProvider
    /lib
      api.ts                # fetch wrapper: base URL + X-User-Id header
      queries.ts            # TanStack Query hooks per endpoint
      types.ts              # API types (or generated from openapi.json)
    /context
      user.tsx              # current-user (selected profile) context
    /components             # shared UI (AudioPlayer, OddsBar, UserBadge, ...)
    /pages
      Feed.tsx
      Markets.tsx, MarketDetail.tsx
      Voice.tsx, VoiceThread.tsx
      Digest.tsx
    /pages/components        # page-specific bits (PostComposer, BetForm, Recorder, ...)
  index.html
  .env.example               # VITE_API_BASE_URL
  README.md
```

## Identity (no auth yet)

There's no login. On first load, show a **"Who are you?"** picker listing all profiles (`GET /api/profiles`). Store the chosen profile UUID in `localStorage`. Every API request must send it as an **`X-User-Id`** header — wire this into the central `api.ts` wrapper so you never forget it. Show the current user + coin balance in the app header, with a way to switch users. This is intentionally trivial/spoofable and gets replaced by real auth later.

## API Contract (you consume this)

Base URL from `VITE_API_BASE_URL`, all under `/api`. Every user-acting request carries `X-User-Id: <profile uuid>`.

### Profiles & coins
- `GET /api/profiles` → `[{ id, display_name, avatar_url, coin_balance }]` — for the picker + leaderboard.
- `GET /api/profiles/{id}` → single profile incl. balance.
- `POST /api/profiles/{id}/grant` `{ amount }` → (admin-ish) give coins. Optional little UI; fine to skip a dedicated screen for v1.

### Posts (feed)
- `GET /api/posts?limit=50` → newest first: `[{ id, author: {id, display_name, avatar_url}, content, image_url, created_at }]`.
- `POST /api/posts` `{ content, image_url | null }`.

### Voice memos
- `GET /api/voice-memos` → root memos: `[{ id, author, audio_url, duration_seconds, reply_count, created_at }]`.
- `GET /api/voice-memos/{id}/thread` → `{ root: {...}, replies: [{...}] }`.
- `POST /api/voice-memos` `{ audio_url, duration_seconds | null, parent_id | null }`.

### Markets & betting
- `GET /api/markets?status=open|resolved|all` → list with `pools`, `implied_odds`, `status`, `creator`, `bet_count`.
- `GET /api/markets/{id}` → full detail:
```json
{
  "id": "uuid", "question": "...", "description": "...",
  "status": "open", "outcome": null,
  "creator": { "id": "uuid", "display_name": "Maya", "avatar_url": null },
  "pools": { "yes": 120, "no": 80, "total": 200 },
  "implied_odds": { "yes": 0.6, "no": 0.4 },
  "resolved_by": null, "resolved_at": null,
  "bets": [ { "id": "uuid", "user": { "id": "uuid", "display_name": "Sam" },
             "position": "yes", "amount": 50, "comment": "easy money", "created_at": "..." } ],
  "created_at": "..."
}
```
- `POST /api/markets` `{ question, description | null }`.
- `POST /api/markets/{id}/bets` `{ position: "yes"|"no", amount, comment | null }` → updated market. Handle **400** (insufficient funds) and **409** (market closed) with clear inline messages.
- `POST /api/markets/{id}/resolve` `{ outcome: "yes"|"no" }` → resolved market. Surface a confirm step since anyone can resolve and it pays everyone out.

### Uploads (two-step)
- `POST /api/uploads/sign` `{ kind: "image"|"audio", content_type }` → `{ upload_url, public_url }`.
- Then `PUT` the file bytes directly to `upload_url`, and send `public_url` as `image_url`/`audio_url` on the create call. Centralize this as an `uploadFile(file, kind)` helper.

### Digest
- `POST /api/digests/generate` `{ period_start | null, period_end | null }` → generated digest (markdown). Defaults to last 7 days. Expect this to take several seconds — show a loading state.
- `GET /api/digests` → list, newest first.
- `GET /api/digests/{id}` → single (render the markdown).

## Pages & key components

- **App shell** — top nav (Feed · Markets · Voice · Digest), header showing current user + coin balance + switch-user.
- **Feed** — list of posts (text + optional image). `PostComposer`: textarea + optional image (via `uploadFile`, then `POST /api/posts`). Optimistic-ish or just invalidate the query on success.
- **Markets** — list of market cards each with an `OddsBar` (yes/no split from `implied_odds`), status badge, pool totals. `CreateMarketForm`. A small **leaderboard** of coin balances (from `GET /api/profiles`).
- **MarketDetail** — question, odds, `BetForm` (yes/no toggle, amount, optional comment), list of existing bets with who/position/amount/comment, and a **Resolve** control (confirm dialog → `resolve`). Reflect balance changes after betting/resolving by invalidating the relevant queries.
- **Voice** — list of root memos, each with an `AudioPlayer`. `Recorder` component using the **MediaRecorder API** to capture audio in-browser → `uploadFile(blob, "audio")` → `POST /api/voice-memos`. Capture `duration_seconds` if easy.
- **VoiceThread** — a root memo plus replies; reply by recording a memo with `parent_id` set.
- **Digest** — list of past digests; a **Generate** button (`POST /api/digests/generate`) with loading state; render digest markdown (use a markdown renderer).

## Build milestones (suggested order)

- **M0 — Setup.** Vite + TS + Tailwind + React Router + TanStack Query. `QueryClientProvider`, router shell, `api.ts` wrapper (base URL + `X-User-Id`), `.env`. Stub pages.
- **M1 — Identity.** Profile picker, user context + `localStorage`, header with user + balance + switcher. (Depends only on `GET /api/profiles`.)
- **M2 — Feed.** List posts, `PostComposer` with image upload.
- **M3 — Markets.** List + `OddsBar`, create form, detail with `BetForm` + bets list + resolve, leaderboard.
- **M4 — Voice.** `AudioPlayer`, `Recorder` (MediaRecorder), upload flow, thread view + reply.
- **M5 — Digest.** List, generate button + loading, markdown render.
- **M6 — Polish.** Loading/empty/error states everywhere, mobile-responsive layout, a cohesive styling pass.

## Getting started

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm i
npm i @tanstack/react-query react-router-dom
npm i -D tailwindcss postcss autoprefixer && npx tailwindcss init -p
# optional typed client:  npm i -D openapi-typescript
# set VITE_API_BASE_URL in .env (e.g. http://localhost:8000)
npm run dev
```

## Scope guardrails (do NOT build yet)

- No login/auth UI beyond the name picker.
- No realtime — reload (or query refetch) is how content updates. Don't add websockets.
- No client-side routing guards, roles, or permissions.
- Don't build features the contract doesn't expose. If you need a new shape, ask the backend dev and update the contract — don't invent client-only state that should live server-side (especially anything touching coins).
- Keep styling pragmatic; one clean pass at the end beats fiddling throughout.

## Working in parallel

- Build against the backend's **Swagger (`<backend>/docs`)**. Until an endpoint exists, mock its response in `queries.ts` so your page works, then swap to the real call.
- Centralize the base URL and `X-User-Id` in `api.ts` so the whole app flips environments with one env var.
- You'll hit **CORS** when pointing at the deployed backend — that's the backend dev's middleware config, not your bug; flag it to them.
- Get **M1 (identity)** working early; everything else assumes a current user.
