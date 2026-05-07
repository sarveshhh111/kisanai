from fastapi import APIRouter
from pydantic import BaseModel
from database import upsert_push_token
import logging

logger = logging.getLogger("kisan_ai")
router = APIRouter()


class TokenData(BaseModel):
    user_id: str
    expo_push_token: str
    location_lat: float | None = None
    location_lon: float | None = None
    language: str = 'hi'


@router.post("/register")
async def register_push_token(data: TokenData):
    """Store Expo push token to SQLite DB for scheduled alert delivery."""
    try:
        upsert_push_token(
            user_id=data.user_id,
            token=data.expo_push_token,
            lat=data.location_lat,
            lon=data.location_lon,
            language=data.language,
        )
        logger.info(f"✅ Push token registered for user: {data.user_id}")
        return {
            "status": "success",
            "message": "Push token saved. Aapko ab mandi aur mausam ke alerts milenge!",
        }
    except Exception as e:
        logger.error(f"Push token registration failed: {e}")
        return {"status": "error", "message": "Token save nahi ho paya."}
