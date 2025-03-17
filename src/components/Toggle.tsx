'use client';

import React, { useState } from 'react';

type IconType = React.FC<React.SVGProps<SVGSVGElement>>;

interface ToggleProps {
  isSelected?: boolean;
  backgroundSize?: string;
  backgroundColorOn?: string;
  backgroundColorOff?: string;
  thumbSize?: string;
  thumbColor?: string;
  activeThumbColor?: string;
  thumbIconOff?: IconType | null;
  thumbIconOn?: IconType | null;
  thumbIconColor?: string;
  onChange?: (state: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({
  isSelected = false,
  backgroundSize = 'w-14 h-7',
  backgroundColorOn = 'bg-gray-300',
  backgroundColorOff = 'bg-gray-200',
  thumbSize = 'w-6 h-6',
  thumbColor = 'bg-white border border-gray-400',
  activeThumbColor = 'bg-[#1A1D3B] border border-gray-300',
  thumbIconOff = null,
  thumbIconOn = null,
  thumbIconColor = 'text-black',
  onChange,
}) => {
  const [enabled, setEnabled] = useState(isSelected);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    if (onChange) {
      onChange(newState);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative flex items-center rounded-full transition-all ${backgroundSize} ${enabled ? backgroundColorOn : backgroundColorOff}`}
    >
      <span
        className={`absolute left-1 flex items-center justify-center rounded-full transition-all ${thumbSize} ${enabled ? 'translate-x-full ' + activeThumbColor : thumbColor}`}
      >
        {enabled && thumbIconOn
          ? React.createElement(thumbIconOn, {
              className: `${thumbIconColor} w-4 h-4`,
            })
          : !enabled && thumbIconOff
            ? React.createElement(thumbIconOff, {
                className: `${thumbIconColor} w-4 h-4`,
              })
            : null}
      </span>
    </button>
  );
};

export default Toggle;
