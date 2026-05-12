import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { H1, H2, BodyText, Caption } from '../components/Typography';
import { PrimaryButton, Chip } from '../components/Buttons';
import { Input } from '../components/Inputs';
import { useStore } from '../store/useStore';

const CROP_OPTIONS = [
  '🌾 Gehu', '🫘 Soybean', '🧅 Pyaz', '🍅 Tamatar', '🍚 Dhan',
  '🌻 Surajmukhi', '🥔 Aloo', '🌽 Makka', '🌶️ Mirchi', '🥕 Gajar',
];

const SOIL_OPTIONS = ['Black Soil', 'Red Soil', 'Sandy Soil', 'Loamy Soil', 'Clay Soil'];

const LAND_SIZES = ['0.5 Acres', '1 Acre', '2 Acres', '2.5 Acres', '5 Acres', '10+ Acres'];

export default function EditProfileScreen({ navigation }: any) {
  const { profile, setProfile } = useStore();

  const [name, setName] = useState(profile.name);
  const [location, setLocation] = useState(profile.location);
  const [landSize, setLandSize] = useState(profile.landSize || '2.5');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(profile.crops || []);
  const [soilType, setSoilType] = useState(profile.soilType || 'Black Soil');

  const toggleCrop = (crop: string) => {
    // strip emoji for storage key
    const key = crop.split(' ').slice(1).join(' ');
    setSelectedCrops((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const isCropSelected = (crop: string) => {
    const key = crop.split(' ').slice(1).join(' ');
    return selectedCrops.includes(key);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Naam zaruri hai', 'Kripaya apna naam darj karein.');
      return;
    }
    setProfile({
      name: name.trim(),
      location: location.trim() || profile.location,
      landSize,
      crops: selectedCrops,
      soilType,
    });
    Alert.alert('✅ Saved', 'Aapki jaankari safaltapurvak save ho gayi!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <View className="flex-1 bg-theme-surface">
      {/* Header */}
      <LinearGradient colors={['#073B25', '#0F766E']} className="pt-14 pb-4 px-4 flex-row items-center shadow-sm rounded-b-[24px]">
        <View className="absolute right-[-40px] top-[-32px] w-[140px] h-[140px] rounded-full bg-white/10" />
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 w-10 h-10 rounded-full bg-white/15 items-center justify-center border border-white/20">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <H2 className="text-white text-[18px]">Profile Edit Karein</H2>
      </LinearGradient>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {/* Name */}
        <Animated.View entering={FadeInUp.delay(50).springify()} className="mb-6">
          <Caption className="mb-2 font-medium text-theme-muted">Aapka Naam</Caption>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Ramesh Ji"
            className="text-[16px]"
          />
        </Animated.View>

        {/* Location */}
        <Animated.View entering={FadeInUp.delay(100).springify()} className="mb-6">
          <Caption className="mb-2 font-medium text-theme-muted">Shetra / Zila</Caption>
          <Input
            value={location}
            onChangeText={setLocation}
            placeholder="Pune, Maharashtra"
            className="text-[16px]"
          />
        </Animated.View>

        {/* Land Size */}
        <Animated.View entering={FadeInUp.delay(150).springify()} className="mb-6">
          <H2 className="text-theme-text font-bold mb-3">Zameen ka Aakaar</H2>
          <View className="flex-row flex-wrap gap-2">
            {LAND_SIZES.map((size) => (
              <Chip
                key={size}
                title={size}
                active={landSize === size.replace(' Acres', '').replace(' Acre', '')}
                onPress={() => setLandSize(size.replace(' Acres', '').replace(' Acre', ''))}
                className="mb-1"
              />
            ))}
          </View>
        </Animated.View>

        {/* Primary Crops */}
        <Animated.View entering={FadeInUp.delay(200).springify()} className="mb-6">
          <H2 className="text-theme-text font-bold mb-3">Aapki Mukhya Fasalein</H2>
          <Caption className="text-theme-muted mb-3">Jo fasalein aap ugaate hain (ek ya zyada chunein):</Caption>
          <View className="flex-row flex-wrap gap-2">
            {CROP_OPTIONS.map((crop) => (
              <Chip
                key={crop}
                title={crop}
                active={isCropSelected(crop)}
                onPress={() => toggleCrop(crop)}
                className="mb-1"
              />
            ))}
          </View>
        </Animated.View>

        {/* Soil Type */}
        <Animated.View entering={FadeInUp.delay(250).springify()} className="mb-8">
          <H2 className="text-theme-text font-bold mb-3">Mitti ka Prakar</H2>
          <View className="flex-row flex-wrap gap-2">
            {SOIL_OPTIONS.map((soil) => (
              <Chip
                key={soil}
                title={soil}
                active={soilType === soil}
                onPress={() => setSoilType(soil)}
                className="mb-1"
              />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).springify()} className="mb-20">
          <PrimaryButton title="Jaankari Save Karein ✓" onPress={handleSave} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}
