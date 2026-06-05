"""Posts (the digest feed). Milestone M2."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.deps import current_user
from app.models.profile import Profile
from app.schemas.posts import PostCreate, PostOut

router = APIRouter(prefix="/api/posts", tags=["posts"])


@router.get("", response_model=list[PostOut], summary="List posts, newest first")
async def list_posts(limit: int = 50, session: AsyncSession = Depends(get_session)):
    # TODO M2: SELECT posts join author, newest first, limit.
    return []


@router.post("", response_model=PostOut, status_code=201, summary="Create a post")
async def create_post(
    body: PostCreate,
    user: Profile = Depends(current_user),
    session: AsyncSession = Depends(get_session),
):
    raise HTTPException(status_code=501, detail="Not implemented (M2)")
