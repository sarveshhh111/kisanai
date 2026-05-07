import { useStore } from '../store/useStore';

// Use deployed backend URL in production, localhost for local dev.
// Set EXPO_PUBLIC_API_URL in your .env file after deploying to Railway/Render.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/v1';

export const KisanAPI = {
  /**
   * Fetches the latest Mandi prices from the Python Scraper
   * @param apmc The name of the Mandi state/location
   */
  async getMandiPrices(apmc: string = 'Maharashtra') {
    try {
      const response = await fetch(`${API_BASE_URL}/mandi?apmc=${apmc}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const json = await response.json();
      if (json.status === 'success') return json.data;
      return null;
    } catch (error) {
      console.error('Failed to fetch from live scraper. Falling back to internal data.', error);
      return null;
    }
  },

  /**
   * Sends an image to the backend for GenAI Disease Analysis using Gemini Vision
   */
  async analyzeCropImage(imageBase64: string, cropName: string = 'gehu') {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze/disease`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image_base64: imageBase64, 
          crop_name: cropName,
          language: useStore.getState().profile.language 
        })
      });
      
      if (!response.ok) throw new Error('Failed to analyze image');
      
      const json = await response.json();
      if (json.status === 'success') {
        return json.data;
      } else {
        throw new Error(json.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Failed to analyze disease:', error);
      // Fallback realistic response for UI preview if backend is down
      return {
        diseaseName: 'Leaf Rust (Patton ka Rog) [Fallback]',
        confidence: 0.92,
        severity: 'High',
        scientificName: 'Puccinia triticina',
        treatment: 'Tebuconazole 25% WG ko 1 ml per liter paani mein milakar spray karein.',
        prevention: ['Pratirodhi kismein boyein.', 'Sinchai sambhal kar karein.']
      };
    }
  },

  /**
   * Sends user chat query to conversational AI engine
   */
  async sendChatQuery(text: string, language?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, language: language || useStore.getState().profile.language })
      });
      
      if (!response.ok) {
         throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      return { reply: data.reply };
      
    } catch (error) {
       console.error('Chat AI failed:', error);
       return { reply: 'Maaf kijiye, abhi server se sampark karne mein problem aayi hai. Backend chalu hai ya nahi check karein.' };
    }
  },

  /**
   * Registers Expo Push Token to Python Backend for Alerts
   */
  async registerPushToken(token: string) {
    try {
      await fetch(`${API_BASE_URL}/notifications/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: useStore.getState().profile.name.replace(/\s+/g, '_') || 'GUEST_USER', 
          expo_push_token: token 
        })
      });
    } catch(e) {
      console.error('Failed to register push token with backend:', e);
    }
  }
};
