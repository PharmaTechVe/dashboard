'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ToggleVisibilityInputProps {
  label?: string;
  borderSize?: string;
  borderColor?: string;
  placeholder?: string;
  iconColor?: string;
  helperText?: string;
  helperTextColor?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ToggleVisibilityInput: React.FC<ToggleVisibilityInputProps> = ({
  label,
  borderSize = '1px',
  borderColor = 'gray',
  placeholder = '',
  iconColor = 'gray',
  helperText = '',
  helperTextColor = 'gray',
  onChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex w-full flex-col bg-white text-black">
      {label && <label className="mb-1 font-medium">{label}</label>}
      <div
        className="relative flex items-center rounded-lg px-3 py-2"
        style={{ border: `${borderSize} solid ${borderColor}` }}
      >
        <input
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
          className="w-full outline-none"
          onChange={onChange}
        />
        {isVisible ? (
          <EyeOff
            className="ml-2 cursor-pointer"
            color={iconColor}
            onClick={() => setIsVisible(false)}
          />
        ) : (
          <Eye
            className="ml-2 cursor-pointer"
            color={iconColor}
            onClick={() => setIsVisible(true)}
          />
        )}
      </div>
      {helperText && (
        <p className="mt-1 text-sm" style={{ color: helperTextColor }}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default ToggleVisibilityInput;
