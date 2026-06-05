"""Weekly digest. Milestone M5."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.schemas.digests import DigestGenerateIn, DigestOut

router = APIRouter(prefix="/api/digests", tags=["digests"])


@router.post("/generate", response_model=DigestOut, summary="Generate a digest (one Anthropic call)")
async def generate(body: DigestGenerateIn, session: AsyncSession = Depends(get_session)):
    # TODO M5: default to last 7 days, services.digest.generate_digest, persist + return.
    raise HTTPException(status_code=501, detail="Not implemented (M5)")


@router.get("", response_model=list[DigestOut], summary="List past digests, newest first")
async def list_digests(session: AsyncSession = Depends(get_session)):
    # TODO M5
    return []


@router.get("/{digest_id}", response_model=DigestOut, summary="Get a single digest")
async def get_digest(digest_id: UUID, session: AsyncSession = Depends(get_session)):
    raise HTTPException(status_code=501, detail="Not implemented (M5)")
