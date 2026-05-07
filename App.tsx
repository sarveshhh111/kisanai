import './global.css';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_600SemiBold,
} from '@expo-google-fonts/noto-sans';
import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_500Medium,
  NotoSansDevanagari_600SemiBold,
} from '@expo-google-fonts/noto-sans-devanagari';
import AppNavigation from './src/navigation';
import { useStore } from './src/store/useStore';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_600SemiBold,
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_500Medium,
    NotoSansDevanagari_600SemiBold,
  });

  const _hydrated = useStore((s) => s._hydrated);

  // Show loading until both fonts and Zustand persistence are ready
  if ((!fontsLoaded && !fontError) || !_hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F5C35' }}>
        <Text style={{ fontSize: 32, marginBottom: 12 }}>🌾</Text>
        <ActivityIndicator color="#FFFFFF" size="large" />
        <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 16, fontSize: 14 }}>
          Kisan AI lod ho raha hai...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigation />
    </SafeAreaProvider>
  );
}
