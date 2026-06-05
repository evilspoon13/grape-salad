import enum
from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel

from app.models.base import now_utc


class MarketStatus(str, enum.Enum):
    open = "open"
    resolved = "resolved"


class Outcome(str, enum.Enum):
    yes = "yes"
    no = "no"


class Market(SQLModel, table=True):
    __tablename__ = "markets"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    creator_id: UUID = Field(foreign_key="profiles.id")
    question: str
    description: str | None = None
    status: MarketStatus = Field(default=MarketStatus.open)
    outcome: Outcome | None = None
    resolved_by: UUID | None = Field(default=None, foreign_key="profiles.id")
    resolved_at: datetime | None = None
    created_at: datetime = Field(default_factory=now_utc, nullable=False)
