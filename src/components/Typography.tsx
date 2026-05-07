import React from 'react';
import { Text, TextProps } from 'react-native';

export const H1 = ({ children, className = '', ...props }: TextProps & { className?: string }) => (
  <Text className={`text-[20px] font-bold text-theme-text ${className}`} {...props}>
    {children}
  </Text>
);

export const H2 = ({ children, className = '', ...props }: TextProps & { className?: string }) => (
  <Text className={`text-[16px] font-medium text-kisan-green ${className}`} {...props}>
    {children}
  </Text>
);

export const BodyText = ({ children, className = '', ...props }: TextProps & { className?: string }) => (
  <Text className={`text-[14px] font-sans text-theme-text leading-relaxed ${className}`} {...props}>
    {children}
  </Text>
);

export const Caption = ({ children, className = '', ...props }: TextProps & { className?: string }) => (
  <Text className={`text-[11px] font-sans text-theme-muted ${className}`} {...props}>
    {children}
  </Text>
);

export const PriceText = ({ children, className = '', ...props }: TextProps & { className?: string }) => (
  <Text className={`text-[16px] font-bold text-theme-text ${className}`} {...props}>
    {children}
  </Text>
);
