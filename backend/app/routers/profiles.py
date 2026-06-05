"""Profiles & coins. Milestone M1."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.schemas.profiles import GrantIn, ProfileOut

router = APIRouter(prefix="/api/profiles", tags=["profiles"])


@router.get("", response_model=list[ProfileOut], summary="List all profiles")
async def list_profiles(session: AsyncSession = Depends(get_session)) -> list[ProfileOut]:
    # TODO M1: SELECT all profiles. Used by the user picker + leaderboard.
    return []


@router.get("/{profile_id}", response_model=ProfileOut, summary="Get a single profile")
async def get_profile(profile_id: UUID, session: AsyncSession = Depends(get_session)):
    raise HTTPException(status_code=501, detail="Not implemented (M1)")


@router.post("/{profile_id}/grant", response_model=ProfileOut, summary="Grant coins")
async def grant(
    profile_id: UUID, body: GrantIn, session: AsyncSession = Depends(get_session)
):
    # TODO M1/M3: services.betting.grant_coins — balance += amount + `grant` ledger row, in a tx.
    raise HTTPException(status_code=501, detail="Not implemented (M1)")
