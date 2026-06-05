"""Small shared response shapes."""
from uuid import UUID

from pydantic import BaseModel


class UserRef(BaseModel):
    """Embedded author/user reference used across post/market/memo responses."""
    id: UUID
    display_name: str
    avatar_url: str | None = None
