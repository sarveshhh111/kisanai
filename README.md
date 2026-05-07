# 🌾 Kisan AI — AI-Powered Agricultural Assistant

> Smart farming companion for Indian farmers — built with React Native, FastAPI, Groq LLM & Google Gemini Vision.

## 🚀 Live Links

| Platform | URL | Status |
|---|---|---|
| 🌐 **Web App** | [mitkisanai.netlify.app](https://mitkisanai.netlify.app) | ✅ Live |
| ⚙️ **Backend API** | [kisanai-backend-qxqf.onrender.com](https://kisanai-backend-qxqf.onrender.com) | ✅ Live |
| 📦 **GitHub** | [github.com/sarveshhh111/kisanai](https://github.com/sarveshhh111/kisanai) | ✅ Public |

---

## ✨ Features

- 🤖 **AI Chatbot** — Ask any farming question in Hindi/English (Groq Llama 3.3-70B)
- 🌿 **Crop Disease Scanner** — Upload a photo, get instant diagnosis (Google Gemini Vision)
- 📊 **Mandi Prices** — Real-time market prices for Indian mandis
- 🌦️ **Weather Alerts** — Location-based weather updates
- 📱 **Firebase Phone Auth** — Secure OTP-based login
- 🔔 **Push Notifications** — Daily mandi & weather alerts via APScheduler
- 🇮🇳 **Multi-language** — Hindi, English, Marathi, Gujarati

---

## 🛠️ Tech Stack

### Frontend
- **React Native** (Expo 55) — Cross-platform (iOS, Android, Web)
- **NativeWind** — TailwindCSS for React Native
- **Zustand** — State management
- **Firebase** — Phone Authentication (OTP)
- **React Navigation** — Tab & Stack navigation

### Backend
- **FastAPI** (Python) — REST API
- **Groq** (`llama-3.3-70b-versatile`) — AI Chat
- **Google Gemini** (`gemini-2.5-flash`) — Vision/Image Analysis
- **APScheduler** — Scheduled mandi & weather alerts
- **SQLite** — Local database
- **Twilio** — WhatsApp bot integration

---

## 📦 Project Structure

```
kisanai/
├── src/
│   ├── screens/          # All app screens (Chat, Disease, Mandi, Weather, etc.)
│   ├── components/       # Reusable UI components
│   ├── services/         # API, Auth, Location, Weather services
│   ├── store/            # Zustand global state
│   └── navigation/       # App navigation config
├── backend/
│   ├── routes/           # FastAPI route handlers
│   ├── main.py           # App entry point
│   ├── database.py       # SQLite setup
│   ├── scheduler.py      # APScheduler jobs
│   ├── requirements.txt  # Python dependencies
│   └── Procfile          # Render deployment config
├── assets/               # Icons, splash screen
├── app.json              # Expo config
└── eas.json              # EAS Build config (Android APK)
```

---

## 🏃 Run Locally

### Frontend
```bash
npm install
npx expo start --web
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Variables
Create `backend/.env`:
```
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

Create `.env` in root:
```
EXPO_PUBLIC_API_URL=https://kisanai-backend-qxqf.onrender.com/v1
```

---

## 📱 Build Android APK

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

---

## 🚢 Deployment

| Service | Platform | Config |
|---|---|---|
| Frontend (Web) | Netlify | Drag & drop `dist/` folder |
| Backend (API) | Render | Root dir: `backend/`, auto-deploy from GitHub |
| Mobile | EAS Build | `eas build --platform android` |

---

## 👨‍💻 Developer

Built with ❤️ for Indian farmers by **Sarvesh Bhandari**
