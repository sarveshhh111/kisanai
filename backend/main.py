import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from routes import whatsapp, mandi, chat, analyze, notifications
from database import init_db
from scheduler import send_morning_mandi_alerts, send_evening_weather_alerts
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kisan_ai")

scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ─────────────────────────────────────────
    init_db()
    logger.info("✅ Database initialized")

    # Cron jobs (IST timezone)
    scheduler.add_job(send_morning_mandi_alerts, 'cron', hour=6, minute=0, id='morning_mandi')
    scheduler.add_job(send_evening_weather_alerts, 'cron', hour=18, minute=0, id='evening_weather')
    scheduler.start()
    logger.info("✅ Scheduler started (mandi@6AM, weather@6PM IST)")

    yield

    # ── Shutdown ─────────────────────────────────────────
    scheduler.shutdown(wait=False)
    logger.info("Scheduler stopped")


app = FastAPI(
    title="Kisan AI Backend",
    description="API for Kisan AI Mobile App — Chat, Mandi, Weather Alerts & WhatsApp Bot",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request timing middleware
@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    start = time.time()
    try:
        response = await call_next(request)
    except Exception as exc:
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})
    duration_ms = int((time.time() - start) * 1000)
    response.headers["X-Process-Time-Ms"] = str(duration_ms)
    return response

# Routers
app.include_router(whatsapp.router, prefix="/v1/whatsapp", tags=["WhatsApp"])
app.include_router(chat.router, prefix="/v1/chat", tags=["Chat"])
app.include_router(mandi.router, prefix="/v1/mandi", tags=["Mandi"])
app.include_router(analyze.router, prefix="/v1/analyze", tags=["Vision"])
app.include_router(notifications.router, prefix="/v1/notifications", tags=["Push Alerts"])

@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "Kisan AI API v2.0 is running",
        "scheduler": "running" if scheduler.running else "stopped",
    }

@app.api_route("/health", methods=["GET", "HEAD"])
def health_ping():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
