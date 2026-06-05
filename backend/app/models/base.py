"""Shared column helpers for table models."""
from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import Field


def uuid_pk() -> UUID:
    """Default factory for UUID primary keys."""
    return uuid4()


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


# Convenience field definitions reused across models.
def pk_field() -> Field:
    return Field(default_factory=uuid4, primary_key=True)


def created_at_field() -> Field:
    return Field(default_factory=now_utc, nullable=False)
