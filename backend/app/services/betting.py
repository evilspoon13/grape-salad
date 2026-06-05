"""Betting logic: parimutuel pool math (pure) + transactional balance ops (TODO M3).

The pure helpers below are fully specified and unit-tested (see tests/test_betting_math.py).
The transactional functions are the heart of the money-integrity rules — implement them in M3.
"""
from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass


@dataclass(frozen=True)
class PoolMath:
    yes: int
    no: int

    @property
    def total(self) -> int:
        return self.yes + self.no


def compute_pools(positions_amounts: Iterable[tuple[str, int]]) -> PoolMath:
    """Sum staked amounts into yes/no pools. Input: iterable of (position, amount)."""
    yes = sum(amt for pos, amt in positions_amounts if pos == "yes")
    no = sum(amt for pos, amt in positions_amounts if pos == "no")
    return PoolMath(yes=yes, no=no)


def implied_odds(pools: PoolMath) -> tuple[float | None, float | None]:
    """Return (yes_prob, no_prob). When the market is empty, both are None."""
    if pools.total == 0:
        return None, None
    return pools.yes / pools.total, pools.no / pools.total


def payout_for(amount: int, winning_pool: int, total: int) -> int:
    """Parimutuel payout for one winning bet: floor(amount / winning_pool * total).

    Caller must guarantee winning_pool > 0 (the winning_pool == 0 case is a full refund,
    handled separately in resolve_market).
    """
    return (amount * total) // winning_pool


# --------------------------------------------------------------------------------------
# Transactional operations — TODO (M3). Each must run in ONE transaction, locking the
# affected profile rows with SELECT ... FOR UPDATE, and write the balance change together
# with the matching coin_transactions ledger row. Never touch balance without a ledger row.
# --------------------------------------------------------------------------------------

async def grant_coins(session, profile_id, amount: int):
    """Grant coins: lock profile, += amount, insert `grant` ledger row. One transaction."""
    raise NotImplementedError("M3: implement grant in one transaction with FOR UPDATE lock")


async def place_bet(session, market_id, user, bet_in):
    """Escrow a bet: 400 if balance < amount, 409 if market not open. Debit balance,
    insert bet + `bet_stake` (-amount) ledger row. One transaction, FOR UPDATE the bettor."""
    raise NotImplementedError("M3: implement place_bet in one transaction")


async def resolve_market(session, market_id, resolver, outcome: str):
    """Resolve + pay out. 409 if already resolved. If winning_pool == 0, refund every stake.
    Else credit each winning bet floor(amount/winning_pool*total) with a `bet_payout` ledger
    row. Set status/outcome/resolved_by/resolved_at. One transaction, lock all paid profiles."""
    raise NotImplementedError("M3: implement resolve_market in one transaction")
