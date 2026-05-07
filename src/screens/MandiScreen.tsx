import React, { useState } from 'react';
import {
  View, ScrollView, RefreshControl, TouchableOpacity, Modal,
  FlatList, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { H1, H2, BodyText, Caption, PriceText } from '../components/Typography';
import { SearchBar } from '../components/Inputs';
import { useStore } from '../store/useStore';

const STATES = [
  'Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh',
  'Rajasthan', 'Gujarat', 'Karnataka', 'Andhra Pradesh', 'Tamil Nadu',
];

const APMCS: Record<string, string[]> = {
  Maharashtra: ['Sabhi Mandi', 'Pune APMC', 'Nashik APMC', 'Nagpur APMC', 'Lasalgaon APMC', 'Solapur APMC'],
  Punjab: ['Sabhi Mandi', 'Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala'],
  default: ['Sabhi Mandi'],
};

// ─── Price Badge ───────────────────────────────────────────────────────────────
const PriceBadge = ({ up, delta }: { up: boolean; delta: string }) => {
  const scale = useSharedValue(0.5);
  React.useEffect(() => {
    scale.value = withSequence(withSpring(1.15, { damping: 10 }), withSpring(1, { damping: 10 }));
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={style} className={`px-2 flex-row items-center py-0.5 mt-1 rounded-full ${up ? 'bg-[#DCFCE7]' : 'bg-[#FEE2E2]'}`}>
      <Caption className={up ? 'text-price-green font-medium' : 'text-price-red font-medium'}>
        {up ? '↑' : '↓'} {delta}
      </Caption>
    </Animated.View>
  );
};

// ─── Price Range Bar ───────────────────────────────────────────────────────────
const PriceRangeBar = ({ min, price, max }: { min: string; price: string; max: string }) => {
  const parseNum = (s: string) => parseInt(s.replace(/[₹,]/g, ''), 10) || 0;
  const minVal = parseNum(min);
  const maxVal = parseNum(max);
  const modalVal = parseNum(price);
  const range = maxVal - minVal || 1;
  const pct = Math.min(Math.max(((modalVal - minVal) / range) * 100, 0), 100);
  return (
    <View className="flex-1 px-2">
      <View className="h-[4px] bg-theme-border rounded-full overflow-hidden mb-1">
        <View className="h-full bg-kisan-green rounded-full" style={{ width: `${pct}%` }} />
      </View>
      <View className="flex-row justify-between">
        <Caption className="text-[9px]">{min}</Caption>
        <Caption className="text-[9px]">{max}</Caption>
      </View>
    </View>
  );
};

// ─── Dropdown Modal ────────────────────────────────────────────────────────────
const DropdownModal = ({
  visible, title, items, selected, onSelect, onClose,
}: {
  visible: boolean; title: string; items: string[];
  selected: string; onSelect: (v: string) => void; onClose: () => void;
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <TouchableOpacity className="flex-1 bg-black/40" activeOpacity={1} onPress={onClose} />
    <SafeAreaView className="bg-white rounded-t-[24px] max-h-[70%]">
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-theme-border">
        <H2 className="text-theme-text font-bold">{title}</H2>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => { onSelect(item); onClose(); }}
            className={`flex-row items-center justify-between px-5 py-4 border-b border-theme-border ${item === selected ? 'bg-leaf-light' : ''}`}
          >
            <BodyText className={item === selected ? 'text-kisan-green font-bold' : 'text-theme-text'}>
              {item}
            </BodyText>
            {item === selected && <Ionicons name="checkmark-circle" size={20} color="#1A7A4A" />}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  </Modal>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function MandiScreen({ navigation }: any) {
  const { mandiPrices, fetchMandiPrices, selectedState, selectedApmc } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [apmcModalVisible, setApmcModalVisible] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchMandiPrices('', selectedState, selectedApmc);
    setSearchQuery('');
    setRefreshing(false);
  }, [selectedState, selectedApmc]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    fetchMandiPrices(text, selectedState, selectedApmc);
  };

  const handleStateSelect = async (state: string) => {
    await fetchMandiPrices('', state, 'Sabhi Mandi');
    setSearchQuery('');
  };

  const handleApmcSelect = async (apmc: string) => {
    await fetchMandiPrices('', selectedState, apmc);
  };

  const apmcList = APMCS[selectedState] ?? APMCS.default;

  return (
    <View className="flex-1 bg-theme-surface pt-12">
      <View className="px-4 pb-4 bg-white border-b border-theme-border shadow-sm z-10">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1.5 rounded-full bg-leaf-light">
            <Ionicons name="arrow-back" size={24} color="#1A7A4A" />
          </TouchableOpacity>
          <H1>Mandi Bhav 📊</H1>
        </View>

        <SearchBar
          placeholder="Apni fasal khojein..."
          className="mb-3"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        {/* Functional Dropdowns */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setStateModalVisible(true)}
            className="flex-1 h-[36px] rounded-full border border-gray-200 bg-theme-surface flex-row items-center justify-between px-3"
          >
            <Caption className="text-theme-text font-medium" numberOfLines={1}>{selectedState}</Caption>
            <Ionicons name="chevron-down" size={14} color="#4B5563" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setApmcModalVisible(true)}
            className="flex-1 h-[36px] rounded-full border border-gray-200 bg-theme-surface flex-row items-center justify-between px-3"
          >
            <Caption className="text-theme-text font-medium" numberOfLines={1}>{selectedApmc}</Caption>
            <Ionicons name="chevron-down" size={14} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A7A4A']} />}
      >
        <View className="px-4 py-4">
          <View className="flex-row justify-between items-center mb-3">
            <H2 className="text-theme-text font-bold">{mandiPrices.length} Fasal Bhav</H2>
            <Caption>Agmarknet se • Aaj</Caption>
          </View>

          {mandiPrices.length === 0 ? (
            <View className="items-center py-16">
              <Ionicons name="bar-chart-outline" size={48} color="#D1D5DB" />
              <Caption className="mt-3">Koi fasal nahi mili. Filter badlein.</Caption>
            </View>
          ) : (
            <View className="bg-white rounded-[16px] border border-theme-border overflow-hidden mb-6 shadow-sm">
              {mandiPrices.map((item, idx) => (
                <Animated.View
                  entering={FadeInUp.delay(idx * 60).springify()}
                  key={item.id}
                  className={`flex-row items-center p-4 ${idx !== mandiPrices.length - 1 ? 'border-b border-theme-border' : ''}`}
                >
                  <View style={{ width: '35%' }}>
                    <BodyText className="font-bold text-[14px] mb-0.5">{item.crop}</BodyText>
                    <Caption>{item.apmc}</Caption>
                  </View>

                  <PriceRangeBar min={item.min} price={item.price} max={item.max} />

                  <View className="items-end" style={{ width: '28%' }}>
                    <PriceText className="text-[14px]">{item.price}</PriceText>
                    <PriceBadge up={item.up} delta={item.delta} />
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* State dropdown modal */}
      <DropdownModal
        visible={stateModalVisible}
        title="Rajya Chunein"
        items={STATES}
        selected={selectedState}
        onSelect={handleStateSelect}
        onClose={() => setStateModalVisible(false)}
      />

      {/* APMC dropdown modal */}
      <DropdownModal
        visible={apmcModalVisible}
        title="Mandi Chunein"
        items={apmcList}
        selected={selectedApmc}
        onSelect={handleApmcSelect}
        onClose={() => setApmcModalVisible(false)}
      />
    </View>
  );
}
