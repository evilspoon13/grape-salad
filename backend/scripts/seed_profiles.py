"""Seed the friend group into `profiles`.

Run once after creating the schema:
    python -m scripts.seed_profiles

No auth yet — these UUIDs are what the frontend picks from and sends as X-User-Id.
"""
import asyncio

from sqlalchemy import select

from app.db import async_session
from app.models.profile import Profile

# Edit this list to match the actual friend group.
FRIENDS = [
    {"display_name": "Maya", "coin_balance": 1000},
    {"display_name": "Jake", "coin_balance": 1000},
    {"display_name": "Sam", "coin_balance": 1000},
    {"display_name": "Priya", "coin_balance": 1000},
]


async def main() -> None:
    async with async_session() as session:
        for friend in FRIENDS:
            existing = await session.scalar(
                select(Profile).where(Profile.display_name == friend["display_name"])
            )
            if existing:
                print(f"skip  {friend['display_name']} (exists: {existing.id})")
                continue
            profile = Profile(**friend)
            session.add(profile)
            await session.commit()
            await session.refresh(profile)
            print(f"added {profile.display_name}  id={profile.id}")


if __name__ == "__main__":
    asyncio.run(main())
