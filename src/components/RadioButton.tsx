import React from 'react';
import { Colors } from '@/styles/styles';

type RadioButtonProps = {
  text: string;
  selected: boolean;
  onSelect: () => void;
};

const RadioButton: React.FC<RadioButtonProps> = ({
  text,
  selected,
  onSelect,
}) => {
  return (
    <label
      className="text-dark flex cursor-pointer select-none items-center dark:text-white"
      onClick={onSelect}
    >
      <div className="relative">
        <input type="radio" checked={selected} readOnly className="sr-only" />
        <div
          className={`mr-4 flex h-5 w-5 items-center justify-center rounded-full border`}
          style={{
            borderColor: Colors.primary,
            backgroundColor: selected ? Colors.primary : 'transparent',
          }}
        >
          {selected && (
            <span className="h-[10px] w-[10px] rounded-full bg-white"></span>
          )}
        </div>
      </div>
      <span style={{ color: Colors.textMain }}>{text}</span>
    </label>
  );
};

export default RadioButton;
