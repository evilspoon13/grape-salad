from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel

from app.models.base import now_utc


class Profile(SQLModel, table=True):
    __tablename__ = "profiles"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    display_name: str
    avatar_url: str | None = None
    coin_balance: int = Field(default=0)
    # Future use: link to Supabase Auth once login lands. Kept nullable from day one so flipping
    # on real auth is one column add here, not a migration across every table.
    auth_id: str | None = None
    created_at: datetime = Field(default_factory=now_utc, nullable=False)
