import os
import re
import json
import time
import base64
from dotenv import load_dotenv
from google import genai
from google.genai import types
from fastapi import APIRouter
from pydantic import BaseModel

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", ""))

router = APIRouter()

MAX_IMAGE_B64_BYTES = 5 * 1024 * 1024  # 5 MB limit


class AnalyzeRequest(BaseModel):
    image_base64: str
    crop_name: str
    language: str = "hi"


def _extract_json(text: str) -> dict:
    """Robustly extract JSON from Gemini response that may be wrapped in markdown."""
    cleaned = re.sub(r"```(?:json)?\s*", "", text, flags=re.IGNORECASE).strip()
    cleaned = cleaned.rstrip("`").strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not parse JSON from Gemini response: {text[:200]}")


@router.post("/disease")
async def analyze_disease(request: AnalyzeRequest):
    # ── Size check ─────────────────────────────────────────────────────────────
    if len(request.image_base64.encode()) > MAX_IMAGE_B64_BYTES:
        return {"status": "error", "message": "Image bahut badi hai. 5MB se choti image use karein."}

    system_prompt = f"""
You are Kisan AI, an expert agricultural botanist for Indian farmers.
Analyze the provided image of a '{request.crop_name}' plant.
Determine the most likely disease or pest affecting it.
Respond in language code: {request.language}. For 'hi', use conversational Hinglish (Hindi in Latin script).

Return ONLY a valid JSON object — no extra text, no markdown — with EXACTLY these keys:
{{
    "diseaseName": "Common name of the disease",
    "confidence": 0.95,
    "severity": "Low/Medium/High/Critical",
    "scientificName": "Scientific name of pathogen",
    "treatment": "Practical treatment (2 sentences max, mention Indian product names if known).",
    "prevention": ["Tip 1", "Tip 2", "Tip 3"]
}}
"""

    for attempt in range(2):
        try:
            image_bytes = base64.b64decode(request.image_base64)
            image_part = types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg")
            
            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=[system_prompt, image_part],
            )
            result = _extract_json(response.text.strip())
            return {"status": "success", "data": result}

        except ValueError:
            if attempt == 0:
                time.sleep(1)
                continue
            return {
                "status": "success",
                "data": {
                    "diseaseName": f"{request.crop_name} Rog [Fallback]",
                    "confidence": 0.70,
                    "severity": "Medium",
                    "scientificName": "Unidentified pathogen",
                    "treatment": "Tebuconazole 25% WG ya Mancozeb 75% WP spray karein.",
                    "prevention": ["Pratirodhi kismein boyein.", "Niyamit fasal ka avlokan karein.", "Sinchai mein savdhan rahein."],
                },
            }
        except Exception as e:
            print(f"Gemini Vision Error (attempt {attempt+1}): {e}")
            if attempt == 0:
                time.sleep(1)
                continue
            error_str = str(e).lower()
            if '403' in error_str or 'denied' in error_str or 'unauthorized' in error_str or 'api_key' in error_str:
                return {
                    "status": "success",
                    "data": {
                        "diseaseName": f"{request.crop_name} (API Key Error)",
                        "confidence": 0.0,
                        "severity": "Unknown",
                        "scientificName": "API Key Invalid",
                        "treatment": "GEMINI_API_KEY check karein Render dashboard mein.",
                        "prevention": ["Naya API key generate karein."],
                    },
                }
            return {"status": "error", "message": "Abhi photo analyze karne mein samasya aayi. Thodi der baad try karein."}
