import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Linking, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { H1, H2, BodyText, Caption } from '../components/Typography';
import { SchemeCard } from '../components/Cards';

const categories = ['Sabhi (All)', 'Bima', 'Loan', 'Subsidy', 'Training'];

const ALL_SCHEMES = [
  {
    id: '1', title: 'PM Fasal Bima Yojana', category: 'Bima',
    desc: 'Sookha, baadh aadi se fasal ke nuksan par muawza. Kharif aur Rabi dono fasalein covered.',
    color: '#16A34A', eligible: true, deadline: true,
    applyUrl: 'https://pmfby.gov.in',
  },
  {
    id: '2', title: 'Kisan Credit Card (KCC)', category: 'Loan',
    desc: 'Kam byaj par kheti ke liye short-term loan — tractor, khaad, beej sab ke liye.',
    color: '#D97706', eligible: false, deadline: false,
    applyUrl: 'https://www.nabard.org/content1.aspx?id=572',
  },
  {
    id: '3', title: 'PM-KUSUM Yojana', category: 'Subsidy',
    desc: 'Solar pump lagane ke liye sarkar se 60% subsidy. Bijli bill bachao aur aay badhao.',
    color: '#0F766E', eligible: true, deadline: false,
    applyUrl: 'https://mnre.gov.in/solar/schemes',
  },
  {
    id: '4', title: 'PM-KISAN Samman Nidhi', category: 'Subsidy',
    desc: 'Har saal ₹6,000 seedha bank mein. Teen kirston mein milte hain — ₹2,000 har 4 mahine.',
    color: '#185FA5', eligible: true, deadline: false,
    applyUrl: 'https://pmkisan.gov.in',
  },
  {
    id: '5', title: 'RKVY — Rashtriya Krishi Vikas', category: 'Training',
    desc: 'Aadhunik kheti, Drone farming aur FPO training ke liye sarkar ki madad.',
    color: '#7C3AED', eligible: true, deadline: false,
    applyUrl: 'https://rkvy.nic.in',
  },
  {
    id: '6', title: 'Soil Health Card Scheme', category: 'Training',
    desc: 'Muft mitti janch card — jaanein aapki mitti mein kya kami hai aur khaad sahi maatra mein daalein.',
    color: '#92400E', eligible: true, deadline: false,
    applyUrl: 'https://soilhealth.dac.gov.in',
  },
  {
    id: '7', title: 'PM Krishi Sinchai Yojana', category: 'Subsidy',
    desc: 'Drip/Sprinkler sinchai lagwane par 55-75% subsidy. Paani bachao, paidawaar badhao.',
    color: '#0891B2', eligible: false, deadline: true,
    applyUrl: 'https://pmksy.gov.in',
  },
  {
    id: '8', title: 'National Horticulture Mission', category: 'Subsidy',
    desc: 'Phal, sabzi aur phool ki kheti ke liye anudan. Cold storage aur processing unit ke liye bhi.',
    color: '#DC2626', eligible: true, deadline: false,
    applyUrl: 'https://nhm.nic.in',
  },
];

export default function YojanaScreen() {
  const [activeTab, setActiveTab] = useState('Sabhi (All)');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = ALL_SCHEMES.filter((s) => {
    const matchesTab = activeTab === 'Sabhi (All)' || s.category === activeTab;
    const matchesSearch =
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const countForTab = (tab: string) =>
    tab === 'Sabhi (All)'
      ? ALL_SCHEMES.length
      : ALL_SCHEMES.filter((s) => s.category === tab).length;

  return (
    <View className="flex-1 bg-theme-surface">
      <LinearGradient colors={['#073B25', '#0F766E']} className="pt-14 px-5 pb-5 rounded-b-[28px]">
        <View className="absolute right-[-44px] top-[-32px] w-[150px] h-[150px] rounded-full bg-white/10" />
        <Caption className="text-white/70 font-medium">Eligibility, documents, direct apply</Caption>
        <H1 className="mb-4 text-white text-[24px]">Sarkari Yojana 📄</H1>

        <Animated.View entering={FadeInUp.springify()} className="mb-4">
          <TouchableOpacity
            onPress={() => Linking.openURL('https://pmkisan.gov.in')}
            activeOpacity={0.85}
            className="bg-white/15 rounded-[22px] border border-white/25 p-4 flex-row items-center shadow-sm"
          >
            <View className="w-12 h-12 rounded-[17px] bg-agri-gold items-center justify-center mr-3 shadow-sm">
              <Ionicons name="cash" size={24} color="#073B25" />
            </View>
            <View className="flex-1">
              <BodyText className="font-bold text-white mb-0.5">PM-KISAN Samman Nidhi</BodyText>
              <Caption className="text-white/80 font-medium">Aapki next kist: ₹2,000 — Status check karein →</Caption>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View className="flex-row items-center bg-white rounded-[16px] border border-white/30 px-3 mb-4 h-[46px] shadow-sm">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 font-sans text-[14px] text-theme-text h-full"
            placeholder="Yojana dhoondhein..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveTab(cat)}
                className={`px-4 py-2 mr-2 rounded-full border flex-row items-center ${
                  activeTab === cat ? 'bg-agri-gold border-agri-gold' : 'bg-white/15 border-white/25'
                }`}
              >
                <BodyText className={activeTab === cat ? 'text-kisan-deep font-bold text-[13px]' : 'text-white font-medium text-[13px]'}>
                  {cat}
                </BodyText>
                <View className={`ml-1.5 px-1.5 py-0.5 rounded-full ${activeTab === cat ? 'bg-white/40' : 'bg-white/20'}`}>
                  <Caption className={activeTab === cat ? 'text-kisan-deep text-[10px] font-bold' : 'text-white text-[10px]'}>
                    {countForTab(cat)}
                  </Caption>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>

      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
        <H2 className="mb-3 font-bold text-theme-text">
          {filtered.length} Yojana{filtered.length !== 1 ? 'ain' : ''} mili
        </H2>

        {filtered.length === 0 ? (
          <View className="items-center py-16">
            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
            <Caption className="mt-3 text-center">Koi yojana nahi mili. Doosra filter try karein.</Caption>
          </View>
        ) : (
          filtered.map((scheme, idx) => (
            <Animated.View key={scheme.id} entering={FadeInUp.delay(idx * 80).springify()}>
              <View className="mb-1">
                <SchemeCard
                  title={scheme.title}
                  desc={scheme.desc}
                  color={scheme.color}
                  eligible={scheme.eligible}
                  deadline={scheme.deadline}
                  onPress={() => Linking.openURL(scheme.applyUrl)}
                />
                <TouchableOpacity
                  onPress={() => Linking.openURL(scheme.applyUrl)}
                  className="bg-kisan-green/10 border border-kisan-green/30 rounded-[10px] py-2 mx-1 mb-3 items-center flex-row justify-center"
                >
                  <Ionicons name="open-outline" size={14} color="#1A7A4A" style={{ marginRight: 6 }} />
                  <Caption className="text-kisan-green font-bold">Abhi Apply Karein →</Caption>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
