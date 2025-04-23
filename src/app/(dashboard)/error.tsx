'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Colors, FontSizes } from '@/styles/styles';

export default function Error() {
  const router = useRouter();

  const handleRetry = () => {
    router.refresh(); // Refresh the page
  };

  return (
    <div
      className="flex h-screen flex-col items-center justify-center"
      style={{ backgroundColor: '#F1F5FD' }}
    >
      <h1
        className="text-3xl font-bold"
        style={{
          color: Colors.primary,
          fontSize: FontSizes.h1.size,
        }}
      >
        Oops! Algo salió mal.
      </h1>
      <p
        className="mt-4 text-center text-sm"
        style={{
          color: Colors.textLowContrast,
          fontSize: FontSizes.b1.size,
        }}
      >
        No pudimos cargar la página. Por favor, inténtalo de nuevo.
      </p>
      <button
        onClick={handleRetry}
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{
          backgroundColor: Colors.primary,
          fontSize: FontSizes.b1.size,
        }}
      >
        Reintentar
      </button>
    </div>
  );
}
