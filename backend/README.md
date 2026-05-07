# Kisan AI Backend (v1.0 Local)

This is the FastAPI backend for Kisan AI. It serves as the bridge between the Mobile Application, the AI Engine, and external communications (WhatsApp/SMS via MSG91/Twilio).

## Features
- `POST /v1/whatsapp/webhook`: Listens for incoming WhatsApp messages from farmers.
- `GET /v1/mandi`: Returns local Mandi Bhav prices.
- `POST /v1/chat`: Handles chat intelligence for the mobile application.

## Prerequisites
- Python 3.9+
- `pip`

## Quick Start
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI development server:
   ```bash
   python main.py
   ```
   (Alternatively, run `uvicorn main:app --reload --port 8000`)

## Connecting to the React Native App
Once the server is running on `http://localhost:8000`, open `kisanai/src/services/api.ts` in your React Native app and ensure the `API_BASE_URL` points to `http://localhost:8000/v1` or your local network IP (e.g. `http://192.168.1.5:8000/v1`) if running on a physical Android/iOS device.
