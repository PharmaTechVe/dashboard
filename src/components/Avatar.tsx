'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export type AvatarProps = {
  name: string;
  imageUrl?: string;
  size?: number;
  withDropdown?: boolean;
  dropdownOptions?: { label: string; route: string }[];
};

export default function Avatar({
  name,
  imageUrl,
  size = 48,
  withDropdown = false,
  dropdownOptions = [],
}: AvatarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleToggleDropdown = () => {
    if (withDropdown) {
      setDropdownOpen(!dropdownOpen);
    }
  };

  const handleOptionClick = (route: string) => {
    router.push(route);
    setDropdownOpen(false);
  };

  const initials = name
    .split(' ')
    .map((word) => word[0]?.toUpperCase() || '')
    .join('');

  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
    >
      {/* Avatar Circle */}
      <div
        className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-200"
        style={{ width: size, height: size }}
        onClick={handleToggleDropdown}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="rounded-full object-cover"
            sizes={`${size}px`}
          />
        ) : (
          <span style={{ fontSize: size * 0.4 }}>{initials || '?'}</span>
        )}
      </div>

      {/* Dropdown Menu (if enabled) */}
      {withDropdown && dropdownOpen && dropdownOptions.length > 0 && (
        <div className="absolute right-0 z-10 mt-2 w-40 rounded-md bg-white shadow-lg">
          <ul className="py-1">
            {dropdownOptions.map((option) => (
              <li
                key={option.label}
                className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleOptionClick(option.route)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
