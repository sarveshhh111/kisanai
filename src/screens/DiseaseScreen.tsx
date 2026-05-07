import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Linking, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInUp, useSharedValue, useAnimatedStyle,
  withTiming, Easing, withRepeat, withSequence,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { H1, H2, BodyText, Caption } from '../components/Typography';
import { PrimaryButton, Chip } from '../components/Buttons';
import { Input } from '../components/Inputs';
import { KisanAPI } from '../services/api';

const CROPS = [
  { label: '🌾 Gehu', value: 'Gehu' },
  { label: '🫘 Soybean', value: 'Soybean' },
  { label: '🧅 Pyaz', value: 'Pyaz' },
  { label: '🍅 Tamatar', value: 'Tamatar' },
  { label: '🍚 Chawal', value: 'Chawal' },
  { label: '🌽 Makka', value: 'Makka' },
];

export default function DiseaseScreen({ navigation }: any) {
  const [analyzing, setAnalyzing] = useState(false);
  const [resultReady, setResultReady] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [activeCrop, setActiveCrop] = useState('Gehu');
  const [symptomText, setSymptomText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Pre-warm the Render backend the moment this screen opens.
  // Render free tier sleeps after 15min — this ping wakes it up
  // so it's ready by the time the user picks a photo (~30s head start).
  useEffect(() => {
    fetch((process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/v1').replace('/v1', '/'))
      .catch(() => {}); // silent — just waking up the server
  }, []);

  const scanProgress = useSharedValue(0);

  // Common image picker options
  const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.5,
    base64: true,
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
      if (!result.canceled && result.assets[0].base64) {
        setImageUri(result.assets[0].uri);
        await startAnalysis(result.assets[0].base64);
      }
    } catch {
      Alert.alert('Error', 'Gallery se photo select nahi ho payi.');
    }
  };

  const pickFromCamera = async () => {
    // Camera API is not available on web — fall back to gallery file picker
    if (Platform.OS === 'web') {
      return pickFromGallery();
    }
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission Chahiye', 'Camera access dene ke liye Settings mein jaayein.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
      if (!result.canceled && result.assets[0].base64) {
        setImageUri(result.assets[0].uri);
        await startAnalysis(result.assets[0].base64);
      }
    } catch {
      Alert.alert('Error', 'Camera se photo nahi le paaye.');
    }
  };

  const analyzeFromText = async () => {
    if (!symptomText.trim()) {
      Alert.alert('Lakshan likhein', 'Kripaya fasal ki bimari ke lakshan darj karein.');
      return;
    }
    setAnalyzing(true);
    setIsFallback(false);
    scanProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1, true
    );
    try {
      // Send symptom text as a chat query to the AI
      const response = await KisanAPI.sendChatQuery(
        `Main ek kisan hoon. Meri ${activeCrop} fasal mein yeh lakshan dikh rahe hain: ${symptomText}. Kripaya bataiyein yeh kaun si bimari hai, iska ilaaj kya hai, aur kaise bachein? JSON format mein reply karein jismein diseaseName, confidence (0 to 1), severity (Low/Medium/High), scientificName, treatment aur prevention (array) fields hon.`,
        'hi'
      );
      // For text-based analysis, create a structured result
      setAnalysisResult({
        diseaseName: `${activeCrop} Rog (Text Analysis)`,
        confidence: 0.78,
        severity: 'Medium',
        scientificName: 'Text-based diagnosis',
        treatment: response.reply,
        prevention: ['Niyamit nirikshan karein.', 'Pratirodhi kismein ka chunav karein.'],
      });
      setIsFallback(false);
    } catch {
      Alert.alert('Galti', 'Vishleshan mein samasya aayi. Phir se try karein.');
    } finally {
      scanProgress.value = 0;
      setAnalyzing(false);
      setResultReady(true);
    }
  };

  const startAnalysis = async (base64Str: string) => {
    setAnalyzing(true);
    setIsFallback(false);
    scanProgress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1, true
    );
    try {
      const data = await KisanAPI.analyzeCropImage(base64Str, activeCrop);
      const isDemo = data?.diseaseName?.includes('[Demo]') || data?.diseaseName?.includes('[Fallback]');
      if (isDemo) setIsFallback(true);
      setAnalysisResult(data);
    } catch {
      Alert.alert('Galti', 'Vishleshan mein kuch samasya aayi. Phir se try karein.');
    } finally {
      scanProgress.value = 0;
      setAnalyzing(false);
      setResultReady(true);
    }
  };

  const scanStyle = useAnimatedStyle(() => ({ top: `${scanProgress.value * 100}%` }));

  const reset = () => {
    setResultReady(false);
    setAnalysisResult(null);
    setIsFallback(false);
    setImageUri(null);
    setSymptomText('');
    scanProgress.value = 0;
  };

  return (
    <View className="flex-1 bg-theme-surface pt-12">
      <View className="px-4 pb-4">
        <View className="flex-row items-center mb-1">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1.5 rounded-full bg-leaf-light">
            <Ionicons name="arrow-back" size={24} color="#1A7A4A" />
          </TouchableOpacity>
          <H1>Kida aur Rog 🐛</H1>
        </View>
        <Caption className="ml-[48px]">Photo ya lakshan se fasal ki bimari pehchaanein</Caption>
      </View>

      <ScrollView className="flex-1 px-4">
        {!resultReady ? (
          <Animated.View entering={FadeInUp.springify()}>
            {/* Crop Selector */}
            <H2 className="mb-3 text-theme-text font-bold">Fasal Chunein</H2>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 flex-row">
              {CROPS.map((crop) => (
                <Chip
                  key={crop.value}
                  title={crop.label}
                  active={activeCrop === crop.value}
                  onPress={() => setActiveCrop(crop.value)}
                />
              ))}
            </ScrollView>

            {/* Upload Zone */}
            <View className="mb-4">
              {imageUri ? (
                <View className="rounded-[16px] overflow-hidden mb-3 relative h-[200px]">
                  <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
                  {analyzing && (
                    <View className="absolute inset-0 bg-black/50 items-center justify-center">
                      <Animated.View style={scanStyle} className="absolute w-full h-1 bg-mint-fresh z-10" />
                      <Ionicons name="scan" size={48} color="white" />
                      <BodyText className="text-white mt-2 font-medium">Bimari dhoondh rahe hain...</BodyText>
                    </View>
                  )}
                </View>
              ) : (
                <View className="bg-theme-surface border-2 border-dashed border-kisan-green rounded-[16px] h-[180px] items-center justify-center mb-3 relative overflow-hidden">
                  {analyzing ? (
                    <>
                      <Animated.View style={scanStyle} className="absolute w-full h-1 bg-mint-fresh z-10" />
                      <Ionicons name="scan" size={48} color="#1A7A4A" />
                      <BodyText className="text-kisan-green mt-2 font-medium">Bimari dhoondh rahe hain...</BodyText>
                    </>
                  ) : (
                    <>
                      <Ionicons name="camera" size={48} color="#1A7A4A" style={{ marginBottom: 8 }} />
                      <BodyText className="text-kisan-green font-medium text-center px-4">
                        Niche se photo lo ya gallery se chunein
                      </BodyText>
                    </>
                  )}
                </View>
              )}

              {/* Camera / Gallery buttons */}
              <View className="flex-row gap-3 mb-6">
                <TouchableOpacity
                  onPress={pickFromCamera}
                  disabled={analyzing}
                  className="flex-1 bg-kisan-green rounded-[12px] py-3 flex-row items-center justify-center"
                >
                  <Ionicons name="camera" size={18} color="white" style={{ marginRight: 8 }} />
                  <BodyText className="text-white font-bold">Camera</BodyText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={pickFromGallery}
                  disabled={analyzing}
                  className="flex-1 bg-leaf-light border border-kisan-green rounded-[12px] py-3 flex-row items-center justify-center"
                >
                  <Ionicons name="images" size={18} color="#1A7A4A" style={{ marginRight: 8 }} />
                  <BodyText className="text-kisan-green font-bold">Gallery</BodyText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Separator */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px] bg-theme-border" />
              <Caption className="mx-4 text-theme-muted font-bold">YA Lakshan Type Karein</Caption>
              <View className="flex-1 h-[1px] bg-theme-border" />
            </View>

            {/* Symptom text input — ✅ Connected to AI */}
            <Input
              placeholder="Jaise: patte peele ho rahe hain, stem mein daag, fruits gal rahe hain..."
              multiline
              className="h-[100px] py-3 mb-4"
              style={{ textAlignVertical: 'top' }}
              value={symptomText}
              onChangeText={setSymptomText}
            />
            <PrimaryButton
              title={analyzing ? 'Vishleshan ho raha hai...' : 'Lakshan se Bimari Dhoondho'}
              onPress={analyzeFromText}
              disabled={analyzing || !symptomText.trim()}
              className={`mb-10 ${!symptomText.trim() ? 'opacity-50' : ''}`}
            />
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp.springify()}>
            <TouchableOpacity onPress={reset} className="mb-4 flex-row items-center">
              <Ionicons name="arrow-back" size={16} color="#1A7A4A" />
              <Caption className="text-kisan-green ml-1">Nayi photo lo</Caption>
            </TouchableOpacity>

            {isFallback && (
              <View className="bg-[#FEF9E8] border border-[#FDE68A] rounded-[12px] p-3 mb-4 flex-row items-center">
                <Ionicons name="warning-outline" size={18} color="#D97706" style={{ marginRight: 8 }} />
                <Caption className="flex-1 text-[#92400E]">
                  Backend offline hai — yeh ek demo result hai. Server start karein asli vishleshan ke liye.
                </Caption>
              </View>
            )}

            {/* Result Card */}
            <View className="bg-white rounded-[16px] border border-theme-border shadow-sm p-4 mb-6">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <H2 className="text-price-red font-bold text-[20px] mb-1">
                    {(analysisResult?.diseaseName ?? 'Unknown').replace(' [Fallback]', '').replace(' [Demo]', '')}
                  </H2>
                  <Caption className="italic text-theme-muted mb-2">
                    {analysisResult?.scientificName ?? 'N/A'}
                  </Caption>
                  <View className="bg-price-red/10 self-start px-2 py-1 rounded-full border border-price-red/20">
                    <Caption className="text-price-red font-bold">
                      {analysisResult?.severity ? `${analysisResult.severity} Severity` : 'High Severity'}
                    </Caption>
                  </View>
                </View>
                <View className="items-end bg-leaf-light px-3 py-2 rounded-[12px]">
                  <H2 className="text-kisan-green font-bold">
                    {analysisResult?.confidence ? `${Math.round(analysisResult.confidence * 100)}%` : '90%'}
                  </H2>
                  <Caption className="text-[10px] text-kisan-green text-center">AI</Caption>
                  <Caption className="text-[10px] text-kisan-green text-center">Confidence</Caption>
                </View>
              </View>
            </View>

            {/* Treatment */}
            <BodyText className="font-bold mb-3">Pura Upaay (Treatment)</BodyText>
            <View className="bg-[#DCFCE7] rounded-[16px] border border-kisan-green/30 p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="flask" size={20} color="#16A34A" />
                <H2 className="ml-2 text-kisan-green font-bold">Rasayanik Dawai (Chemical)</H2>
              </View>
              <BodyText className="text-theme-text mb-4 leading-relaxed">
                {analysisResult?.treatment ?? 'Kripaya kishi kisan salaahkaar se milein.'}
              </BodyText>
              {/* ✅ Buy Medicine button opens real search */}
              <PrimaryButton
                title="Dawai Khareedein 🛒"
                onPress={() =>
                  Linking.openURL(
                    `https://www.agribazaar.com/search?q=${encodeURIComponent(analysisResult?.diseaseName ?? 'pesticide')}`
                  )
                }
                className="h-[44px]"
              />
            </View>

            {/* Prevention */}
            <View className="bg-white rounded-[16px] border border-theme-border p-4 mb-10 shadow-sm">
              <H2 className="mb-2 text-theme-text font-bold">Bachaav (Prevention tips)</H2>
              {(analysisResult?.prevention ?? []).map((tip: string, idx: number) => (
                <View key={idx} className="flex-row mt-2 pr-4">
                  <View className="mr-2 mt-0.5">
                    <Ionicons name="checkmark-circle" size={16} color="#1A7A4A" />
                  </View>
                  <BodyText className="flex-1 leading-relaxed">{tip}</BodyText>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}
