"""FastAPI app entrypoint: CORS + router includes + health check.

Swagger / OpenAPI (the live contract for the frontend) is served at /docs and /openapi.json.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import digests, markets, posts, profiles, uploads, voice_memos

app = FastAPI(
    title="Friends App API",
    version="0.1.0",
    description="Private social app for a friend group: digest, betting, voice memos. No auth yet.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  # includes X-User-Id
)

app.include_router(profiles.router)
app.include_router(posts.router)
app.include_router(voice_memos.router)
app.include_router(markets.router)
app.include_router(uploads.router)
app.include_router(digests.router)


@app.get("/api/health", tags=["meta"])
async def health():
    return {"status": "ok"}
