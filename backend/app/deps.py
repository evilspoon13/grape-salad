"""Shared FastAPI dependencies — DB session and the no-auth current-user identity."""
from uuid import UUID

from fastapi import Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.models.profile import Profile


async def current_user(
    x_user_id: UUID = Header(..., description="Acting profile UUID (spoofable — no auth yet)"),
    session: AsyncSession = Depends(get_session),
) -> Profile:
    """Resolve the acting user from the X-User-Id header.

    Intentionally trusts the header; this is the entire identity story until Supabase Auth lands.
    Returns the Profile, or raises 400 if the id is unknown.
    """
    profile = await session.get(Profile, x_user_id)
    if profile is None:
        raise HTTPException(status_code=400, detail="Unknown X-User-Id")
    return profile
