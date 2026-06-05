from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.common import UserRef


class VoiceMemoCreate(BaseModel):
    audio_url: str
    duration_seconds: int | None = None
    parent_id: UUID | None = None


class VoiceMemoOut(BaseModel):
    id: UUID
    author: UserRef
    audio_url: str
    duration_seconds: int | None = None
    reply_count: int = 0
    created_at: datetime


class VoiceThreadOut(BaseModel):
    root: VoiceMemoOut
    replies: list[VoiceMemoOut]
