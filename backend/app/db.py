"""Async SQLAlchemy engine + session factory.

Connects directly to Supabase Postgres over the transaction-mode pooler (see DATABASE_URL).
We use real SQL transactions for the betting ledger, so we do NOT use supabase-py/PostgREST
for data access — only for Storage signing (see app/services).
"""
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import settings

# pool_pre_ping guards against stale pooler connections after Render idles the service.
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding a request-scoped async session."""
    async with async_session() as session:
        yield session
