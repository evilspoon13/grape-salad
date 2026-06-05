# Integration & Workflow

How the two halves fit together, how to work on them independently, and how they converge
cleanly. Read this first; the per-side details live in `backend/README.md` and
`frontend/README.md`, and the feature spec in `BACKEND_PLAN.md` / `FRONTEND_PLAN.md`.

## The one seam: the API contract

Everything between the two devs flows through **one HTTP contract**:

- Base path `/api`, JSON in/out, errors as `{ "detail": "..." }` with 4xx codes.
- Identity is the **`X-User-Id`** header (a profile UUID). No auth yet. The frontend sets it
  once in `frontend/src/lib/api.ts`; the backend reads it once in `backend/app/deps.py`
  (`current_user`).
- The backend's **Swagger / OpenAPI** at `http://localhost:8000/docs` (and `/openapi.json`)
  is the *live source of truth*. The plan files restate the contract in prose; the running
  schema wins if they ever disagree.

Both sides already speak this contract end to end — the frontend's query hooks call the exact
paths the backend's routers declare, with matching request/response shapes.

## What's wired (so you can start coding, not plumbing)

**Backend (`/backend`)**
- App boots: CORS (to `FRONTEND_ORIGIN`), router includes, `GET /api/health`, Swagger.
- All 7 tables modeled (`app/models`), every wire shape typed (`app/schemas`).
- **Every endpoint in the contract is declared** with the correct path + `response_model`, so
  `/openapi.json` is accurate *today*. List endpoints return `[]`; the rest raise `501`,
  each tagged with its milestone. Fill in the bodies — the signatures won't move.
- `current_user` dependency, `scripts/create_db.py` (instant schema), `scripts/seed_profiles.py`.
- Parimutuel math (`app/services/betting.py`) implemented + unit-tested; the transactional
  balance ops are stubbed with the money-integrity rules spelled out inline.

**Frontend (`/frontend`)**
- Vite + React + TS + Tailwind + TanStack Query app shell, routing, identity (picker, user
  context, `X-User-Id` header, header switcher) — all working.
- One query/mutation hook per endpoint (`src/lib/queries.ts`); a typed contract mirror
  (`src/lib/types.ts`); the central `api.ts` wrapper and `uploadFile()` helper.
- Every page and component is wired to real hooks against the contract, so each screen lights
  up the moment its endpoint goes live.
- **In-memory mock backend** (`src/mocks/`) implementing the *whole* contract — including
  working parimutuel betting — so the frontend runs with **no backend at all**.

**Shared**
- `Makefile` for every common task, `.github/workflows/ci.yml` (backend tests/lint +
  frontend typecheck/build on every PR), `.editorconfig`, root `.gitignore`.

## Working independently (the whole point)

**Frontend dev — zero backend required.** Run against the mock:
```bash
make frontend-install
make frontend-mock          # VITE_USE_MOCKS=true — full app, fake in-memory data
```
You can build and demo every page (post, create markets, place bets, watch balances move,
record memos, generate a mock digest) before the backend exists. Flip to the real backend by
running `make frontend-dev` with `VITE_USE_MOCKS=false`.

**Backend dev — no frontend required.** Swagger *is* your client:
```bash
make backend-install
cp backend/.env.example backend/.env   # fill in DATABASE_URL etc.
make backend-db && make backend-seed
make backend-dev            # exercise everything at :8000/docs
make backend-test           # parimutuel math + (your future) tests
```

Neither side edits the other's directory. The mock backend means the frontend is never
*blocked*; Swagger means the backend never needs the UI to verify itself.

## Converging

1. Backend implements a milestone, confirms it in `/docs`, pushes.
2. Frontend points at the real backend (`VITE_USE_MOCKS=false`) and, optionally, regenerates
   types from the live schema:
   ```bash
   make gen-api               # frontend/src/lib/api-types.ts from /openapi.json
   ```
   (or keep the hand-written `types.ts` mirror — your call; just keep one of them honest).
3. CI runs both halves on the PR, so a contract drift (a renamed field, a changed response)
   surfaces as a failing typecheck/test before merge.

Suggested order matches the milestones in both plans (M1 identity → M2 feed → M3 betting →
M4 voice → M5 digest → M6 polish). The backend should land **M1 + the `[]` stubs** first so
nothing blocks; both are already deployable as-is.

## Changing the contract (the only thing that needs coordination)

If a shape needs to change:
1. Backend changes the Pydantic schema → `/openapi.json` updates automatically.
2. Update the **API Contract** section in *both* plan files (keep them in sync).
3. Tell the frontend dev. They update `types.ts` (or rerun `make gen-api`) and the affected
   hook.
4. CI's frontend typecheck will fail loudly anywhere the change wasn't followed through —
   that's the safety net.

Don't invent client-only state that should live server-side (especially anything touching
coins). If the UI needs a new shape, it's a contract change — go through the steps above.

## Ownership

| Area | Owner |
| --- | --- |
| `/backend/**`, DB schema, migrations, money logic | Backend dev |
| `/frontend/**`, UI, mock backend | Frontend dev |
| `*_PLAN.md` contract sections, this file | Both (coordinate on edits) |
| `Makefile`, CI, root configs | Both |
