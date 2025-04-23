'use client';
import React from 'react';
import '../styles/globals.css';
import { Colors } from '../styles/styles';
export interface BadgeProps {
  variant: 'filled' | 'outlined' | 'text';
  color: 'primary' | 'warning' | 'danger' | 'success' | 'info';
  size: 'small' | 'medium' | 'large';
  borderRadius?: 'rounded' | 'square';
  children: React.ReactNode;
}
const Badge: React.FC<BadgeProps> = ({
  variant,
  color,
  size,
  borderRadius = 'rounded',
  children,
}) => {
  const baseStyle = 'font-poppins px-4 py-2';
  const sizeStyle =
    size === 'small'
      ? 'text-sm mt-2'
      : size === 'medium'
        ? 'text-base'
        : 'text-lg';
  const borderRadiusStyle =
    borderRadius === 'rounded' ? 'rounded-full' : 'rounded-md';

  const colorClasses: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: Colors.primary,
      color: Colors.textWhite,
      borderColor: Colors.primary,
    },
    warning: {
      backgroundColor: Colors.semanticWarning,
      color: Colors.textWhite,
      borderColor: Colors.semanticWarning,
    },
    danger: {
      backgroundColor: Colors.semanticDanger,
      color: Colors.textWhite,
      borderColor: Colors.semanticDanger,
    },
    success: {
      backgroundColor: Colors.semanticSuccess,
      color: Colors.textWhite,
      borderColor: Colors.semanticSuccess,
    },
    info: {
      backgroundColor: Colors.semanticInfo,
      color: Colors.textWhite,
      borderColor: Colors.semanticInfo,
    },
  };
  const outlinedClasses: Record<string, React.CSSProperties> = {
    primary: {
      color: Colors.primary,
      border: `1px solid ${Colors.primary}`,
    },
    warning: {
      color: Colors.semanticWarning,
      border: `1px solid ${Colors.semanticWarning}`,
    },
    danger: {
      color: Colors.semanticDanger,
      border: `1px solid ${Colors.semanticDanger}`,
    },
    success: {
      color: Colors.semanticSuccess,
      border: `1px solid ${Colors.semanticSuccess}`,
    },
    info: {
      color: Colors.semanticInfo,
      border: `1px solid ${Colors.semanticInfo}`,
    },
  };
  const textClasses: Record<string, React.CSSProperties> = {
    primary: { color: Colors.primary },
    warning: { color: Colors.semanticWarning },
    danger: { color: Colors.semanticDanger },
    success: { color: Colors.semanticSuccess },
    info: { color: Colors.semanticInfo },
  };
  const variantStyle = {
    filled: colorClasses[color],
    outlined: outlinedClasses[color],
    text: textClasses[color],
  };
  return (
    <span
      className={`${baseStyle} ${sizeStyle} ${borderRadiusStyle}`}
      style={variantStyle[variant]}
    >
      {children}
    </span>
  );
};
export default Badge;
