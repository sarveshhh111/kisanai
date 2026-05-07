import { useStore } from '../store/useStore';

type Translations = {
  [key: string]: {
    en: string;
    hi: string;
    mr: string;
    gu: string;
  };
};

// Application static strings translations dictionary
export const translations: Translations = {
  // Navigation & Tabs
  home: { en: 'Home', hi: 'Mukhya', mr: 'Mukhya', gu: 'Mukhya' },
  yojana: { en: 'Schemes', hi: 'Yojana', mr: 'Yojana', gu: 'Yojana' },
  chat: { en: 'Chat', hi: 'Chat', mr: 'Chat', gu: 'Chat' },
  profile: { en: 'Profile', hi: 'Profile', mr: 'Profile', gu: 'Profile' },
  
  // Home Screen
  namaste: { en: 'Namaste,', hi: 'Namaste,', mr: 'Namaskar,', gu: 'Namaste,' },
  chance_rain: { en: '% chance rain', hi: '% baarish ki aashanka', mr: '% paawsachi shakyata', gu: '% varsadni shakyata' },
  realtime: { en: '(Realtime)', hi: '(Realtime)', mr: '(Realtime)', gu: '(Realtime)' },
  weather_loading: { en: 'Loading weather...', hi: 'Mausam load ho raha hai...', mr: 'Hawaaman load hot ahe...', gu: 'Havaaman load thai rahyu chhe...' },
  fasal_salah: { en: 'Crop\nAdvice', hi: 'Fasal\nSalah', mr: 'Pik\nSalla', gu: 'Pak\nSalah' },
  mandi_bhav: { en: 'Market\nPrices', hi: 'Mandi\nBhav', mr: 'Bajar\nBhav', gu: 'Mandi\nBhav' },
  sarkari_yojana: { en: 'Govt\nSchemes', hi: 'Sarkari\nYojana', mr: 'Sarkari\nYojana', gu: 'Sarkari\nYojana' },
  kida_rog: { en: 'Pest&\nDisease', hi: 'Kida\nRog', mr: 'Keed\nRog', gu: 'Jivat\nRog' },
  ask_kisan_ai: { en: 'Ask Kisan AI', hi: 'Kisan AI se poochein', mr: 'Kisan AI la vichara', gu: 'Kisan AI ne pucho' },
  todays_mandi: { en: 'Today\'s Mandi Prices', hi: 'Aaj ke Mandi Bhav', mr: 'Aajche Bajar Bhav', gu: 'Aajna Mandi Bhav' },
  see_all: { en: 'See all >', hi: 'Sab dekho >', mr: 'Sarva paha >', gu: 'Badhu juo >' },
  weather_alert: { en: 'Weather Alert', hi: 'Mausam Alert', mr: 'Hawaaman Alert', gu: 'Havaaman Alert' },
  
  // Weather
  humidity: { en: 'Humidity', hi: 'Nami (Nami)', mr: 'Aardrata', gu: 'Bhej' },
  wind: { en: 'Wind', hi: 'Hawa', mr: 'Vaara', gu: 'Pavan' },
  forecast: { en: '7-Day Forecast', hi: '7-Din ka Mausam', mr: '7-Divsacha Andaz', gu: '7-Divas nu Havaaman' },
  
  // Mandi
  search_crop: { en: 'Search crop or market...', hi: 'Fasal ya mandi dhoondhein...', mr: 'Pik kinva bajar shodha...', gu: 'Pak ke mandi shodho...' },
  min: { en: 'Min', hi: 'Kamti', mr: 'Kiman', gu: 'Ochhu' },
  max: { en: 'Max', hi: 'Jyada', mr: 'Kamal', gu: 'Vadhare' },
  modal: { en: 'Modal', hi: 'Ausat', mr: 'Sarasari', gu: 'Sarasari' },
  
  // Disease
  scan_photo: { en: 'Take a photo or upload here', hi: 'Fasal ki photo lo ya upload karo', mr: 'Pikacha photo ghya kinva upload kara', gu: 'Pakno photo lo athva upload karo' },
  scanning: { en: 'Searching for disease...', hi: 'Bimari dhoondh rahe hain...', mr: 'Aajar shodh at ahe...', gu: 'Rog shodhi rahya chhiye...' },
  or: { en: 'OR', hi: 'YA', mr: 'KINVA', gu: 'ATHVA' },
  select_crop: { en: 'Select Crop', hi: 'Fasal Chunein', mr: 'Pik Nivda', gu: 'Pak Pasand Karo' },
  treatment: { en: 'Full Treatment Plan', hi: 'Pura Upaay (Treatment)', mr: 'Purna Upay Yojna', gu: 'Sampurna Upay Yojna' },
  chemical: { en: 'Chemical Medicine', hi: 'Rasayanik Dawai (Chemical)', mr: 'Rasayanik Aushadh', gu: 'Rasayanik Dava' },
  dosage: { en: 'Dosage', hi: 'Matra (Doze)', mr: 'Praman', gu: 'Praman' },
  buy_medicine: { en: 'Buy Medicine', hi: 'Dawai Khareedein', mr: 'Aushadh Kharedi Kara', gu: 'Dava Kharido' },
  prevention: { en: 'Prevention tips', hi: 'Bachaav (Prevention tips)', mr: 'Pratibandhak Upay', gu: 'Aatkavna Upayo' },
  take_new_photo: { en: '← Take new photo', hi: '← Nayi photo lo', mr: '← Navin photo ghya', gu: '← Navo photo lo' },
  
  // Profile
  farm_details: { en: 'Farm Details', hi: 'Khet ki Jaankari', mr: 'Shetichi Mahiti', gu: 'Khetarini Mahiti' },
  edit: { en: 'Edit', hi: 'Edit', mr: 'Edit', gu: 'Edit' },
  land: { en: 'Land', hi: 'Zameen', mr: 'Jamin', gu: 'Jamin' },
  crop: { en: 'Crops', hi: 'Fasal', mr: 'Pike', gu: 'Pak' },
  soil: { en: 'Soil', hi: 'Mitti', mr: 'Mati', gu: 'Mati' },
  settings: { en: 'Settings', hi: 'Settings', mr: 'Settings', gu: 'Settings' },
  language: { en: 'Language', hi: 'Bhasha', mr: 'Bhasha', gu: 'Bhasha' },
  weather_alerts_on: { en: 'Weather Alerts', hi: 'Mausam Alerts', mr: 'Hawaaman Alerts', gu: 'Havaaman Alerts' },
  mandi_alerts_on: { en: 'Mandi Alerts', hi: 'Mandi Bhav Alerts', mr: 'Bajar Bhav Alerts', gu: 'Mandi Bhav Alerts' },
  history: { en: 'History', hi: 'Pichle Sawaal', mr: 'Itihas', gu: 'Itihas' },
  free_plan: { en: 'Free Plan', hi: 'Free Plan 🆓', mr: 'Free Plan 🆓', gu: 'Free Plan 🆓' },
  questions_left: { en: 'Ask 5 AI questions daily.', hi: 'Roz 5 AI sawaal pooch sakte hain.', mr: 'Darroj 5 AI prashna vichara.', gu: 'Roj 5 AI prashno pucho.' },
  upgrade: { en: 'Upgrade', hi: 'Upgrade', mr: 'Upgrade', gu: 'Upgrade' }
};

/**
 * Custom hook for instantaneous string translations based on global Zustand profile language
 */
export const useTranslation = () => {
  const language = useStore((state) => state.profile.language) || 'hi';
  
  const t = (key: keyof typeof translations): string => {
    if (!translations[key]) return String(key);
    return translations[key][language as 'en' | 'hi' | 'mr' | 'gu'] || translations[key]['hi'];
  };

  return { t, language };
};
