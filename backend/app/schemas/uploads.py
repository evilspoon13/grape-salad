from typing import Literal

from pydantic import BaseModel


class SignIn(BaseModel):
    kind: Literal["image", "audio"]
    content_type: str


class SignOut(BaseModel):
    upload_url: str  # frontend PUTs the file bytes here
    public_url: str  # send this back as image_url / audio_url on the create call
