/**
 * Firebase Phone Authentication Service
 *
 * SETUP REQUIRED:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a project (or use existing)
 * 3. Enable Authentication → Sign-in Method → Phone
 * 4. Copy your web app config and paste below
 * 5. Add your app's SHA-1 fingerprint for Android in Firebase Console
 */
import { Platform } from 'react-native';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';

// ─── PASTE YOUR FIREBASE CONFIG HERE ───────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDJcLLk90T5OmgZMewS2VYfi2on2MjBpAM",
  authDomain: "kisanai-3c230.firebaseapp.com",
  projectId: "kisanai-3c230",
  storageBucket: "kisanai-3c230.firebasestorage.app",
  messagingSenderId: "593422938107",
  appId: "1:593422938107:web:204186d5638ea25d00e55e",
  measurementId: "G-181YT5SXJP"
};
// ────────────────────────────────────────────────────────────────────────────────

// Initialize Firebase only once
const firebaseApp =
  getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
export const firebaseAuth = getAuth(firebaseApp);

let confirmationResult: ConfirmationResult | null = null;

/**
 * Sends OTP to the given phone number via Firebase.
 * - Web: uses invisible reCAPTCHA (DOM-based)
 * - Native: Firebase JS SDK on native does not support reCAPTCHA verifier.
 *   Use Firebase Expo SDK or demo mode for native testing.
 *
 * @param phoneNumber  E.164 format, e.g. "+919876543210"
 * @param recaptchaContainerId  DOM element id for reCAPTCHA (web only)
 */
export async function sendOTP(
  phoneNumber: string,
  recaptchaContainerId = 'recaptcha-container'
): Promise<{ success: boolean; error?: string }> {
  try {
    if (Platform.OS === 'web') {
      // Web: use invisible reCAPTCHA verifier
      // Dynamically import to prevent native crash
      const { RecaptchaVerifier } = await import('firebase/auth');
      const verifier = new RecaptchaVerifier(firebaseAuth, recaptchaContainerId, {
        size: 'invisible',
      });
      confirmationResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, verifier);
    } else {
      // Native: Firebase JS SDK does not support reCAPTCHA on native.
      // The OnboardingScreen handles this via demo-mode fallback.
      throw new Error('NATIVE_UNSUPPORTED');
    }
    return { success: true };
  } catch (err: any) {
    if (err.message === 'NATIVE_UNSUPPORTED') {
      return { success: false, error: 'NATIVE_UNSUPPORTED' };
    }
    console.error('OTP send error:', err);
    return { success: false, error: err.message || 'OTP bhejne mein samasya aayi.' };
  }
}

/**
 * Verifies OTP code entered by the user.
 * Returns uid on success.
 */
export async function verifyOTP(
  code: string
): Promise<{ success: boolean; uid?: string; error?: string }> {
  if (!confirmationResult) {
    return { success: false, error: 'Pehle OTP bhejein.' };
  }
  try {
    const result = await confirmationResult.confirm(code);
    return { success: true, uid: result.user.uid };
  } catch (err: any) {
    console.error('OTP verify error:', err);
    return { success: false, error: 'Galat OTP. Dobara try karein.' };
  }
}

/**
 * True if Firebase config has been filled in.
 * Used to gracefully fall back to demo mode.
 */
export const isFirebaseConfigured = (): boolean =>
  FIREBASE_CONFIG.apiKey !== 'YOUR_API_KEY';
