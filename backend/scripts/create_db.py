"""Create all tables directly from the SQLModel metadata — fast first-pass bootstrap.

    python -m scripts.create_db

Use this to get a working schema immediately. Switch to Alembic (see alembic/README.md)
before the schema changes a second time, so migrations are tracked from then on.
"""
import asyncio

from sqlmodel import SQLModel

import app.models  # noqa: F401  -- import registers every table on SQLModel.metadata
from app.db import engine


async def main() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    print("schema created:", ", ".join(sorted(SQLModel.metadata.tables)))


if __name__ == "__main__":
    asyncio.run(main())
