'use client';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

type SearchBarProps = {
  onSearch: (query: string) => void;
  width?: string;
  height?: string;
  borderRadius?: string;
  backgroundColor?: string;
  textColorDrop?: string;
  textplaceholderColor?: string;
  inputPlaceholder?: string;
  disableDropdown?: boolean;
};

export default function SearchBar({
  onSearch,
  width = '',
  height = '',
  borderRadius = '',
  backgroundColor = '',
  textColorDrop = '',
  textplaceholderColor = '',
  inputPlaceholder = '',
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div
      className="relative flex overflow-visible border"
      style={{
        width: `${width}`,
        height: `${height}`,
        borderRadius: `${borderRadius}`,
        backgroundColor: backgroundColor,
      }}
    >
      <input
        type="text"
        placeholder={inputPlaceholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="h-full flex-grow px-4 text-sm placeholder-[color:var(--tw-placeholder-color)] focus:outline-none"
        style={
          {
            color: textColorDrop,
            backgroundColor: 'transparent',
            '--tw-placeholder-color': textplaceholderColor,
          } as React.CSSProperties
        }
      />
      <button
        onClick={handleSearch}
        className="h-full border-l px-4 hover:bg-gray-100"
        style={{
          borderColor: '#d1d5db',
          borderTopRightRadius: `${borderRadius}`,
          borderBottomRightRadius: `${borderRadius}`,
        }}
      >
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
}
