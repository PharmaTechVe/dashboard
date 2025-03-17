import React, { useState } from 'react';
import { XCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

type AlertProps = {
  variant?: 'filled' | 'outlined' | 'text';
  color?: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  message: string;
  backgroundColor?: 'white' | 'gray-300' | 'cyan-50';
};

const iconMap = {
  info: <Info className="h-6 w-6 text-teal-200" />,
  success: <CheckCircle className="h-6 w-6 text-green-600" />,
  warning: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
  danger: <XCircle className="h-6 w-6 text-red-600" />,
};

const Alert: React.FC<AlertProps> = ({
  variant = 'filled',
  color = 'info',
  title,
  message,
  backgroundColor = 'white',
}) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const baseStyle = `flex items-start p-4 rounded-lg shadow-md w-full max-w-lg`;
  const bgColorClass =
    backgroundColor === 'gray-300'
      ? 'bg-gray-100'
      : backgroundColor === 'cyan-50'
        ? 'bg-cyan-50'
        : 'bg-white';

  const variantStyles = {
    filled: `text-${color}-900 border border-${color}-300`,
    outlined: `border border-${color}-500 text-${color}-700`,
    text: `text-${color}-700`,
  };

  return (
    <div className={`${baseStyle} ${bgColorClass} ${variantStyles[variant]}`}>
      <div className="mr-3">{iconMap[color]}</div>
      <div className="flex-1">
        <h4 className="font-poppins text-light text-black">{title}</h4>
        <p className="font-poppins mt-4 text-xs text-gray-700">{message}</p>
        {color === 'success' && backgroundColor === 'white' && (
          <div className="mt-2 flex items-center">
            <button className="px-2 text-xs font-semibold text-green-600 hover:underline">
              View Status
            </button>
            <button className="px-2 text-xs font-semibold text-green-600 hover:underline">
              Dismiss
            </button>
          </div>
        )}
      </div>
      <button
        onClick={() => setVisible(false)}
        className="ml-4 text-gray-500 hover:text-gray-700"
      >
        <XCircle className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Alert;
