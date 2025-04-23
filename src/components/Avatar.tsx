'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/styles/styles';

export type AvatarProps = {
  name: string;
  imageUrl?: string;
  size?: number;
  withDropdown?: boolean;
  dropdownOptions?: { label: string; route?: string }[];
};

export default function Avatar({
  name,
  imageUrl,
  size = 48,
  withDropdown = false,
  dropdownOptions = [],
}: AvatarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { logout, token } = useAuth();

  const handleToggleDropdown = () => {
    if (withDropdown) {
      setDropdownOpen((prev) => !prev);
    }
  };

  const handleOptionClick = (route?: string) => {
    if (route) router.push(route);
    setDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    logout();
    setDropdownOpen(false);
    router.push('/login');
  };

  const initials = name
    .split(' ')
    .map((word) => word[0]?.toUpperCase() || '')
    .join('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="relative inline-block"
      style={{ width: size, height: size }}
      ref={dropdownRef}
    >
      <div
        className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full"
        style={{ width: size, height: size, background: Colors.primary }}
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
          <span style={{ fontSize: size * 0.4, color: Colors.textWhite }}>
            {initials || '?'}
          </span>
        )}
      </div>

      {withDropdown && dropdownOpen && (
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
            {token && (
              <li
                className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleLogoutClick}
              >
                Cerrar sesión
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
