"""Async voice memos + threads. Milestone M4."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.deps import current_user
from app.models.profile import Profile
from app.schemas.voice_memos import VoiceMemoCreate, VoiceMemoOut, VoiceThreadOut

router = APIRouter(prefix="/api/voice-memos", tags=["voice-memos"])


@router.get("", response_model=list[VoiceMemoOut], summary="List root memos, newest first")
async def list_root_memos(session: AsyncSession = Depends(get_session)):
    # TODO M4: SELECT memos WHERE parent_id IS NULL, newest first, with reply_count.
    return []


@router.get("/{memo_id}/thread", response_model=VoiceThreadOut, summary="Memo + its replies")
async def get_thread(memo_id: UUID, session: AsyncSession = Depends(get_session)):
    raise HTTPException(status_code=501, detail="Not implemented (M4)")


@router.post("", response_model=VoiceMemoOut, status_code=201, summary="Create a memo or reply")
async def create_memo(
    body: VoiceMemoCreate,
    user: Profile = Depends(current_user),
    session: AsyncSession = Depends(get_session),
):
    raise HTTPException(status_code=501, detail="Not implemented (M4)")
