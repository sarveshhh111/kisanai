import React, { useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { H1, H2, BodyText, Caption } from '../components/Typography';
import { AlertCard } from '../components/Cards';
import { useStore } from '../store/useStore';

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
      <LinearGradient colors={['#38BDF8', '#0EA5E9', '#0284C7']} className="pt-16 pb-8 px-5 rounded-b-[32px]">
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Ionicons name="location" size={16} color="white" style={{ marginRight: 4 }} />
            <BodyText className="text-white font-medium text-[16px]">{cityDisplay} (Realtime)</BodyText>
            <Ionicons name="chevron-down" size={16} color="white" style={{ marginLeft: 4 }} />
          </View>
          <Ionicons name="search" size={24} color="transparent" />
        </View>

        <View className="items-center mb-6">
          <Ionicons name={current.icon as any} size={80} color="#FEF9E8" style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }} />
          <H1 className="text-white text-[72px] font-bold mt-2" style={{ lineHeight: 80 }}>{current.temp}°</H1>
          <BodyText className="text-white text-[18px]">{current.description}</BodyText>
        </View>

        <View className="flex-row justify-between bg-white/20 rounded-[16px] p-4 border border-white/30">
          <View className="items-center">
            <Ionicons name="water-outline" size={20} color="white" />
            <Caption className="text-white/80 mt-1">Nami</Caption>
            <BodyText className="text-white font-bold">{current.humidity}%</BodyText>
          </View>
          <View className="items-center">
            <Ionicons name="thermometer-outline" size={20} color="white" />
            <Caption className="text-white/80 mt-1">Mehsoos</Caption>
            <BodyText className="text-white font-bold">{current.feelsLike}°</BodyText>
          </View>
          <View className="items-center">
            <Ionicons name="cloud-outline" size={20} color="white" />
            <Caption className="text-white/80 mt-1">Baarish</Caption>
            <BodyText className="text-white font-bold">{Math.round(current.rainProb)}%</BodyText>
          </View>
          <View className="items-center">
            <Ionicons name="leaf-outline" size={20} color="white" />
            <Caption className="text-white/80 mt-1">Hawa</Caption>
            <BodyText className="text-white font-bold">{Math.round(current.wind)} km/h</BodyText>
          </View>
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
          <Animated.View entering={FadeInUp.delay(200).springify()} className="bg-[#E8F5EE] border border-kisan-green/30 rounded-[16px] p-4 mb-8">
            <View className="flex-row items-center mb-2">
              <View className="w-6 h-6 rounded-full bg-kisan-green items-center justify-center mr-2">
                <Ionicons name="leaf" size={14} color="white" />
              </View>
              <H2 className="text-kisan-green font-bold">Kisan AI Salah</H2>
            </View>
            <BodyText className="text-theme-text leading-relaxed">
              Baarish ki puri sambhavna hai. Apni fasal ki katai rok dein aur kati hui fasal ko surakshit jagah pe dhak ke rakhein. Sichai (irrigation) naa karein.
            </BodyText>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(300).springify()} className="mb-8 mt-2">
          <H2 className="text-theme-text font-bold mb-3">Aaj ka Mausam</H2>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row">
              {hourly.map((hr: any, idx: number) => (
                <View key={idx} className={`items-center px-4 py-3 rounded-[16px] mr-3 ${idx === 0 ? 'bg-sky-blue' : 'bg-white border border-theme-border'}`}>
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
          <View className="bg-white rounded-[16px] border border-theme-border p-4 shadow-sm">
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
