# Migrations

Set up Alembic against the same `DATABASE_URL` (pooler) here.

```bash
cd backend
alembic init -t async alembic    # generates env.py + alembic.ini (run once)
# point alembic env.py at app.models metadata (SQLModel.metadata) and settings.DATABASE_URL
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

All table models live in `app/models/` and are re-exported from `app/models/__init__.py`,
so importing that package gives Alembic the full metadata for autogenerate.

For a fast first pass you can instead create tables directly with
`SQLModel.metadata.create_all` — but wire up Alembic before the schema changes a second time.
