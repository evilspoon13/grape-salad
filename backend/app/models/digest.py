from datetime import date, datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel

from app.models.base import now_utc


class Digest(SQLModel, table=True):
    __tablename__ = "digests"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    period_start: date
    period_end: date
    content: str  # markdown
    created_at: datetime = Field(default_factory=now_utc, nullable=False)
