"""Supabase Storage signed uploads — the ONE place we use the supabase-py client.

Everything else talks to Postgres directly over the pooler (see app/db.py).
"""
from __future__ import annotations

from app.schemas.uploads import SignOut

# Bucket layout: image/<uuid> and audio/<uuid>. Public-read for MVP (files are unguessable;
# real access control arrives with auth).
IMAGE_BUCKET = "images"
AUDIO_BUCKET = "audio"


def sign_upload(kind: str, content_type: str) -> SignOut:
    """Create a signed upload URL + the eventual public URL for a UUID-based object path.

    TODO (M2): use supabase-py create_signed_upload_url with SUPABASE_SERVICE_KEY.
    """
    raise NotImplementedError("M2: implement Supabase Storage signed upload")
