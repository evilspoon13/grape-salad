from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.common import UserRef


class PostCreate(BaseModel):
    content: str
    image_url: str | None = None


class PostOut(BaseModel):
    id: UUID
    author: UserRef
    content: str
    image_url: str | None = None
    created_at: datetime
