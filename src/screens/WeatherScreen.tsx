import React, { useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { H1, H2, BodyText, Caption } from '../components/Typography';
import { AlertCard } from '../components/Cards';
import { useStore } from '../store/useStore';

const WeatherMetric = ({ icon, label, value, delay }: { icon: string; label: string; value: string; delay: number }) => (
  <Animated.View entering={FadeInUp.delay(delay).springify()} className="flex-1 items-center">
    <View className="w-10 h-10 rounded-[14px] bg-white/20 items-center justify-center mb-2">
      <Ionicons name={icon as any} size={20} color="white" />
    </View>
    <Caption className="text-white/75 text-center">{label}</Caption>
    <BodyText className="text-white font-bold text-center">{value}</BodyText>
  </Animated.View>
);

export default function WeatherScreen({ navigation }: any) {
  const { weatherData, profile, userLocation } = useStore();
  const cityDisplay = userLocation?.city ?? profile.location;

  if (!weatherData) {
    return (
      <View className="flex-1 bg-theme-surface items-center justify-center">
        <ActivityIndicator size="large" color="#1A7A4A" />
        <Caption className="mt-4">Mausam load ho raha hai...</Caption>
      </View>
    );
  }

  const { current, hourly, daily } = weatherData;

  return (
    <ScrollView className="flex-1 bg-theme-surface" bounces={false}>
      <LinearGradient colors={['#063C62', '#0F766E', '#38BDF8']} className="pt-16 pb-8 px-5 rounded-b-[36px]">
        <View className="absolute right-[-42px] top-[-30px] w-[160px] h-[160px] rounded-full bg-white/10" />
        <View className="absolute left-[-42px] bottom-[-40px] w-[130px] h-[130px] rounded-full bg-agri-gold/25" />
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 rounded-full bg-white/15 items-center justify-center border border-white/20">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row items-center bg-white/15 border border-white/20 rounded-full px-3 py-2">
            <Ionicons name="location" size={16} color="white" style={{ marginRight: 4 }} />
            <BodyText className="text-white font-bold text-[14px]">{cityDisplay} (Realtime)</BodyText>
            <Ionicons name="chevron-down" size={16} color="white" style={{ marginLeft: 4 }} />
          </View>
          <View className="w-10 h-10" />
        </View>

        <Animated.View entering={FadeInUp.springify()} className="items-center mb-6">
          <View className="w-[112px] h-[112px] rounded-full bg-white/15 items-center justify-center border border-white/20">
            <Ionicons name={current.icon as any} size={78} color="#F6B84B" style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }} />
          </View>
          <H1 className="text-white text-[72px] font-bold mt-2" style={{ lineHeight: 80 }}>{current.temp}°</H1>
          <BodyText className="text-white text-[18px]">{current.description}</BodyText>
        </Animated.View>

        <View className="flex-row justify-between bg-white/15 rounded-[22px] p-4 border border-white/25">
          <WeatherMetric icon="water-outline" label="Nami" value={`${current.humidity}%`} delay={100} />
          <WeatherMetric icon="thermometer-outline" label="Mehsoos" value={`${current.feelsLike}°`} delay={160} />
          <WeatherMetric icon="cloud-outline" label="Baarish" value={`${Math.round(current.rainProb)}%`} delay={220} />
          <WeatherMetric icon="leaf-outline" label="Hawa" value={`${Math.round(current.wind)} km/h`} delay={280} />
        </View>
      </LinearGradient>

      <View className="px-5 pt-6 -mt-4 z-10">
        {current.rainProb > 50 && (
          <Animated.View entering={FadeInUp.delay(100).springify()}>
            <AlertCard
              title="Mausam Alert (IMD)"
              message={`Aane wale samay mein ${current.rainProb}% baarish ki aashanka hai.`}
              className="mb-6 shadow-sm"
            />
          </Animated.View>
        )}

        {current.rainProb > 50 && (
          <Animated.View entering={FadeInUp.delay(200).springify()} className="bg-kisan-deep border border-kisan-mint/40 rounded-[20px] p-4 mb-8 shadow-sm">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-agri-gold items-center justify-center mr-2">
                <Ionicons name="sparkles" size={15} color="#073B25" />
              </View>
              <H2 className="text-white font-bold">Kisan AI Salah</H2>
            </View>
            <BodyText className="text-white/85 leading-relaxed">
              Baarish ki puri sambhavna hai. Apni fasal ki katai rok dein aur kati hui fasal ko surakshit jagah pe dhak ke rakhein. Sichai (irrigation) naa karein.
            </BodyText>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(300).springify()} className="mb-8 mt-2">
          <H2 className="text-theme-text font-bold mb-3">Aaj ka Mausam</H2>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {hourly.map((hr: any, idx: number) => (
                <View key={idx} className={`items-center px-4 py-3 rounded-[18px] mr-3 border shadow-sm ${idx === 0 ? 'bg-kisan-green border-kisan-green' : 'bg-white border-theme-border'}`}>
                  <Caption className={idx === 0 ? 'text-white/80' : 'text-theme-muted'}>{hr.time}</Caption>
                  <Ionicons name={hr.icon as any} size={28} color={idx === 0 ? 'white' : '#4B5563'} style={{ marginVertical: 8 }} />
                  <BodyText className={`font-bold text-[16px] ${idx === 0 ? 'text-white' : 'text-theme-text'}`}>{hr.temp}</BodyText>
                </View>
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).springify()} className="mb-10">
          <H2 className="text-theme-text font-bold mb-3">Agle 7 Din</H2>
          <View className="bg-white rounded-[22px] border border-theme-border p-4 shadow-sm">
            {daily.map((d: any, idx: number) => (
              <View key={idx} className={`flex-row items-center py-3 ${idx !== daily.length - 1 ? 'border-b border-theme-border' : ''}`}>
                <BodyText className="w-[80px] font-medium">{d.day}</BodyText>
                <Ionicons name={d.icon as any} size={24} color="#4B5563" style={{ width: 40, textAlign: 'center' }} />
                <View className="flex-row flex-1 items-center px-2">
                  <Caption className="w-8 text-right font-medium">{d.min}°</Caption>
                  <View className="flex-1 h-[6px] rounded-full mx-2 bg-theme-border overflow-hidden">
                    <View className="h-full bg-blue-400 rounded-full" style={{ width: `${d.rain * 100}%` }} />
                  </View>
                  <Caption className="w-8 font-medium">{d.max}°</Caption>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
