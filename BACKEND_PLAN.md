# Backend Plan — Friends App (the "service + DB" half)

> Hand this to Claude Code. You own the FastAPI service, the database schema, and all business logic. Your counterpart owns the React frontend and consumes the API you build here. The **API Contract** section below is the shared seam — keep it in sync with them; your `/docs` (Swagger) is the live source of truth.

## Project context

A tiny private social app for a group of college friends now spread across cities. Three features:

1. **Weekly digest** — people post text/photo updates (and voice memos) through the week; an LLM rounds them into a funny newsletter. Generated **manually** via an endpoint (no cron for now).
2. **Betting on each other's lives** — fake-currency parimutuel markets ("Will Jake hit the gym 3x this week?"). Simple staking with implied odds. Anyone can resolve a market.
3. **Async voice memos** — record a memo, others reply with memos, forming a thread/chain.

This is an MVP for a trusted friend group. **No authentication yet** (see Identity below). Optimize for shipping and learning, not robustness.

## Your stack

- **FastAPI** (async) — auto-generates OpenAPI/Swagger, which is how the frontend dev builds against you.
- **SQLModel** (SQLAlchemy + Pydantic) for models + Alembic for migrations. *(Plain SQLAlchemy 2.0 is fine if preferred — either was approved.)*
- **Supabase Postgres** as the database — connect **directly** over the **transaction-mode pooler** connection string. Do **not** use the supabase-py / PostgREST client for data access; you need real SQL transactions for the betting ledger.
- **Supabase Storage** only for file uploads (signed URLs for images + audio). This is the *one* place you use the supabase-py client.
- **Anthropic API** (Claude) for digest generation — one call, server-side key.
- Host on **Render** (free web service; it sleeps after ~15 min idle — fine for now).

## Repo layout (monorepo)

You work in `/backend`. Don't touch `/frontend`.

```
/backend
  /app
    main.py            # FastAPI app, CORS, router includes
    db.py              # engine + session (pooler connection string)
    deps.py            # get_session, current_user (X-User-Id)
    config.py          # settings from env
    /models            # SQLModel tables
    /schemas           # request/response Pydantic models
    /routers           # profiles, posts, markets, voice_memos, digests, uploads
    /services          # betting logic, payout math, digest generation
  /alembic
  /scripts
    seed_profiles.py   # seed the friend group
  pyproject.toml (or requirements.txt)
  .env.example
  README.md
```

## Identity (no auth yet)

Authentication is deferred, but you still need to know *who* is acting (for balances and attribution). Convention for the whole API:

- A `profiles` row per friend, seeded manually via `scripts/seed_profiles.py`.
- The frontend sends the acting user's profile UUID in an **`X-User-Id`** header on every request that acts as a user. The backend trusts it. This is intentionally spoofable and gets replaced by Supabase Auth later.
- **Design every table with `user_id` as a real FK from day one** so flipping on real auth later is just adding an `auth_id` column to `profiles` — not a migration across every table.
- Implement a FastAPI dependency `current_user(x_user_id: UUID = Header(...))` that loads and returns the profile, 401/400 if missing or unknown.

## Data model

All ids are UUID PKs, all tables have `created_at timestamptz default now()`.

**profiles**
- `id`, `display_name` (text), `avatar_url` (text, null), `coin_balance` (int, default 0), `auth_id` (text, null — future use)

**posts** (the text/photo updates that feed the digest)
- `id`, `author_id` (FK profiles), `content` (text), `image_url` (text, null)

**voice_memos**
- `id`, `author_id` (FK profiles), `audio_url` (text), `duration_seconds` (int, null), `parent_id` (FK voice_memos, null — self-referential for threads), `transcript` (text, null — optional, skip for v1)

**markets**
- `id`, `creator_id` (FK profiles), `question` (text), `description` (text, null), `status` (enum: `open` | `resolved`, default `open`), `outcome` (enum: `yes` | `no`, null), `resolved_by` (FK profiles, null), `resolved_at` (timestamptz, null)

**bets**
- `id`, `market_id` (FK markets), `user_id` (FK profiles), `position` (enum: `yes` | `no`), `amount` (int, coins staked), `comment` (text, null)

**coin_transactions** (append-only ledger — never update or delete rows)
- `id`, `user_id` (FK profiles), `delta` (int, +/−), `reason` (enum: `grant` | `bet_stake` | `bet_payout`), `market_id` (FK markets, null)

**digests**
- `id`, `period_start` (date), `period_end` (date), `content` (text, markdown)

### Money integrity rules (read carefully — this is the only place bugs really hurt)

- `coin_balance` on `profiles` is the live balance; `coin_transactions` is the audit trail. They must only ever change **together, inside one DB transaction.**
- Any operation touching a balance (placing a bet, resolving a market, granting coins) must:
  1. `SELECT ... FOR UPDATE` the affected profile row(s) to lock them,
  2. verify funds where needed,
  3. write the balance change **and** the matching ledger row,
  4. commit.
- This prevents two concurrent requests from double-spending the same balance. Serverless/multiple workers make this real even at friend-group scale.

### Betting math (parimutuel)

For a market, compute pools from bets:
- `yes_pool = sum(amount where position='yes')`, `no_pool = sum(amount where position='no')`, `total = yes_pool + no_pool`.
- Implied odds (probabilities): `yes = yes_pool / total`, `no = no_pool / total` (return `0.5/0.5` or nulls when `total == 0`).

**Placing a bet:** debit `amount` from the user's balance immediately (escrow) and insert the bet + a `bet_stake` ledger row of `−amount`, all in one transaction. Reject with 400 if balance < amount, 409 if market not `open`.

**Resolving (anyone can resolve):** given `outcome` (yes/no):
- `winning_pool = pool[outcome]`.
- If `winning_pool == 0` (nobody bet the winning side): **refund every bet its stake** via `bet_payout` ledger rows, mark resolved. (Voids the market cleanly.)
- Else for each bet on the winning side: `payout = floor(amount / winning_pool * total)`. Credit it and write a `bet_payout` ledger row. Losing bets get nothing (their stake was already debited). Floor rounding leaves negligible dust — acceptable for MVP.
- Set `status='resolved'`, `outcome`, `resolved_by` (from `X-User-Id`), `resolved_at`. Do the whole payout in **one transaction** locking all affected profiles. Reject 409 if already resolved.

## API Contract (you implement this)

Base path `/api`. JSON in/out. Return appropriate 4xx with `{ "detail": "..." }` on errors.

### Profiles & coins
- `GET /api/profiles` → list all profiles (id, display_name, avatar_url, coin_balance). Used for the user picker + leaderboard.
- `GET /api/profiles/{id}` → single profile incl. balance.
- `POST /api/profiles/{id}/grant` body `{ "amount": int }` → grants coins (ledger `grant` + balance, in a transaction). This is your manual "give everyone money" lever.

### Posts (digest feed)
- `GET /api/posts?limit=50` → newest-first list. Each: `{ id, author: {id, display_name, avatar_url}, content, image_url, created_at }`.
- `POST /api/posts` (uses `X-User-Id`) body `{ "content": str, "image_url": str | null }` → created post.

### Voice memos
- `GET /api/voice-memos` → root memos (`parent_id is null`), newest first. Each: `{ id, author, audio_url, duration_seconds, reply_count, created_at }`.
- `GET /api/voice-memos/{id}/thread` → the memo plus its replies in order: `{ root: {...}, replies: [ {...}, ... ] }`.
- `POST /api/voice-memos` (uses `X-User-Id`) body `{ "audio_url": str, "duration_seconds": int | null, "parent_id": uuid | null }` → created memo.

### Markets & betting
- `GET /api/markets?status=open|resolved|all` → list. Each market includes `pools`, `implied_odds`, `status`, `creator`, `bet_count`.
- `GET /api/markets/{id}` → full market:
```json
{
  "id": "uuid",
  "question": "Will Jake hit the gym 3x this week?",
  "description": "settles Sunday",
  "status": "open",
  "outcome": null,
  "creator": { "id": "uuid", "display_name": "Maya", "avatar_url": null },
  "pools": { "yes": 120, "no": 80, "total": 200 },
  "implied_odds": { "yes": 0.6, "no": 0.4 },
  "resolved_by": null,
  "resolved_at": null,
  "bets": [
    { "id": "uuid", "user": { "id": "uuid", "display_name": "Sam" },
      "position": "yes", "amount": 50, "comment": "easy money", "created_at": "..." }
  ],
  "created_at": "..."
}
```
- `POST /api/markets` (uses `X-User-Id`) body `{ "question": str, "description": str | null }` → created market.
- `POST /api/markets/{id}/bets` (uses `X-User-Id`) body `{ "position": "yes"|"no", "amount": int, "comment": str | null }` → updated market. Errors: 400 insufficient funds, 409 market not open.
- `POST /api/markets/{id}/resolve` (uses `X-User-Id`) body `{ "outcome": "yes"|"no" }` → resolved market with payouts applied. 409 if already resolved.

### Uploads (signed URLs to Supabase Storage)
- `POST /api/uploads/sign` body `{ "kind": "image"|"audio", "content_type": str }` → `{ "upload_url": str, "public_url": str }`. Frontend PUTs the file to `upload_url`, then sends `public_url` back as `image_url`/`audio_url` on the relevant create call. Use UUID-based object paths. For MVP, make the bucket public-read (files are unguessable; access control comes with auth).

### Digest
- `POST /api/digests/generate` body `{ "period_start": date | null, "period_end": date | null }` (defaults to last 7 days) → gathers posts (and voice-memo transcripts if present) in the window, makes **one** Anthropic call to write a funny newsletter in markdown, stores and returns it. This is the manual "run the digest" button.
- `GET /api/digests` → past digests, newest first.
- `GET /api/digests/{id}` → single digest.

## Build milestones (suggested order)

- **M0 — Setup.** `/backend` skeleton, env/config, DB engine on the pooler connection string, CORS allowing the frontend origin, `GET /api/health`. Confirm Swagger at `/docs`.
- **M1 — Profiles & identity.** `profiles` model, `seed_profiles.py`, profile endpoints, `current_user` dependency, `grant`. Frontend can now build its user picker.
- **M2 — Posts & uploads.** `posts` model + endpoints; `uploads/sign` against Supabase Storage. Unblocks the feed.
- **M3 — Betting (the hard part).** markets/bets/coin_transactions models; create market, place bet (transactional), list/detail with computed pools + odds, resolve (transactional payout), and the grant flow. Write a couple of unit tests for the payout math and the insufficient-funds path.
- **M4 — Voice memos.** model with `parent_id`, endpoints incl. thread, audio signed upload.
- **M5 — Digest.** model + `generate` (Anthropic call) + list/get.
- **M6 — Polish.** consistent error shapes, input validation, OpenAPI tags/summaries so `/docs` reads cleanly, README with run instructions.

## Getting started

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install fastapi "uvicorn[standard]" sqlmodel alembic asyncpg pydantic-settings supabase anthropic
# create .env from .env.example
uvicorn app.main:app --reload
# Swagger: http://localhost:8000/docs
```

`.env` keys: `DATABASE_URL` (Supabase **pooler**, transaction mode), `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (for storage signing), `ANTHROPIC_API_KEY`, `FRONTEND_ORIGIN` (for CORS).

## Scope guardrails (do NOT build yet)

- No auth/login, no password, no RLS — `X-User-Id` is the whole identity story for now.
- No cron/scheduling — digest is manual.
- No realtime/websockets — frontend reloads to refresh.
- No edit/delete endpoints unless trivially free — keep surface small.
- No moving-price market maker — parimutuel pools only.
- No coin economy rules (stipends, decay) — just the manual `grant`.
- Don't over-abstract. One service module per feature is plenty.

## Working in parallel

- Your `/docs` (Swagger) **is** the contract for the frontend dev. When you change a request/response shape, tell them and update this file's contract section.
- They can generate a TypeScript client from your OpenAPI schema (`openapi.json`), so keep your Pydantic response models accurate.
- Get **M1 (profiles)** and stub responses for markets/posts deployed early so they're never blocked waiting on your full implementation.
