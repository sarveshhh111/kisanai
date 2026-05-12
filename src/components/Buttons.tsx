import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { BodyText, Caption } from './Typography';

export const PrimaryButton = ({ title, className = '', ...props }: TouchableOpacityProps & { title: string; className?: string }) => (
  <TouchableOpacity
    activeOpacity={0.86}
    className={`bg-kisan-green rounded-[16px] h-[52px] items-center justify-center shadow-sm border border-kisan-mint/30 ${className}`}
    {...props}
  >
    <BodyText className="text-white font-bold text-[16px]">{title}</BodyText>
  </TouchableOpacity>
);

export const SecondaryButton = ({ title, className = '', ...props }: TouchableOpacityProps & { title: string; className?: string }) => (
  <TouchableOpacity
    activeOpacity={0.86}
    className={`bg-white rounded-[16px] h-[52px] items-center justify-center border-[1px] border-kisan-green shadow-sm ${className}`}
    {...props}
  >
    <BodyText className="text-kisan-green font-bold text-[16px]">{title}</BodyText>
  </TouchableOpacity>
);

export const DangerButton = ({ title, className = '', ...props }: TouchableOpacityProps & { title: string; className?: string }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    className={`bg-price-red h-[48px] rounded-[12px] items-center justify-center w-full ${className}`}
    {...props}
  >
    <BodyText className="text-white font-medium">{title}</BodyText>
  </TouchableOpacity>
);

export const Chip = ({ title, active = false, className = '', ...props }: TouchableOpacityProps & { title: string; active?: boolean; className?: string }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    className={`px-3.5 py-2 rounded-full mr-2 border ${active ? 'bg-kisan-green border-kisan-green shadow-sm' : 'bg-white border-theme-border'} ${className}`}
    {...props}
  >
    <Caption className={active ? 'text-white font-bold text-[12px]' : 'text-theme-muted font-medium text-[12px]'}>
      {title}
    </Caption>
  </TouchableOpacity>
);

export const IconButton = ({ children, className = '', ...props }: TouchableOpacityProps & { className?: string; children: React.ReactNode }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    className={`w-10 h-10 rounded-full bg-white/90 items-center justify-center border border-white/40 shadow-sm ${className}`}
    {...props}
  >
    {children}
  </TouchableOpacity>
);
