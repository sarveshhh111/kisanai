import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeIn, FadeOut } from 'react-native-reanimated';
import { H1, H2, BodyText, Caption } from '../components/Typography';
import { Input, OTPInput } from '../components/Inputs';
import { PrimaryButton } from '../components/Buttons';
import { useStore } from '../store/useStore';
import { sendOTP, verifyOTP, isFirebaseConfigured } from '../services/auth';

const slides = [
  { id: '1', title: 'Apna Kisan Saathi', desc: 'Sahi salah, sahi samay par. Fasal, mandi aur mausam ki saari jaankari ek jagah.' },
  { id: '2', title: 'Kya milega Kisan AI se?', desc: 'Mandi bhav, fasal bimari ka ilaaj, aur IMD mausam ki saari update apne phone par.' },
  { id: '3', title: 'Bhasha Chunein', desc: 'Apni pasand ki bhasha chunein:' },
];

const LANG_OPTIONS: { display: string; code: 'hi' | 'en' | 'mr' | 'gu' }[] = [
  { display: 'Hindi (हिंदी)', code: 'hi' },
  { display: 'Marathi (मराठी)', code: 'mr' },
  { display: 'Gujarati (ગુજરાતી)', code: 'gu' },
  { display: 'English', code: 'en' },
];

const OTP_RESEND_TIMER = 30;

export default function OnboardingScreen({ navigation }: any) {
  const { setProfile, setLoggedIn } = useStore();
  const [step, setStep] = useState(0);
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en' | 'mr' | 'gu'>('hi');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(OTP_RESEND_TIMER);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startResendTimer = () => {
    setResendTimer(OTP_RESEND_TIMER);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLangSelect = (code: 'hi' | 'en' | 'mr' | 'gu') => {
    setSelectedLang(code);
    setProfile({ language: code });
  };

  const handleSendOTP = async () => {
    if (mobile.length !== 10) return;
    setIsLoading(true);

    if (isFirebaseConfigured()) {
      // Real Firebase OTP
      const result = await sendOTP(`+91${mobile}`);
      setIsLoading(false);
      if (result.success) {
        setShowOtp(true);
        startResendTimer();
      } else {
        Alert.alert('OTP Error', result.error ?? 'OTP bhejne mein dikkat aayi.');
      }
    } else {
      // Demo mode: Firebase not yet configured
      setIsLoading(false);
      setShowOtp(true);
      startResendTimer();
      Alert.alert(
        'Demo Mode 🔧',
        'Firebase config abhi set nahi hua. Koi bhi 6-digit OTP enter karein aur aage badh jaayein.\n\nProduction ke liye src/services/auth.ts mein FIREBASE_CONFIG bharen.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setIsLoading(true);

    if (isFirebaseConfigured()) {
      const result = await verifyOTP(otp);
      setIsLoading(false);
      if (result.success) {
        setProfile({ phone: mobile });
        setLoggedIn(true);
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Galat OTP', result.error ?? 'Galat OTP dala hai. Dobara try karein.');
        setOtp('');
      }
    } else {
      // Demo mode: accept any 6-digit OTP
      setIsLoading(false);
      setProfile({ phone: mobile });
      setLoggedIn(true);
      navigation.replace('MainTabs');
    }
  };

  const login = () => {
    if (!showOtp) handleSendOTP();
    else handleVerifyOTP();
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    handleSendOTP();
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
    else setStep(3);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-theme-surface">
      {/* Hidden reCAPTCHA container for web Firebase */}
      {Platform.OS === 'web' && <div id="recaptcha-container" />}

      {step < 3 ? (
        <View className="flex-1">
          {/* Logo + Skip */}
          <LinearGradient colors={['#073B25', '#0F766E']} className="flex-row justify-between items-center px-6 pt-16 pb-5 rounded-b-[28px]">
            <View className="absolute right-[-42px] top-[-30px] w-[150px] h-[150px] rounded-full bg-white/10" />
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-[14px] bg-agri-gold items-center justify-center mr-2">
                <Ionicons name="leaf" size={17} color="#073B25" />
              </View>
              <H2 className="font-bold text-white text-[18px]">Kisan AI</H2>
            </View>
            <TouchableOpacity onPress={() => setStep(3)}>
              <Caption className="text-white/80 font-medium">Skip</Caption>
            </TouchableOpacity>
          </LinearGradient>

          {/* Carousel content */}
          <View className="flex-1 items-center justify-center px-6">
            <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut} key={step} className="items-center w-full">
              {step === 0 && (
                <View className="w-[280px] h-[280px] bg-white rounded-[42px] items-center justify-center mb-10 border border-theme-border shadow-sm">
                  <Ionicons name="leaf" size={120} color="#1A7A4A" />
                </View>
              )}
              {step === 1 && (
                <View className="w-full mb-10">
                  {[
                    { icon: 'leaf', bg: '#E8F5EE', label: '1. Crop Diagnosis & Treatment' },
                    { icon: 'bar-chart', bg: '#FEF9E8', label: '2. Live Mandi Prices' },
                    { icon: 'partly-sunny', bg: '#EAF4FE', label: '3. Hyperlocal Weather Alerts' },
                  ].map((item, i) => (
                    <View key={i} className="flex-row items-center mb-6">
                      <View className="w-12 h-12 rounded-[16px] items-center justify-center mr-4 border border-theme-border" style={{ backgroundColor: item.bg }}>
                        <Ionicons name={item.icon as any} size={24} color="#1A7A4A" />
                      </View>
                      <H2 className="text-theme-text font-bold">{item.label}</H2>
                    </View>
                  ))}
                </View>
              )}
              {step === 2 && (
                <View className="w-full mb-10">
                  {LANG_OPTIONS.map((lang) => (
                    <TouchableOpacity
                      key={lang.display}
                      onPress={() => handleLangSelect(lang.code)}
                      className={`w-full py-4 px-5 rounded-[18px] border mb-3 flex-row items-center justify-between shadow-sm ${
                        selectedLang === lang.code ? 'border-kisan-green bg-[#E8F5EE]' : 'border-theme-border bg-white'
                      }`}
                    >
                      <BodyText className={selectedLang === lang.code ? 'font-bold text-kisan-green text-[16px]' : 'font-medium text-theme-text text-[16px]'}>
                        {lang.display}
                      </BodyText>
                      {selectedLang === lang.code && <Ionicons name="checkmark-circle" size={24} color="#1A7A4A" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <H1 className="text-center font-bold text-[28px] mb-4">{slides[step].title}</H1>
              <BodyText className="text-center text-theme-muted text-[16px] px-4 leading-relaxed">{slides[step].desc}</BodyText>
            </Animated.View>
          </View>

          {/* Footer */}
          <View className="px-6 pb-12 pt-4">
            <View className="flex-row justify-center mb-8">
              {[0, 1, 2].map((dot) => (
                <View key={dot} className={`h-[8px] rounded-full mx-1 ${step === dot ? 'bg-kisan-green w-[24px]' : 'bg-theme-border w-[8px]'}`} />
              ))}
            </View>
            <PrimaryButton title="Aage Badhein" onPress={nextStep} />
          </View>
        </View>
      ) : (
        <Animated.View entering={FadeInUp.springify()} className="flex-1 px-6 justify-center">
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-[22px] bg-kisan-deep items-center justify-center mb-6 shadow-sm">
              <Ionicons name="leaf" size={32} color="#F6B84B" />
            </View>
            <H1 className="text-center font-bold text-[28px] mb-2">
              {showOtp ? 'OTP Darj karein' : 'Swagat hai! 🌾'}
            </H1>
            <BodyText className="text-center text-theme-muted px-4">
              {showOtp
                ? `Humne +91 ${mobile} par ek OTP bheja hai.`
                : 'Kisan AI ka upyog shuru karne ke liye apna mobile number likhein.'}
            </BodyText>
          </View>

          <View className="mb-10">
            {!showOtp ? (
              <View className="flex-row items-center">
                <View className="h-[48px] px-4 rounded-[12px] border border-theme-border bg-theme-surface justify-center mr-3">
                  <BodyText className="font-bold text-[16px] text-theme-text">+91</BodyText>
                </View>
                <Input
                  className="flex-1 text-[16px] font-bold tracking-widest"
                  placeholder="98765 43210"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={setMobile}
                />
              </View>
            ) : (
              <OTPInput length={6} value={otp} onChangeText={setOtp} />
            )}
          </View>

          <PrimaryButton
            title={isLoading ? 'Bhej rahe hain...' : showOtp ? 'Verify Karein' : 'OTP Bhejein'}
            onPress={login}
            disabled={isLoading || (showOtp ? otp.length !== 6 : mobile.length !== 10)}
            className={`shadow-lg ${
              isLoading || (showOtp && otp.length !== 6) || (!showOtp && mobile.length !== 10)
                ? 'opacity-50'
                : 'opacity-100'
            }`}
          />

          {showOtp && (
            <TouchableOpacity className="mt-6 items-center" onPress={handleResendOtp} disabled={!canResend}>
              <Caption className={canResend ? 'text-kisan-green font-medium' : 'text-theme-muted'}>
                {canResend ? 'OTP wapas bhejein' : `OTP wapas bhejein (0:${String(resendTimer).padStart(2, '0')})`}
              </Caption>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}
