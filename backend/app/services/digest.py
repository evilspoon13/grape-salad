"""Digest generation — gather window content + one Anthropic call. TODO (M5)."""
from __future__ import annotations

from datetime import date

# When implementing, pull the key/model from app.config.settings
# (settings.ANTHROPIC_API_KEY, settings.ANTHROPIC_MODEL).

DIGEST_SYSTEM_PROMPT = (
    "You are the editor of a private newsletter for a tight-knit group of college friends "
    "now spread across cities. Turn the week's raw updates into a short, funny, warm digest "
    "in Markdown. Use their names, riff on inside-joke energy, keep it punchy."
)


async def generate_digest(session, period_start: date, period_end: date) -> str:
    """Gather posts (and voice-memo transcripts if present) in [period_start, period_end],
    make ONE Anthropic call, return Markdown. Persist + serialize happens in the router.

    Use the official Anthropic SDK with settings.ANTHROPIC_API_KEY and settings.ANTHROPIC_MODEL
    (default claude-opus-4-8). One call only — no chaining.
    """
    raise NotImplementedError("M5: gather window content and make one Anthropic call")
