from uuid import UUID

from pydantic import BaseModel, Field


class ProfileOut(BaseModel):
    id: UUID
    display_name: str
    avatar_url: str | None = None
    coin_balance: int


class GrantIn(BaseModel):
    amount: int = Field(..., gt=0)
