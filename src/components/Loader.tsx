'use client';

import { Colors } from '@/styles/styles';

export default function Loader() {
  return (
    <div className="flex flex-col items-center">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"
        style={{
          borderColor: `${Colors.primary} transparent transparent transparent`,
        }}
      ></div>
      <div className="mt-4 flex space-x-1">
        <span
          className="h-2 w-2 animate-bounce rounded-full"
          style={{ backgroundColor: Colors.primary }}
        ></span>
        <span
          className="h-2 w-2 animate-bounce rounded-full"
          style={{
            backgroundColor: Colors.primary,
            animationDelay: '0.2s',
          }}
        ></span>
        <span
          className="h-2 w-2 animate-bounce rounded-full"
          style={{
            backgroundColor: Colors.primary,
            animationDelay: '0.4s',
          }}
        ></span>
      </div>
    </div>
  );
}
