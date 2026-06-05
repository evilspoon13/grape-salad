"""Unit tests for the pure parimutuel math (no DB)."""
from app.services.betting import compute_pools, implied_odds, payout_for


def test_pools_and_odds():
    pools = compute_pools([("yes", 120), ("no", 80)])
    assert pools.yes == 120 and pools.no == 80 and pools.total == 200
    yes, no = implied_odds(pools)
    assert yes == 0.6 and no == 0.4


def test_empty_market_odds_are_none():
    yes, no = implied_odds(compute_pools([]))
    assert yes is None and no is None


def test_payout_floor_rounding():
    # winning pool 120 (yes), total 200. A 50-coin winning bet:
    # floor(50/120*200) = floor(83.33) = 83
    assert payout_for(amount=50, winning_pool=120, total=200) == 83


def test_payout_sole_winner_takes_pot():
    # sole winner of a 200-coin pot gets it all back (modulo floor dust).
    assert payout_for(amount=100, winning_pool=100, total=200) == 200
