import React, { useState } from 'react';
import { Colors } from '@/styles/styles';
type RadioButtonProps = {
  text: string;
};

const RadioButton: React.FC<RadioButtonProps> = ({ text }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <label className="text-dark flex cursor-pointer select-none items-center dark:text-white">
      <div className="relative">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="sr-only"
        />
        <div
          className={`mr-4 flex h-5 w-5 items-center justify-center rounded-full border`}
          style={{
            borderColor: Colors.primary,
            backgroundColor: isChecked ? Colors.primary : 'transparent',
          }}
        >
          <span className="h-[10px] w-[10px] rounded-full bg-white"></span>
        </div>
      </div>
      <span style={{ color: Colors.textMain }}>{text}</span>
    </label>
  );
};

export default RadioButton;
