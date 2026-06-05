from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel

from app.models.base import now_utc


class VoiceMemo(SQLModel, table=True):
    __tablename__ = "voice_memos"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    author_id: UUID = Field(foreign_key="profiles.id")
    audio_url: str
    duration_seconds: int | None = None
    # Self-referential: a reply points at its parent memo; root memos have parent_id is null.
    parent_id: UUID | None = Field(default=None, foreign_key="voice_memos.id")
    transcript: str | None = None  # optional; skip for v1
    created_at: datetime = Field(default_factory=now_utc, nullable=False)
