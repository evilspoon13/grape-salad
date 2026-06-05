# Friends App — Backend

FastAPI service + database for the Friends App. You own `/backend`. Don't touch `/frontend`.
Full spec: `../BACKEND_PLAN.md`. Your `/docs` (Swagger) **is** the contract for the frontend dev.

## Run

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # fill in DATABASE_URL (pooler), Supabase + Anthropic keys
uvicorn app.main:app --reload
# Swagger:  http://localhost:8000/docs
# Health:   http://localhost:8000/api/health
```

Create the schema (quick first pass) or use Alembic — see `alembic/README.md`. Then seed:

```bash
python -m scripts.create_db        # create all tables from the SQLModel metadata
python -m scripts.seed_profiles    # seed the friend group
```

Run the math tests:

```bash
pytest
```

## Layout

```
app/
  main.py        FastAPI app, CORS, router includes, /api/health
  config.py      env-driven settings
  db.py          async engine + session (Supabase transaction-mode pooler)
  deps.py        get_session, current_user (X-User-Id header)
  models/        SQLModel tables (profiles, posts, voice_memos, markets, bets,
                 coin_transactions, digests)
  schemas/       request/response Pydantic models (the wire shapes)
  routers/       profiles, posts, voice_memos, markets, uploads, digests
  services/      betting (parimutuel math + transactional ops), digest, storage
scripts/seed_profiles.py
tests/test_betting_math.py
```

## What's scaffolded vs. TODO

- **Done:** app wiring, CORS, health, all models, all wire schemas, every endpoint declared
  with correct paths + response models (so OpenAPI is accurate now), the pure parimutuel math
  (`compute_pools` / `implied_odds` / `payout_for`) + its tests, the `current_user` dependency.
- **List endpoints** return `[]` stubs so the frontend is never blocked.
- **TODO**, tagged by milestone in the code (`Not implemented (Mx)`):
  - M1 — profile reads, `grant`
  - M2 — posts create/list, Supabase Storage signed uploads
  - M3 — markets/bets/resolve + the **transactional** balance ops in `services/betting.py`
  - M4 — voice memos + threads
  - M5 — digest generation (one Anthropic call, `claude-opus-4-8`)

## Money integrity (read `services/betting.py`)

`profiles.coin_balance` and the append-only `coin_transactions` ledger must only ever change
**together, in one transaction**, with `SELECT ... FOR UPDATE` on the affected profile rows.
Never write a balance change without its matching ledger row.

## Working in parallel

When you change a request/response shape, update the **API Contract** in `../BACKEND_PLAN.md`
and tell the frontend dev. They generate a typed client from your `openapi.json`, so keep the
Pydantic response models accurate.
