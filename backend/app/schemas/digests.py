from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel


class DigestGenerateIn(BaseModel):
    period_start: date | None = None
    period_end: date | None = None


class DigestOut(BaseModel):
    id: UUID
    period_start: date
    period_end: date
    content: str
    created_at: datetime
