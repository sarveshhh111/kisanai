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

const PremiumAction = ({ action, onPress }: { action: any; onPress: () => void }) => {
  const lift = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lift.value }],
  }));

  return (
    <Animated.View style={pressStyle} className="w-[48%] mb-3">
      <TouchableOpacity
        activeOpacity={0.88}
        onPressIn={() => { lift.value = withTiming(0.97, { duration: 120 }); }}
        onPressOut={() => { lift.value = withTiming(1, { duration: 140 }); }}
        onPress={onPress}
        className="bg-white rounded-[20px] p-3 border border-theme-border shadow-sm"
      >
        <View className="flex-row items-center">
          <View
            className="w-11 h-11 rounded-[15px] items-center justify-center mr-3"
            style={{ backgroundColor: action.color }}
          >
            <Ionicons name={action.icon as any} size={23} color="#0F5C35" />
          </View>
          <View className="flex-1">
            <BodyText className="font-bold text-theme-text leading-tight" numberOfLines={1}>{action.title}</BodyText>
            <Caption className="text-[10px] mt-0.5">{action.subtitle}</Caption>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen({ navigation }: any) {
  const { profile, mandiPrices, weatherData, fetchLocation } = useStore();
  const { t } = useTranslation();
  const pulse = useSharedValue(1);

  const quickActions = [
    { id: '1', title: t('fasal_salah'), subtitle: 'AI crop guide', icon: 'leaf-outline', color: '#DDF8EA' },
    { id: '2', title: t('mandi_bhav'), subtitle: 'Live prices', icon: 'bar-chart-outline', color: '#FFF1C8' },
    { id: '3', title: t('sarkari_yojana'), subtitle: 'Apply & track', icon: 'document-text-outline', color: '#DDF4FF' },
    { id: '4', title: t('kida_rog'), subtitle: 'Photo diagnosis', icon: 'scan-outline', color: '#FFE2D9' },
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
        colors={['#073B25', '#0F766E', '#1A7A4A']}
        className="pt-14 pb-7 px-5 rounded-b-[34px]"
      >
        <View className="absolute right-[-36px] top-[-28px] w-[150px] h-[150px] rounded-full bg-white/10" />
        <View className="absolute left-[-50px] bottom-[-52px] w-[140px] h-[140px] rounded-full bg-agri-gold/20" />
        <View className="flex-row justify-between items-start mb-5">
          <View>
            <Caption className="text-white/75 mb-1 font-medium">{t('namaste')}</Caption>
            <H1 className="text-white text-[26px]">{profile.name} 👋</H1>
            <BodyText className="text-white/75 text-[12px] mt-1">{profile.location} {t('realtime')}</BodyText>
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

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Weather')}
          className="bg-white/15 rounded-[24px] p-4 border border-white/25 shadow-sm"
        >
          {weatherData ? (
            <>
              <View className="flex-row justify-between items-center">
                <View>
                  <Caption className="text-white/70 font-medium mb-1">Aaj ka mausam</Caption>
                  <View className="flex-row items-center">
                    <H1 className="text-white text-[38px] mr-2">{weatherData.current.temp}°C</H1>
                    <Ionicons name={weatherData.current.icon as any} size={34} color="#F6B84B" />
                  </View>
                </View>
                <View className="items-end">
                  <Caption className="text-white/75 mb-1">{weatherData.current.description}</Caption>
                  <View className="bg-white/20 px-3 py-1 rounded-full">
                    <BodyText className="text-white font-bold text-[12px]">
                    {Math.round(rainProb)}{t('chance_rain')}
                    </BodyText>
                  </View>
                </View>
              </View>
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
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <View className="flex-row justify-between items-center mb-3">
            <H2 className="text-theme-text font-bold">Quick Kheti Tools</H2>
            <View className="bg-agri-gold/20 px-2.5 py-1 rounded-full">
              <Caption className="text-kisan-deep font-bold text-[10px]">Live</Caption>
            </View>
          </View>
          <View className="flex-row flex-wrap justify-between mb-5">
            {quickActions.map((action) => (
              <PremiumAction
                key={action.id}
                action={action}
                onPress={() => {
                  if (action.id === '1') navigation.navigate('ChatTab');
                  if (action.id === '2') navigation.navigate('Mandi');
                  if (action.id === '3') navigation.navigate('MainTabs', { screen: 'YojanaTab' });
                  if (action.id === '4') navigation.navigate('Disease');
                }}
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).springify()} className="mb-7">
          <AskBarCard onPress={() => navigation.navigate('ChatTab')} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()} className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <H2 className="text-theme-text font-bold">{t('todays_mandi')}</H2>
            <TouchableOpacity onPress={() => navigation.navigate('Mandi')} className="flex-row items-center">
              <Caption className="text-kisan-green font-bold mr-1">{t('see_all')}</Caption>
              <Ionicons name="arrow-forward" size={13} color="#1A7A4A" />
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-[22px] border border-theme-border overflow-hidden shadow-sm">
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
                  <PriceText className="text-[17px]">{item.price}</PriceText>
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
