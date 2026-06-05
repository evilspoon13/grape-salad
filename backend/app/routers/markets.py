"""Markets & betting (the hard part). Milestone M3."""
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.deps import current_user
from app.models.profile import Profile
from app.schemas.markets import (
    BetCreate,
    MarketCreate,
    MarketDetail,
    MarketSummary,
    ResolveIn,
)

router = APIRouter(prefix="/api/markets", tags=["markets"])


@router.get("", response_model=list[MarketSummary], summary="List markets with pools + odds")
async def list_markets(
    status: Literal["open", "resolved", "all"] = "open",
    session: AsyncSession = Depends(get_session),
):
    # TODO M3: list markets, compute pools + implied_odds + bet_count per market.
    return []


@router.get("/{market_id}", response_model=MarketDetail, summary="Full market detail with bets")
async def get_market(market_id: UUID, session: AsyncSession = Depends(get_session)):
    raise HTTPException(status_code=501, detail="Not implemented (M3)")


@router.post("", response_model=MarketDetail, status_code=201, summary="Create a market")
async def create_market(
    body: MarketCreate,
    user: Profile = Depends(current_user),
    session: AsyncSession = Depends(get_session),
):
    raise HTTPException(status_code=501, detail="Not implemented (M3)")


@router.post(
    "/{market_id}/bets",
    response_model=MarketDetail,
    summary="Place a bet (400 insufficient funds, 409 market closed)",
)
async def place_bet(
    market_id: UUID,
    body: BetCreate,
    user: Profile = Depends(current_user),
    session: AsyncSession = Depends(get_session),
):
    # TODO M3: services.betting.place_bet — transactional escrow.
    raise HTTPException(status_code=501, detail="Not implemented (M3)")


@router.post(
    "/{market_id}/resolve",
    response_model=MarketDetail,
    summary="Resolve a market and pay out (409 if already resolved)",
)
async def resolve_market(
    market_id: UUID,
    body: ResolveIn,
    user: Profile = Depends(current_user),
    session: AsyncSession = Depends(get_session),
):
    # TODO M3: services.betting.resolve_market — transactional payout. Anyone can resolve.
    raise HTTPException(status_code=501, detail="Not implemented (M3)")
