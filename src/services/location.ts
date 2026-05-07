/**
 * Location Service — GPS coordinates + reverse geocoding.
 * Uses expo-location on native, browser navigator.geolocation on web.
 * Falls back to Pune (default) if permission denied or API unavailable.
 */
import { Platform } from 'react-native';
import * as Location from 'expo-location';

export interface UserLocation {
  lat: number;
  lon: number;
  city: string;
}

const PUNE_DEFAULT: UserLocation = { lat: 18.5204, lon: 73.8567, city: 'Pune, MH' };

/** Web fallback: uses the browser's built-in Geolocation API */
async function getLocationFromBrowser(): Promise<UserLocation> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(PUNE_DEFAULT);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Try to reverse-geocode using a free API (no key needed)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.state ||
            'Aapka Shetra';
          const state = data?.address?.state_district || data?.address?.state || '';
          resolve({ lat: latitude, lon: longitude, city: `${city}, ${state}`.replace(/, $/, '') });
        } catch {
          resolve({ lat: latitude, lon: longitude, city: 'Aapka Shetra' });
        }
      },
      () => resolve(PUNE_DEFAULT),
      { timeout: 10000 }
    );
  });
}

export async function getCurrentLocation(): Promise<UserLocation> {
  // ─── Web: use browser geolocation ───────────────────────────────────────────
  if (Platform.OS === 'web') {
    return getLocationFromBrowser();
  }

  // ─── Native: use expo-location ──────────────────────────────────────────────
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission denied, using default (Pune).');
      return PUNE_DEFAULT;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = loc.coords;

    // Reverse geocode to get human-readable city name
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });

    const city = place
      ? [place.city || place.subregion, place.region]
          .filter(Boolean)
          .join(', ')
      : 'Aapka Shetra';

    return { lat: latitude, lon: longitude, city };
  } catch (error) {
    console.error('Location fetch failed:', error);
    return PUNE_DEFAULT;
  }
}
