from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel

from app.models.base import now_utc


class Post(SQLModel, table=True):
    __tablename__ = "posts"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    author_id: UUID = Field(foreign_key="profiles.id")
    content: str
    image_url: str | None = None
    created_at: datetime = Field(default_factory=now_utc, nullable=False)
