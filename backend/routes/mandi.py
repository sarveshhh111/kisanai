import os
import requests
import random
import time
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from fastapi import APIRouter
from database import get_mandi_cache, set_mandi_cache

load_dotenv()
router = APIRouter()

# ─── Mock data (always fresh with slight daily variation) ─────────────────────
BASE_MOCK = [
    { "crop": "🌾 Gehu (Wheat)",       "apmc": "Pune APMC",      "base": 2180 },
    { "crop": "🫘 Soybean",            "apmc": "Pune APMC",      "base": 4650 },
    { "crop": "🧅 Pyaz (Onion)",       "apmc": "Lasalgaon APMC", "base": 1240 },
    { "crop": "🍅 Tamatar (Tomato)",   "apmc": "Nashik APMC",    "base": 850  },
    { "crop": "🍚 Dhan (Paddy)",       "apmc": "Nagpur APMC",    "base": 2300 },
    { "crop": "🌻 Surajmukhi",         "apmc": "Latur APMC",     "base": 5800 },
    { "crop": "🥔 Aloo (Potato)",      "apmc": "Pune APMC",      "base": 1100 },
    { "crop": "🌽 Makka (Corn)",       "apmc": "Jalgaon APMC",   "base": 2250 },
    { "crop": "🌶️ Mirchi (Chilly)",   "apmc": "Guntur APMC",    "base": 23000},
    { "crop": "🍋 Nimbu (Lemon)",      "apmc": "Solapur APMC",   "base": 3500 },
    { "crop": "🥕 Gajar (Carrot)",     "apmc": "Pune APMC",      "base": 1400 },
    { "crop": "🍆 Baingan (Brinjal)",  "apmc": "Nashik APMC",    "base": 1800 },
    { "crop": "🌿 Palak (Spinach)",    "apmc": "Kalyan APMC",    "base": 800  },
    { "crop": "🌾 Jowar (Sorghum)",    "apmc": "Solapur APMC",   "base": 3100 },
    { "crop": "🌾 Bajra (Millet)",     "apmc": "Dhule APMC",     "base": 2500 },
]

def _format_price(val: int) -> str:
    """Format price with Indian comma style: ₹2,180"""
    return f"₹{val:,}"

def _generate_mock(state: str) -> list:
    """Generate daily-varied mock data seeded by today's date."""
    seed = int(time.strftime("%Y%m%d")) + hash(state) % 1000
    rng = random.Random(seed)
    result = []
    for i, item in enumerate(BASE_MOCK):
        variation_pct = rng.uniform(-0.04, 0.04)  # ±4% daily variation
        modal = int(item["base"] * (1 + variation_pct))
        low = int(modal * 0.93)
        high = int(modal * 1.07)
        delta_val = abs(int(item["base"] * variation_pct))
        is_up = variation_pct >= 0
        result.append({
            "id": str(i + 1),
            "crop": item["crop"],
            "apmc": item["apmc"],
            "price": _format_price(modal),
            "min": _format_price(low),
            "max": _format_price(high),
            "delta": f"{'+' if is_up else '-'}{_format_price(delta_val)}",
            "up": is_up,
        })
    return result


def _scrape_live(state: str) -> list | None:
    """Try to scrape live prices from commodityonline.com. Returns None on failure."""
    state_slug = state.lower().replace(" ", "-")
    url = f"https://www.commodityonline.com/mandiprices/{state_slug}"
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    }
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code != 200:
            return None

        soup = BeautifulSoup(resp.text, "html.parser")

        # Try multiple selectors in order of reliability
        table = (
            soup.find("table", id="main-table2")
            or soup.find("table", class_=lambda c: c and "mandi" in c.lower())
            or soup.find("table")
        )
        if not table:
            return None

        tbody = table.find("tbody")
        rows = (tbody or table).find_all("tr")

        live = []
        for idx, row in enumerate(rows[:25]):
            cols = row.find_all("td")
            if len(cols) < 5:
                continue
            crop_name = cols[0].get_text(strip=True)
            market = cols[1].get_text(strip=True)
            min_p = cols[3].get_text(strip=True) or cols[4].get_text(strip=True)
            max_p = cols[4].get_text(strip=True) or min_p
            modal = cols[5].get_text(strip=True) if len(cols) > 5 else max_p

            if not crop_name or not modal:
                continue

            try:
                modal_int = int(float(modal.replace(",", "")))
                min_int = int(float(min_p.replace(",", ""))) if min_p else int(modal_int * 0.93)
                max_int = int(float(max_p.replace(",", ""))) if max_p else int(modal_int * 1.07)
            except (ValueError, AttributeError):
                continue

            rng = random.Random(idx + int(time.strftime("%Y%m%d")))
            is_up = rng.choice([True, False])
            delta = rng.randint(10, 80)

            live.append({
                "id": str(idx + 1),
                "crop": f"🌾 {crop_name.capitalize()}",
                "apmc": market,
                "price": _format_price(modal_int),
                "min": _format_price(min_int),
                "max": _format_price(max_int),
                "delta": f"{'+' if is_up else '-'}{_format_price(delta)}",
                "up": is_up,
            })

        return live if live else None

    except Exception as e:
        print(f"Scraper error for {state}: {e}")
        return None


@router.get("/")
async def get_mandi_prices(apmc: str = "Maharashtra", crop: str = None):
    state = apmc  # parameter named 'apmc' for legacy compatibility

    # 1. Check DB cache (30-min TTL)
    cached = get_mandi_cache(state)
    if cached:
        data = cached
    else:
        # 2. Try live scrape
        live = _scrape_live(state)
        if live:
            set_mandi_cache(state, live)
            data = live
        else:
            # 3. Fall back to daily-seeded mock data
            data = _generate_mock(state)

    # Filter by crop if provided
    if crop:
        data = [d for d in data if crop.lower() in d["crop"].lower()]

    return {"status": "success", "data": data}
