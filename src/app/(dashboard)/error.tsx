'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Colors, FontSizes } from '@/styles/styles';
import Button from '@/components/Button';

export default function Error() {
  const router = useRouter();

  const handleRetry = () => {
    router.refresh(); // Refresh the page
  };

  return (
    <div
      className="flex h-screen flex-col items-center justify-center gap-5 text-center"
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
      <Button onClick={handleRetry} className="max-w-[200px]">
        Reintentar
      </Button>
    </div>
  );
}
