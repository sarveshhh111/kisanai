import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { kisanStorage } from '../services/storage';
import { KisanAPI } from '../services/api';
import { fetchRealWeather } from '../services/weather';
import { getCurrentLocation, type UserLocation } from '../services/location';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  location: string;
  language: 'hi' | 'en' | 'mr' | 'gu';
  landSize: string;
  crops: string[];
  soilType: string;
}

interface AppState {
  // Hydration
  _hydrated: boolean;
  setHydrated: () => void;

  // User Data
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;

  // Auth
  isLoggedIn: boolean;
  setLoggedIn: (val: boolean) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  isTyping: boolean;
  setTyping: (typing: boolean) => void;

  // Mandi
  mandiPrices: any[];
  allMandiPrices: any[];
  selectedState: string;
  selectedApmc: string;
  fetchMandiPrices: (query?: string, state?: string, apmc?: string) => Promise<void>;

  // Weather
  weatherData: any;
  userLocation: UserLocation | null;
  fetchLocation: () => Promise<void>;
  fetchWeather: (lat: number, lon: number) => Promise<void>;
}

const MOCK_MANDI: any[] = [
  { id: '1', crop: '🌾 Gehu (Wheat)', apmc: 'Pune APMC', price: '₹2,180', min: '₹2,100', max: '₹2,250', delta: '+₹30', up: true },
  { id: '2', crop: '🫘 Soybean', apmc: 'Pune APMC', price: '₹4,650', min: '₹4,500', max: '₹4,800', delta: '-₹15', up: false },
  { id: '3', crop: '🧅 Pyaz (Onion)', apmc: 'Lasalgaon APMC', price: '₹1,240', min: '₹1,100', max: '₹1,450', delta: '+₹80', up: true },
  { id: '4', crop: '🍅 Tamatar (Tomato)', apmc: 'Nashik APMC', price: '₹850', min: '₹700', max: '₹950', delta: '-₹40', up: false },
  { id: '5', crop: '🍚 Dhan (Paddy)', apmc: 'Nagpur APMC', price: '₹2,300', min: '₹2,150', max: '₹2,400', delta: '+₹50', up: true },
  { id: '6', crop: '🌻 Surajmukhi (Sunflower)', apmc: 'Latur APMC', price: '₹5,800', min: '₹5,600', max: '₹6,100', delta: '+₹120', up: true },
  { id: '7', crop: '🥔 Aloo (Potato)', apmc: 'Pune APMC', price: '₹1,100', min: '₹900', max: '₹1,300', delta: '-₹20', up: false },
  { id: '8', crop: '🌽 Makka (Corn)', apmc: 'Jalgaon APMC', price: '₹2,250', min: '₹2,100', max: '₹2,400', delta: '+₹15', up: true },
  { id: '9', crop: '🌶️ Mirchi (Chilly)', apmc: 'Guntur APMC', price: '₹23,000', min: '₹21,000', max: '₹25,000', delta: '-₹500', up: false },
  { id: '10', crop: '🍋 Nimbu (Lemon)', apmc: 'Solapur APMC', price: '₹3,500', min: '₹3,000', max: '₹4,000', delta: '+₹200', up: true },
  { id: '11', crop: '🥕 Gajar (Carrot)', apmc: 'Pune APMC', price: '₹1,400', min: '₹1,200', max: '₹1,600', delta: '+₹10', up: true },
  { id: '12', crop: '🍆 Baingan (Brinjal)', apmc: 'Nashik APMC', price: '₹1,800', min: '₹1,500', max: '₹2,000', delta: '-₹60', up: false },
  { id: '13', crop: '🌿 Palak (Spinach)', apmc: 'Kalyan APMC', price: '₹800', min: '₹600', max: '₹1,000', delta: '+₹5', up: true },
  { id: '14', crop: '🌾 Jowar (Sorghum)', apmc: 'Solapur APMC', price: '₹3,100', min: '₹2,900', max: '₹3,300', delta: '+₹40', up: true },
  { id: '15', crop: '🌾 Bajra (Millet)', apmc: 'Dhule APMC', price: '₹2,500', min: '₹2,400', max: '₹2,700', delta: '-₹10', up: false },
];

const INITIAL_BOT_MESSAGE: ChatMessage = {
  id: 'msg-1',
  text: 'Namaste! Main Kisan AI hoon. Aaj main aapki kya madad kar sakta hoon? Fasal, mandi bhav, ya mausam — kuch bhi poochein! 🌾',
  sender: 'bot',
  timestamp: new Date().toISOString(),
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      _hydrated: false,
      setHydrated: () => set({ _hydrated: true }),

      profile: {
        name: 'Kisan Ji',
        phone: '',
        location: 'Pune, MH',
        language: 'hi',
        landSize: '2.5',
        crops: ['Gehu', 'Pyaz'],
        soilType: 'Black Soil',
      },
      setProfile: (newProfile) =>
        set((state) => ({ profile: { ...state.profile, ...newProfile } })),

      isLoggedIn: false,
      setLoggedIn: (val) => set({ isLoggedIn: val }),

      messages: [INITIAL_BOT_MESSAGE],
      isTyping: false,
      setTyping: (isTyping) => set({ isTyping }),
      clearMessages: () => set({ messages: [INITIAL_BOT_MESSAGE] }),

      addMessage: async (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));

        if (message.sender === 'user') {
          set({ isTyping: true });
          try {
            const response = await KisanAPI.sendChatQuery(
              message.text,
              get().profile.language
            );
            set({ isTyping: false });
            // Only call addMessage for bot without triggering AI again
            const botMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              text: response.reply,
              sender: 'bot',
              timestamp: new Date().toISOString(),
            };
            set((state) => ({ messages: [...state.messages, botMsg] }));
          } catch {
            set({ isTyping: false });
            const errMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              text: 'Maaf kijiye, abhi server se sampark nahi ho pa raha. Thodi der baad try karein.',
              sender: 'bot',
              timestamp: new Date().toISOString(),
            };
            set((state) => ({ messages: [...state.messages, errMsg] }));
          }
        }
      },

      mandiPrices: MOCK_MANDI,
      allMandiPrices: MOCK_MANDI,
      selectedState: 'Maharashtra',
      selectedApmc: 'Sabhi Mandi',

      fetchMandiPrices: async (query?: string, state?: string, apmc?: string) => {
        const targetState = state ?? get().selectedState;
        if (state) set({ selectedState: state });
        if (apmc) set({ selectedApmc: apmc });

        try {
          const apiData = await KisanAPI.getMandiPrices(targetState);
          if (apiData && Array.isArray(apiData) && apiData.length > 0) {
            set({ allMandiPrices: apiData });
          }
        } catch {
          // Silently fall back to mock data
        }

        const base = get().allMandiPrices;
        let filtered = base;

        if (query && query.trim()) {
          const q = query.toLowerCase();
          filtered = base.filter(
            (item) =>
              item.crop.toLowerCase().includes(q) ||
              item.apmc.toLowerCase().includes(q)
          );
        }

        if (apmc && apmc !== 'Sabhi Mandi') {
          filtered = filtered.filter((item) =>
            item.apmc.toLowerCase().includes(apmc.toLowerCase())
          );
        }

        set({ mandiPrices: filtered });
      },

      userLocation: null,
      weatherData: null,

      fetchLocation: async () => {
        try {
          const loc = await getCurrentLocation();
          set({ userLocation: loc });
          set((state) => ({
            profile: { ...state.profile, location: loc.city },
          }));
          await get().fetchWeather(loc.lat, loc.lon);
        } catch (error) {
          console.error('fetchLocation failed', error);
          // Fall back to Pune
          await get().fetchWeather(18.5204, 73.8567);
        }
      },

      fetchWeather: async (lat: number, lon: number) => {
        try {
          const data = await fetchRealWeather(lat, lon);
          set({ weatherData: data });
        } catch (error) {
          console.error('Weather fetch failed:', error);
        }
      },
    }),
    {
      name: 'kisan-ai-storage',
      storage: createJSONStorage(() => kisanStorage),
      partialize: (state) => ({
        profile: state.profile,
        isLoggedIn: state.isLoggedIn,
        messages: state.messages.slice(-50),
        selectedState: state.selectedState,
        selectedApmc: state.selectedApmc,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
