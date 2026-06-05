"""Signed uploads to Supabase Storage. Milestone M2."""
from fastapi import APIRouter, HTTPException

from app.schemas.uploads import SignIn, SignOut

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


@router.post("/sign", response_model=SignOut, summary="Get a signed upload URL")
async def sign(body: SignIn):
    # TODO M2: services.storage.sign_upload. Frontend PUTs the file to upload_url,
    # then sends public_url back as image_url/audio_url on the relevant create call.
    raise HTTPException(status_code=501, detail="Not implemented (M2)")
