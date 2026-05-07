import React, { useState } from 'react';
import { View, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { H1, H2, BodyText, Caption } from '../components/Typography';
import { Chip } from '../components/Buttons';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n';

const historyQueries = [
  'Gehu me urvarak kab dalein?',
  'Pune mandi me soybean ka rate',
  'Fasal bima document list',
];

export default function ProfileScreen({ navigation }: any) {
  const { profile, setProfile, setLoggedIn, clearMessages } = useStore();
  const { t, language } = useTranslation();
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [pricingEnabled, setPricingEnabled] = useState(true);

  const initials = profile.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const cycleLanguage = () => {
    const langs: ('hi' | 'en' | 'mr' | 'gu')[] = ['hi', 'en', 'mr', 'gu'];
    const idx = langs.indexOf(language as any);
    setProfile({ language: langs[(idx + 1) % langs.length] });
  };

  const getLangDisplay = (code: string) => {
    switch (code) {
      case 'en': return 'English';
      case 'mr': return 'मराठी';
      case 'gu': return 'ગુજરાતી';
      default: return 'हिंदी';
    }
  };

  return (
    <ScrollView className="flex-1 bg-theme-surface pt-16 px-5" showsVerticalScrollIndicator={false}>
      {/* Avatar */}
      <View className="items-center mb-8">
        <View className="w-[88px] h-[88px] rounded-full bg-kisan-green items-center justify-center mb-4 shadow-sm">
          <H1 className="text-white text-[32px]">{initials}</H1>
        </View>
        <H1 className="mb-1 text-[24px]">{profile.name}</H1>
        <Caption className="text-[14px]">{profile.location}</Caption>
        {profile.phone ? <Caption className="text-[12px] mt-1">📱 +91 {profile.phone}</Caption> : null}
      </View>

      {/* Farm Details */}
      <Animated.View entering={FadeInUp.delay(100).springify()} className="mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <H2 className="text-theme-text font-bold">{t('farm_details')}</H2>
          {/* ✅ Fixed: Edit button now navigates to EditProfile */}
          <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
            <Caption className="text-kisan-green font-medium">{t('edit')}</Caption>
          </TouchableOpacity>
        </View>
        <View className="bg-white rounded-[16px] p-4 border border-theme-border shadow-sm flex-row justify-between">
          <View>
            <Caption className="mb-1">{t('land')}</Caption>
            <BodyText className="font-bold">{profile.landSize || '2.5'} Acres</BodyText>
          </View>
          <View>
            <Caption className="mb-1">{t('crop')}</Caption>
            <BodyText className="font-bold">
              {profile.crops?.length ? profile.crops.slice(0, 2).join(', ') : 'Gehu, Pyaz'}
            </BodyText>
          </View>
          <View>
            <Caption className="mb-1">{t('soil')}</Caption>
            <BodyText className="font-bold">{profile.soilType || 'Black Soil'}</BodyText>
          </View>
        </View>
      </Animated.View>

      {/* Settings */}
      <Animated.View entering={FadeInUp.delay(200).springify()} className="mb-8">
        <H2 className="text-theme-text font-bold mb-4">{t('settings')}</H2>
        <View className="bg-white rounded-[16px] border border-theme-border shadow-sm overflow-hidden">
          <TouchableOpacity
            onPress={cycleLanguage}
            activeOpacity={0.7}
            className="flex-row items-center justify-between p-4 border-b border-theme-border"
          >
            <View className="flex-row items-center">
              <Ionicons name="language" size={20} color="#4B5563" style={{ marginRight: 12 }} />
              <BodyText className="font-medium">{t('language')}</BodyText>
            </View>
            <View className="flex-row items-center bg-leaf-light px-3 py-1 rounded-full">
              <Caption className="text-kisan-green font-bold mr-1">{getLangDisplay(language)}</Caption>
              <Ionicons name="sync" size={14} color="#1A7A4A" />
            </View>
          </TouchableOpacity>

          <View className="flex-row items-center justify-between p-4 border-b border-theme-border">
            <View className="flex-row items-center">
              <Ionicons name="partly-sunny" size={20} color="#4B5563" style={{ marginRight: 12 }} />
              <View>
                <BodyText className="font-medium leading-tight">{t('weather_alerts_on')}</BodyText>
                <Caption className="text-[10px]">Weather warnings via push</Caption>
              </View>
            </View>
            <Switch value={alertsEnabled} onValueChange={setAlertsEnabled} trackColor={{ true: '#1A7A4A' }} />
          </View>

          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Ionicons name="bar-chart" size={20} color="#4B5563" style={{ marginRight: 12 }} />
              <View>
                <BodyText className="font-medium leading-tight">{t('mandi_alerts_on')}</BodyText>
                <Caption className="text-[10px]">Morning mandi price alerts</Caption>
              </View>
            </View>
            <Switch value={pricingEnabled} onValueChange={setPricingEnabled} trackColor={{ true: '#1A7A4A' }} />
          </View>
        </View>
      </Animated.View>

      {/* History */}
      <Animated.View entering={FadeInUp.delay(300).springify()} className="mb-8">
        <H2 className="text-theme-text font-bold mb-3">{t('history')}</H2>
        <View className="flex-row flex-wrap">
          {historyQueries.map((q, i) => (
            <Chip key={i} title={q} className="mb-2 bg-white border border-theme-border" />
          ))}
        </View>
      </Animated.View>

      {/* Upgrade Banner */}
      <Animated.View entering={FadeInUp.delay(400).springify()} className="mb-10">
        <View className="bg-amber-bg border border-[#FDE68A] rounded-[16px] p-4 flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <H2 className="text-alert-amber font-bold mb-1">{t('free_plan')}</H2>
            <Caption>{t('questions_left')}</Caption>
          </View>
          <TouchableOpacity className="bg-[#D97706] px-4 py-2 rounded-full">
            <Caption className="text-white font-bold">{t('upgrade')}</Caption>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Logout */}
      <TouchableOpacity
        className="mb-20 self-center"
        onPress={() => {
          setLoggedIn(false);
          clearMessages();
        }}
      >
        <Caption className="text-price-red font-medium">Log out</Caption>
      </TouchableOpacity>
    </ScrollView>
  );
}
