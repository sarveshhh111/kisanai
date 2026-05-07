import React, { useState, useRef } from 'react';
import { TextInput, TextInputProps, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BodyText } from './Typography';

export const Input = ({ className = '', onFocus, onBlur, ...props }: TextInputProps & { className?: string }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <TextInput
      className={`h-[48px] px-4 rounded-[12px] border font-sans text-[14px] text-theme-text ${isFocused ? 'border-kisan-green bg-white' : 'border-theme-border bg-theme-surface'} ${className}`}
      onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
      onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
      placeholderTextColor="#9CA3AF"
      {...props}
    />
  );
};

export const SearchBar = ({ className = '', ...props }: TextInputProps & { className?: string }) => (
  <View className={`h-[44px] bg-theme-surface rounded-[12px] flex-row items-center px-3 ${className}`}>
    <Ionicons name="search" size={20} color="#9CA3AF" />
    <TextInput
      className="flex-1 h-full ml-2 font-sans text-[14px] text-theme-text"
      placeholderTextColor="#9CA3AF"
      {...props}
    />
  </View>
);

export const OTPInput = ({ length = 4, value, onChangeText }: { length?: number, value: string, onChangeText: (val: string) => void }) => {
  const inputs = useRef<TextInput[]>([]);

  const handleTextChange = (text: string, index: number) => {
    const newValue = value.split('');
    newValue[index] = text;
    onChangeText(newValue.join(''));
    
    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row justify-between w-full max-w-[320px] self-center">
      {Array(length).fill(0).map((_, i) => (
        <TextInput
          key={i}
          ref={(ref: TextInput | null) => { if (ref) inputs.current[i] = ref; }}
          maxLength={1}
          keyboardType="number-pad"
          className={`w-[45px] h-[52px] rounded-[12px] border text-center text-[20px] font-bold text-theme-text ${value[i] ? 'border-kisan-green bg-white' : 'border-theme-border bg-theme-surface'}`}
          value={value[i] || ''}
          onChangeText={(text: string) => handleTextChange(text, i)}
          onKeyPress={(e: any) => handleKeyPress(e, i)}
        />
      ))}
    </View>
  );
};

export const Dropdown = ({ value, placeholder, onPress, className = '' }: { value?: string, placeholder: string, onPress: () => void, className?: string }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    className={`h-[48px] px-4 rounded-[12px] border border-theme-border bg-theme-surface flex-row items-center justify-between ${className}`}
  >
    <BodyText className={value ? 'text-theme-text' : 'text-theme-tertiary'}>
      {value || placeholder}
    </BodyText>
    <Ionicons name="chevron-down" size={20} color="#4B5563" />
  </TouchableOpacity>
);
