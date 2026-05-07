// Maps Open-Meteo WMO weather codes to Ionicons
const getWeatherIcon = (code: number): string => {
  if (code === 0) return 'sunny';
  if (code >= 1 && code <= 3) return 'partly-sunny';
  if (code >= 45 && code <= 48) return 'cloud'; // Fog
  if (code >= 51 && code <= 67) return 'rainy'; // Rain
  if (code >= 71 && code <= 77) return 'snow';  // Snow
  if (code >= 80 && code <= 82) return 'rainy'; // Showers
  if (code >= 95 && code <= 99) return 'thunderstorm'; // Thunderstorm
  return 'partly-sunny';
};

const getWeatherDescription = (code: number, lang: string = 'hi'): string => {
  const map: Record<number, string> = {
    0: 'Chamakdar Dhoop',
    1: 'Halke Baadal',
    2: 'Kuch Baadal',
    3: 'Ghane Baadal',
    45: 'Kohra (Fog)',
    48: 'Jame hue Kohra',
    51: 'Halki Boondabaandi',
    53: 'Samanya Boondabaandi',
    55: 'Tez Boondabaandi',
    61: 'Halki Baarish',
    63: 'Samanya Baarish',
    65: 'Tez Baarish',
    80: 'Barrish ke Chhinte',
    81: 'Tez Barrish ke Chhinte',
    82: 'Bohot Tez Baarish',
    95: 'Aandhi aur Toofan',
  };
  
  // Find closest match or return default
  const match = map[code];
  if (match) return match;
  
  if (code > 50 && code < 90) return 'Baarish';
  if (code >= 90) return 'Toofan';
  return 'Saf Mausam';
};

export const fetchRealWeather = async (lat: number, lon: number) => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Process Current
    const current = {
      temp: Math.round(data.current.temperature_2m),
      humidity: data.current.relative_humidity_2m,
      feelsLike: Math.round(data.current.apparent_temperature),
      wind: Math.round(data.current.wind_speed_10m),
      rainProb: data.daily.precipitation_probability_max[0],
      description: getWeatherDescription(data.current.weather_code),
      icon: getWeatherIcon(data.current.weather_code)
    };
    
    // Process Hourly (next 24 hours, taking 6 samples every 3 hours)
    const currentHourIdx = data.hourly.time.findIndex((t: string) => new Date(t) >= new Date());
    const hourly = [];
    for (let i = 0; i < 6; i++) {
        const hIdx = currentHourIdx + (i * 3);
        const timeStr = new Date(data.hourly.time[hIdx]).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
        hourly.push({
            time: i === 0 ? 'Abhi' : timeStr,
            temp: `${Math.round(data.hourly.temperature_2m[hIdx])}°`,
            icon: getWeatherIcon(data.hourly.weather_code[hIdx])
        });
    }
    
    // Process Daily (next 7 days)
    const days = ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar'];
    const daily = data.daily.time.map((t: string, idx: number) => {
        const dateObj = new Date(t);
        const dayStr = idx === 0 ? 'Aaj' : days[dateObj.getDay()];
        return {
            day: dayStr,
            min: Math.round(data.daily.temperature_2m_min[idx]),
            max: Math.round(data.daily.temperature_2m_max[idx]),
            rain: data.daily.precipitation_probability_max[idx] / 100, // Format for progress bar (0 to 1)
            icon: getWeatherIcon(data.daily.weather_code[idx])
        };
    });

    return { current, hourly, daily };
  } catch (error) {
    console.error("Failed to fetch weather from Open-Meteo", error);
    throw error;
  }
};
