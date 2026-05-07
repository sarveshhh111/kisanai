import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { BodyText, Caption } from './Typography';

export const PrimaryButton = ({ title, className = '', ...props }: TouchableOpacityProps & { title: string; className?: string }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    className={`bg-kisan-green rounded-[14px] h-[52px] items-center justify-center ${className}`}
    {...props}
  >
    <BodyText className="text-white font-bold text-[16px]">{title}</BodyText>
  </TouchableOpacity>
);

export const SecondaryButton = ({ title, className = '', ...props }: TouchableOpacityProps & { title: string; className?: string }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    className={`bg-leaf-light rounded-[14px] h-[52px] items-center justify-center border-[1px] border-kisan-green ${className}`}
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
    className={`px-3 py-1.5 rounded-full mr-2 ${active ? 'bg-kisan-green' : 'bg-leaf-light'} ${className}`}
    {...props}
  >
    <Caption className={active ? 'text-white font-medium text-[12px]' : 'text-kisan-green font-medium text-[12px]'}>
      {title}
    </Caption>
  </TouchableOpacity>
);

export const IconButton = ({ children, className = '', ...props }: TouchableOpacityProps & { className?: string; children: React.ReactNode }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    className={`w-9 h-9 rounded-full bg-leaf-light items-center justify-center ${className}`}
    {...props}
  >
    {children}
  </TouchableOpacity>
);
