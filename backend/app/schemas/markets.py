from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.market import MarketStatus, Outcome
from app.models.bet import Position
from app.schemas.common import UserRef


class Pools(BaseModel):
    yes: int
    no: int
    total: int


class ImpliedOdds(BaseModel):
    yes: float | None
    no: float | None


class BetOut(BaseModel):
    id: UUID
    user: UserRef
    position: Position
    amount: int
    comment: str | None = None
    created_at: datetime


class MarketSummary(BaseModel):
    """Shape for GET /api/markets (list)."""
    id: UUID
    question: str
    description: str | None = None
    status: MarketStatus
    outcome: Outcome | None = None
    creator: UserRef
    pools: Pools
    implied_odds: ImpliedOdds
    bet_count: int
    created_at: datetime


class MarketDetail(MarketSummary):
    """Shape for GET /api/markets/{id} — adds bets + resolution metadata."""
    resolved_by: UUID | None = None
    resolved_at: datetime | None = None
    bets: list[BetOut]


class MarketCreate(BaseModel):
    question: str
    description: str | None = None


class BetCreate(BaseModel):
    position: Position
    amount: int = Field(..., gt=0)
    comment: str | None = None


class ResolveIn(BaseModel):
    outcome: Outcome
