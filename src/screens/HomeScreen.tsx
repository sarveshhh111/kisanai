import React, { useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInUp, useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence,
} from 'react-native-reanimated';
import { H1, H2, BodyText, Caption, PriceText } from '../components/Typography';
import { AlertCard, AskBarCard } from '../components/Cards';
import { IconButton } from '../components/Buttons';
import { useStore } from '../store/useStore';
import { useTranslation } from '../i18n';
import { registerForPushNotificationsAsync } from '../services/notifications';
import { KisanAPI } from '../services/api';

export default function HomeScreen({ navigation }: any) {
  const { profile, mandiPrices, weatherData, fetchLocation } = useStore();
  const { t } = useTranslation();
  const pulse = useSharedValue(1);

  const quickActions = [
    { id: '1', title: t('fasal_salah'), icon: 'leaf-outline', color: '#E8F5EE' },
    { id: '2', title: t('mandi_bhav'), icon: 'bar-chart-outline', color: '#FEF9E8' },
    { id: '3', title: t('sarkari_yojana'), icon: 'document-text-outline', color: '#EAF4FE' },
    { id: '4', title: t('kida_rog'), icon: 'bug-outline', color: '#FEE2E2' },
  ];

  useEffect(() => {
    // Use GPS-based location (falls back to Pune if permission denied)
    if (!weatherData) {
      fetchLocation();
    }

    // Register push token
    registerForPushNotificationsAsync().then((token) => {
      if (token) KisanAPI.registerPushToken(token);
    });

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const displayPrices = mandiPrices.slice(0, 3);

  // Use live rain probability (not hardcoded)
  const rainProb = weatherData?.current?.rainProb ?? 0;

  return (
    <View className="flex-1 bg-theme-surface">
      <LinearGradient
        colors={['#0F5C35', '#1A7A4A']}
        className="pt-14 pb-8 px-5 rounded-b-[24px]"
      >
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <BodyText className="text-white opacity-90 mb-1">{t('namaste')}</BodyText>
            <H1 className="text-white text-[24px]">{profile.name} 👋</H1>
          </View>
          <View>
            <IconButton className="bg-white/20 border border-white/30">
              <Ionicons name="notifications-outline" size={20} color="white" />
            </IconButton>
            <Animated.View
              style={animatedBadgeStyle}
              className="absolute top-0 right-0 w-3 h-3 bg-price-red rounded-full border-2 border-[#0F5C35]"
            />
          </View>
        </View>

        {/* Weather Widget — taps to full weather screen */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Weather')}
          className="bg-white/10 rounded-[16px] p-4 border border-white/20"
        >
          {weatherData ? (
            <>
              <View className="flex-row justify-between items-center mb-1">
                <View className="flex-row items-center">
                  <H1 className="text-white text-[28px] mr-2">{weatherData.current.temp}°C</H1>
                  <Ionicons name={weatherData.current.icon as any} size={28} color="#FEF9E8" />
                </View>
                <View className="items-end">
                  <Caption className="text-white/80">{weatherData.current.description}</Caption>
                  <BodyText className="text-white font-medium">
                    {Math.round(rainProb)}{t('chance_rain')}
                  </BodyText>
                </View>
              </View>
              <BodyText className="text-white/80">{profile.location} {t('realtime')}</BodyText>
            </>
          ) : (
            <View className="items-center justify-center p-2">
              <ActivityIndicator color="white" />
              <Caption className="text-white mt-2">{t('weather_loading')}</Caption>
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <View className="flex-row justify-between mb-8">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                className="items-center"
                activeOpacity={0.7}
                onPress={() => {
                  if (action.id === '1') navigation.navigate('ChatTab');
                  if (action.id === '2') navigation.navigate('Mandi');
                  if (action.id === '3') navigation.navigate('MainTabs', { screen: 'YojanaTab' });
                  if (action.id === '4') navigation.navigate('Disease');
                }}
              >
                <View
                  className="w-[60px] h-[60px] rounded-[16px] items-center justify-center mb-2"
                  style={{ backgroundColor: action.color }}
                >
                  <Ionicons name={action.icon as any} size={28} color="#1A7A4A" />
                </View>
                <Caption className="text-center text-[12px]">{action.title}</Caption>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Ask Kisan AI */}
        <Animated.View entering={FadeInUp.delay(200).springify()} className="mb-8">
          <AskBarCard onPress={() => navigation.navigate('ChatTab')} />
        </Animated.View>

        {/* Today's Mandi Prices */}
        <Animated.View entering={FadeInUp.delay(300).springify()} className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <H2 className="text-theme-text font-bold">{t('todays_mandi')}</H2>
            <TouchableOpacity onPress={() => navigation.navigate('Mandi')}>
              <Caption className="text-kisan-green font-medium">{t('see_all')}</Caption>
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-[16px] border border-theme-border overflow-hidden">
            {displayPrices.map((item, idx) => (
              <View
                key={item.id}
                className={`flex-row justify-between items-center p-4 ${idx !== displayPrices.length - 1 ? 'border-b border-theme-border' : ''}`}
              >
                <View>
                  <BodyText className="font-bold">{item.crop}</BodyText>
                  <Caption>{item.apmc}</Caption>
                </View>
                <View className="items-end">
                  <PriceText>{item.price}</PriceText>
                  <View className={`px-2 py-0.5 mt-1 rounded-full ${item.up ? 'bg-[#DCFCE7]' : 'bg-[#FEE2E2]'}`}>
                    <Caption className={item.up ? 'text-price-green font-medium' : 'text-price-red font-medium'}>
                      {item.delta} {item.up ? '↑' : '↓'}
                    </Caption>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Weather Alert — only shown if rain > 50% and data loaded */}
        {weatherData && rainProb > 50 && (
          <Animated.View entering={FadeInUp.delay(400).springify()} className="mb-8 pb-10">
            <AlertCard
              title={t('weather_alert')}
              message={`${profile.location} mein aane wale samay mein ${Math.round(rainProb)}% baarish ki aashanka hai. Fasal ka dhyan rakhein.`}
            />
          </Animated.View>
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
