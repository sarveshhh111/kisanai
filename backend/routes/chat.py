import os
import time
import hashlib
from collections import defaultdict
from dotenv import load_dotenv
from groq import Groq
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))

router = APIRouter()

# ─── Rate Limiting (in-memory, per IP) ────────────────────────────────────────
_rate_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT = 30       # requests per hour per IP
RATE_WINDOW = 3600    # 1 hour in seconds

def _check_rate_limit(ip: str) -> bool:
    now = time.time()
    cutoff = now - RATE_WINDOW
    _rate_store[ip] = [t for t in _rate_store[ip] if t > cutoff]
    if len(_rate_store[ip]) >= RATE_LIMIT:
        return False
    _rate_store[ip].append(now)
    return True

# ─── Response Cache (5-minute TTL for identical queries) ─────────────────────
_response_cache: dict[str, tuple[str, float]] = {}
CACHE_TTL = 300  # 5 minutes

def _cache_key(query: str, language: str) -> str:
    return hashlib.md5(f"{language}:{query.strip().lower()}".encode()).hexdigest()

def _get_cached(query: str, language: str) -> str | None:
    key = _cache_key(query, language)
    if key in _response_cache:
        reply, ts = _response_cache[key]
        if time.time() - ts < CACHE_TTL:
            return reply
    return None

def _set_cache(query: str, language: str, reply: str):
    key = _cache_key(query, language)
    _response_cache[key] = (reply, time.time())


class ChatRequest(BaseModel):
    query: str
    language: str = "hi"


@router.post("")
async def chat_with_ai(request: ChatRequest, req: Request):
    # ── Input sanitization ────────────────────────────────────────────────────
    query = request.query.strip()[:500]  # Hard limit: 500 chars
    if not query:
        return JSONResponse(status_code=400, content={"reply": "Kripaya apna sawaal likhein."})

    # ── Rate limiting ─────────────────────────────────────────────────────────
    client_ip = req.headers.get("X-Forwarded-For", req.client.host if req.client else "unknown")
    if not _check_rate_limit(client_ip):
        return JSONResponse(
            status_code=429,
            content={"reply": "Aapne bahut saare sawaal pooche hain. 1 ghante baad try karein."},
        )

    # ── Cache lookup ──────────────────────────────────────────────────────────
    cached = _get_cached(query, request.language)
    if cached:
        return {"reply": cached, "cached": True, "processing_time_ms": 0}

    # ── Gemini call ───────────────────────────────────────────────────────────
    start = time.time()
    try:
        lang_instruction = {
            "hi": "Hindi mein jawab dein (Hinglish/Latin script mein, easy-to-read).",
            "en": "Reply in clear Indian English.",
            "mr": "Marathi mein jawab dein (Latin script theek hai).",
            "gu": "Gujarati mein jawab dein (Latin script theek hai).",
        }.get(request.language, "Hindi mein jawab dein.")

        system_prompt = f"""You are Kisan AI, a highly knowledgeable and warm agricultural assistant for Indian farmers.
{lang_instruction}
Keep answers practical, India-specific, and concise (max 4 sentences).
If asked about mandi prices, say real-time prices are available in the Mandi tab of the app.
If asked about weather, say real-time weather is in the Weather tab."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query}
            ],
            temperature=0.6,
            max_tokens=300
        )
        reply = response.choices[0].message.content.strip()

        _set_cache(query, request.language, reply)
        ms = int((time.time() - start) * 1000)
        return {"reply": reply, "cached": False, "processing_time_ms": ms}

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Groq Chat Error: {e}")
        error_str = str(e).lower()
        if '403' in error_str or 'denied access' in error_str or 'unauthorized' in error_str:
            mock_reply = "Namaste! Mera AI access abhi block ho gaya hai. Kripya apni GROQ_API_KEY check karein."
            return {"reply": mock_reply, "cached": False, "processing_time_ms": 0}
        
        return {"reply": "Maaf kijiye, abhi server mein kuch samasya aayi. Thodi der baad try karein."}
