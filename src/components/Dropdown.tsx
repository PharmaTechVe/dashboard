import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Colors, FontSizes } from '@/styles/styles';

type DropdownItem = {
  label: string;
  value: string;
};

interface DropdownProps {
  title?: string;
  placeholder?: string;
  items: string[] | DropdownItem[];
  selected?: string | null;
  width?: string | number;
  height?: string | number;
  onChange?: (value: string) => void;
  onToggle?: (isOpen: boolean) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  title,
  placeholder = 'Seleccione...',
  items,
  selected = null,
  width = '16rem',
  height = 'auto',
  onChange,
  onToggle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [itemSelected, setSelected] = useState<string | null>(selected);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (item: string) => {
    setSelected(item);
    setIsOpen(false);
    if (onChange) onChange(item);
    if (onToggle) onToggle(false);
  };

  const toggleDropdown = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (onToggle) onToggle(newState);
  };

  useEffect(() => {
    if (selected !== null) {
      setSelected(selected);
    }
  }, [selected]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (onToggle) onToggle(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onToggle]);

  return (
    <div
      ref={dropdownRef}
      className="relative w-64"
      style={{
        width,
        height,
      }}
    >
      {title && (
        <label
          className="mb-1 block text-sm font-medium"
          style={{
            color: Colors.textLowContrast,
            fontSize: FontSizes.b1.size,
          }}
        >
          {title}
        </label>
      )}

      <button
        type="button"
        className="flex w-full items-center justify-between rounded-md border border-gray-400 bg-white px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2"
        onClick={toggleDropdown}
        style={{
          color: Colors.textLowContrast,
          fontSize: FontSizes.b1.size,
        }}
      >
        {itemSelected || placeholder}
        <ChevronDownIcon className="h-5 w-5 text-gray-600" />
      </button>

      {isOpen && (
        <ul className="absolute left-0 z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
          {items.map((item, index) => (
            <li
              key={typeof item === 'string' ? index : item.value}
              className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() =>
                handleSelect(typeof item === 'string' ? item : item.label)
              }
            >
              {typeof item === 'string' ? item : item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
