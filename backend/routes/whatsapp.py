import os
from dotenv import load_dotenv
from fastapi import APIRouter, Request, Response
from twilio.twiml.messaging_response import MessagingResponse
import google.generativeai as genai
import time

load_dotenv()

router = APIRouter()

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
model = genai.GenerativeModel('gemini-1.5-flash-latest')

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "")

# Webhook hit by Twilio when a user sends a WhatsApp message
@router.post("/webhook")
async def whatsapp_webhook(request: Request):
    # Twilio sends data as Form-URLEncoded, not JSON
    form_data = await request.form()
    
    sender_id = form_data.get('From', '')
    message_body = form_data.get('Body', '').strip()
    
    print(f"📲 WhatsApp Message from {sender_id}: {message_body}")
    
    if not message_body:
        return Response(content="<Response></Response>", media_type="application/xml")

    # Generate Response using Gemini
    try:
        system_prompt = """
You are Kisan AI, a highly knowledgeable and friendly agricultural assistant built for Indian farmers.
Respond in clear, easy-to-understand conversational Hindi written in Latin script (Hinglish).
Keep your advice practical, specific to Indian farming contexts, and concise (under 4 sentences) for WhatsApp.
        """
        full_prompt = f"{system_prompt}\n\nFarmer's Question: {message_body}\nResponse:"
        
        # Call Gemini (blocks Event Loop briefly, but acceptable for this text scale)
        ai_response = model.generate_content(full_prompt)
        reply_text = ai_response.text.strip()
    except Exception as e:
        print(f"Gemini API Error: {e}")
        reply_text = "Maaf kijiye, server network me issue hai. Kripya thodi der baad message karein."

    # Construct Twilio TwiML Response
    resp = MessagingResponse()
    resp.message(reply_text)
    
    return Response(content=str(resp), media_type="application/xml")

