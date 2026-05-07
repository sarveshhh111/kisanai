import os
from dotenv import load_dotenv
from fastapi import APIRouter, Request, Response
from twilio.twiml.messaging_response import MessagingResponse
from groq import Groq
import time

load_dotenv()

router = APIRouter()

# Use Groq (same as chat.py) — no deprecated google.generativeai needed
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))

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

    # Generate Response using Groq Llama 3
    try:
        chat_response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Kisan AI, a highly knowledgeable and friendly agricultural assistant built for Indian farmers. "
                        "Respond in clear, easy-to-understand conversational Hindi written in Latin script (Hinglish). "
                        "Keep your advice practical, specific to Indian farming contexts, and concise (under 4 sentences) for WhatsApp."
                    )
                },
                {"role": "user", "content": message_body}
            ],
            max_tokens=256,
            temperature=0.7,
        )
        reply_text = chat_response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq WhatsApp Error: {e}")
        reply_text = "Maaf kijiye, server network me issue hai. Kripya thodi der baad message karein."

    # Construct Twilio TwiML Response
    resp = MessagingResponse()
    resp.message(reply_text)
    
    return Response(content=str(resp), media_type="application/xml")
