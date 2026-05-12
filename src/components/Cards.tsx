import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BodyText, Caption, H2 } from './Typography';

export const StandardCard = ({ children, className = '', ...props }: any) => (
  <View className={`bg-white rounded-[18px] px-[16px] py-[14px] border-[1px] border-theme-border flex shadow-sm ${className}`} {...props}>
    {children}
  </View>
);

export const MetricCard = ({ label, value, className = '' }: { label: string; value: string; className?: string }) => (
  <View className={`bg-white rounded-[16px] p-3 border border-theme-border shadow-sm ${className}`}>
    <Caption className="mb-1">{label}</Caption>
    <H2 className="text-[24px] font-bold text-theme-text">{value}</H2>
  </View>
);

export const AlertCard = ({ title, message, className = '' }: { title: string; message: string; className?: string }) => (
  <View className={`bg-alert-amberBg rounded-[16px] border-[1px] border-[#FBBF24] p-3 flex-row items-center shadow-sm ${className}`}>
    <View className="w-9 h-9 rounded-full bg-white items-center justify-center mr-3">
      <Ionicons name="warning-outline" size={18} color="#D97706" />
    </View>
    <View className="flex-1">
      <BodyText className="font-medium text-alert-amber mb-0.5">{title}</BodyText>
      <Caption>{message}</Caption>
    </View>
  </View>
);

// Bug M fix: added send Ionicons icon inside the green circle
export const AskBarCard = ({ onPress, className = '' }: { onPress?: () => void; className?: string }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.86}
    className={`bg-kisan-deep rounded-[18px] border-[1px] border-kisan-mint/40 px-4 py-3 flex-row items-center justify-between shadow-sm ${className}`}
  >
    <View className="flex-row items-center flex-1">
      <View className="w-9 h-9 rounded-full bg-white/15 items-center justify-center mr-3">
        <Ionicons name="sparkles" size={17} color="#F6B84B" />
      </View>
      <View>
        <Caption className="text-white/70 text-[10px] font-medium">AI Salah</Caption>
        <BodyText className="text-white font-bold">Kisan AI se poochein</BodyText>
      </View>
    </View>
    <View className="w-9 h-9 rounded-full bg-agri-gold items-center justify-center">
      <Ionicons name="send" size={15} color="#073B25" />
    </View>
  </TouchableOpacity>
);

// Bug J fix: SchemeCard now accepts eligible and deadline props and renders badges internally
export const SchemeCard = ({
  title,
  desc,
  color = '#185FA5',
  className = '',
  onPress,
  eligible,
  deadline,
}: {
  title: string;
  desc: string;
  color?: string;
  className?: string;
  onPress?: () => void;
  eligible?: boolean;
  deadline?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`bg-white rounded-[18px] p-4 shadow-sm border border-theme-border border-l-[4px] my-2 ${className}`}
    style={{ borderLeftColor: color }}
  >
    <View className="flex-row justify-between items-start mb-1">
      <H2 className="flex-1 text-theme-text font-bold mr-2">{title}</H2>
      {deadline && (
        <View className="bg-price-red px-2 py-1 rounded-full border border-[#B91C1C]">
          <Caption className="text-white font-bold text-[10px]">30 Din baaki</Caption>
        </View>
      )}
    </View>
    <Caption className="mb-3 text-theme-muted">{desc}</Caption>
    {eligible !== undefined && (
      eligible ? (
        <View className="flex-row items-center bg-[#DCFCE7] px-2 py-1 rounded-full self-start">
          <Ionicons name="checkmark" size={12} color="#16A34A" />
          <Caption className="text-price-green font-bold text-[10px] ml-1">Aap eligible hain</Caption>
        </View>
      ) : (
        <View className="flex-row items-center bg-alert-amberBg px-2 py-1 rounded-full self-start border border-[#FDE68A]">
          <Ionicons name="document-text" size={12} color="#D97706" />
          <Caption className="text-alert-amber font-bold text-[10px] ml-1">Documents chahiye</Caption>
        </View>
      )
    )}
  </TouchableOpacity>
);
