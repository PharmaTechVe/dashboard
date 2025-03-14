import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
  label: string;
  items: string[];
}

const Dropdown: React.FC<DropdownProps> = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(label);

  return (
    <div className="relative w-64">
      <label className="mb-1 block text-sm">Label</label>
      <button
        className="flex w-full items-center justify-between rounded-md border border-gray-400 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected}
        <ChevronDown size={18} />
      </button>
      {isOpen && (
        <ul className="absolute left-0 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
          {items.map((item, index) => (
            <li
              key={index}
              className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              onClick={() => {
                setSelected(item);
                setIsOpen(false);
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
