# Friends App — Frontend

Vite + React + TS SPA for the Friends App. You own `/frontend`. Don't touch `/backend`.
Full spec: `../FRONTEND_PLAN.md`. The backend's Swagger at `<backend>/docs` is the contract.

## Run

```bash
npm install
cp .env.example .env        # set VITE_API_BASE_URL=http://localhost:8000
npm run dev                 # http://localhost:5173
```

**No backend yet?** Run fully offline against the in-memory mock backend (`src/mocks/`),
which implements the whole contract — including working betting:

```bash
VITE_USE_MOCKS=true npm run dev
```

State is in-memory and resets on reload. Flip `VITE_USE_MOCKS` back to `false` (the default)
to hit the real backend at `VITE_API_BASE_URL`.

Generate typed API types from the backend's live OpenAPI (optional, recommended):

```bash
npm run gen:api             # -> src/lib/api-types.ts  (backend must be running)
```

## Layout

```
src/
  main.tsx          QueryClientProvider + Router + UserProvider
  App.tsx           app shell: nav, header, routes; forces UserPicker when no identity
  lib/
    api.ts          fetch wrapper (base URL + X-User-Id), ApiError, uploadFile() helper
    queries.ts      one TanStack Query hook per endpoint
    types.ts        hand-written mirror of the API contract (swap for generated api-types.ts)
  context/user.tsx  current-user (selected profile) via localStorage
  mocks/            in-memory backend implementing the whole contract (VITE_USE_MOCKS=true)
  components/        shared: UserPicker, AppHeader, UserBadge, OddsBar, AudioPlayer
  pages/            Feed, Markets, MarketDetail, Voice, VoiceThread, Digest
  pages/components/  PostComposer, CreateMarketForm, BetForm, ResolveControl, Recorder, Leaderboard
```

## What's scaffolded vs. TODO

Every page and component is wired to the real query hooks and renders against the contract —
so the moment a backend endpoint goes live, the corresponding screen works. Identity (M1) is
fully wired: the picker, the `X-User-Id` header, the header switcher.

Milestones to flesh out (mostly styling/edge cases, the data flow is in place):

- **M1** Identity — done.
- **M2** Feed — `PostComposer` + image upload wired; polish empty/error states.
- **M3** Markets — list, `OddsBar`, create, `BetForm` (handles 400/409), `ResolveControl`
  (confirm step), `Leaderboard`.
- **M4** Voice — `Recorder` (MediaRecorder), `AudioPlayer`, thread + reply.
- **M5** Digest — generate button (loading) + markdown render.
- **M6** Polish — loading/empty/error everywhere, mobile responsive, one cohesive styling pass.

## Identity & the X-User-Id header

`api.ts` reads the selected profile id from `localStorage` and sends it as `X-User-Id` on every
request — never set it per-call. Read-only calls that may run before a user is picked (e.g. the
profile picker) pass `{ requireUser: false }`.

## Working in parallel

Build against the backend's **Swagger**. If an endpoint isn't ready, mock its return inside the
relevant hook in `queries.ts`, then swap to the real `api(...)` call. CORS errors against the
deployed backend are the backend dev's middleware config — flag them, don't work around them.
Don't invent client-only state that should live server-side (especially anything touching coins).
