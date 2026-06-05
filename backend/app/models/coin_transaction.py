import enum
from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel

from app.models.base import now_utc


class TxReason(str, enum.Enum):
    grant = "grant"
    bet_stake = "bet_stake"
    bet_payout = "bet_payout"


class CoinTransaction(SQLModel, table=True):
    """Append-only ledger. NEVER update or delete rows.

    Every balance change on a Profile must be written together with a matching row here,
    inside one DB transaction. See app/services/betting.py.
    """

    __tablename__ = "coin_transactions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="profiles.id")
    delta: int  # +/- coins
    reason: TxReason
    market_id: UUID | None = Field(default=None, foreign_key="markets.id")
    created_at: datetime = Field(default_factory=now_utc, nullable=False)
