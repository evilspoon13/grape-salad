import enum
from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel

from app.models.base import now_utc


class Position(str, enum.Enum):
    yes = "yes"
    no = "no"


class Bet(SQLModel, table=True):
    __tablename__ = "bets"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    market_id: UUID = Field(foreign_key="markets.id")
    user_id: UUID = Field(foreign_key="profiles.id")
    position: Position
    amount: int  # coins staked (debited from balance immediately as escrow)
    comment: str | None = None
    created_at: datetime = Field(default_factory=now_utc, nullable=False)
