"""
APScheduler cron jobs for Kisan AI.
Sends morning mandi alerts (6 AM) and evening weather alerts (6 PM)
to all registered push token holders via the Expo Push Service.
"""
import httpx
import asyncio
import logging
from database import get_all_push_tokens, get_mandi_cache

logger = logging.getLogger("kisan_scheduler")

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


async def _send_expo_notifications(messages: list[dict]):
    """Batch send to Expo Push Service (max 100 per request)."""
    if not messages:
        return
    # Expo recommends batches of ≤ 100
    for i in range(0, len(messages), 100):
        batch = messages[i : i + 100]
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(
                    EXPO_PUSH_URL,
                    json=batch,
                    headers={
                        "Accept": "application/json",
                        "Accept-Encoding": "gzip, deflate",
                        "Content-Type": "application/json",
                    },
                )
                logger.info(f"Expo push sent {len(batch)} messages: {resp.status_code}")
        except Exception as e:
            logger.error(f"Expo push batch failed: {e}")


async def send_morning_mandi_alerts():
    """6:00 AM — send top 3 mandi prices to all registered farmers."""
    logger.info("📊 Running morning mandi alert job...")
    tokens = get_all_push_tokens()
    if not tokens:
        return

    # Get cached mandi data for Maharashtra (most common)
    prices = get_mandi_cache("Maharashtra") or []
    if not prices:
        return

    top3 = prices[:3]
    price_lines = " | ".join([f"{p['crop'].split()[-1]}: {p['price']}" for p in top3])
    body = f"Aaj ke bhav: {price_lines} 📈"

    messages = [
        {
            "to": t["expo_push_token"],
            "title": "🌾 Kisan AI — Aaj ke Mandi Bhav",
            "body": body,
            "sound": "default",
            "data": {"screen": "Mandi"},
        }
        for t in tokens
        if t["expo_push_token"] and not t["expo_push_token"].startswith("SIMULATED")
    ]
    await _send_expo_notifications(messages)


async def send_evening_weather_alerts():
    """6:00 PM — fetch Open-Meteo for all farmer locations and send rain alerts."""
    logger.info("🌧️ Running evening weather alert job...")
    tokens = get_all_push_tokens()
    if not tokens:
        return

    messages = []
    async with httpx.AsyncClient(timeout=15) as client:
        for t in tokens:
            if not t["expo_push_token"] or t["expo_push_token"].startswith("SIMULATED"):
                continue
            lat = t.get("location_lat") or 18.5204
            lon = t.get("location_lon") or 73.8567
            try:
                url = (
                    f"https://api.open-meteo.com/v1/forecast"
                    f"?latitude={lat}&longitude={lon}"
                    f"&daily=precipitation_probability_max,weather_code"
                    f"&timezone=auto&forecast_days=2"
                )
                resp = await client.get(url)
                data = resp.json()
                tomorrow_rain = data["daily"]["precipitation_probability_max"][1]
                if tomorrow_rain > 60:
                    messages.append({
                        "to": t["expo_push_token"],
                        "title": "🌧️ Kisan AI — Kal Baarish Alert",
                        "body": f"Kal {tomorrow_rain}% baarish ki sambhavna hai. Apni fasal aur katai ka dhyan rakhein!",
                        "sound": "default",
                        "data": {"screen": "Weather"},
                    })
            except Exception as e:
                logger.warning(f"Weather check failed for token {t['user_id']}: {e}")

    await _send_expo_notifications(messages)
