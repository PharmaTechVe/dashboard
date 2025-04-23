'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Colors, FontSizes } from '@/styles/styles';
import Button from '@/components/Button';

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div
      className="flex h-screen flex-col items-center justify-center gap-5 text-center"
      style={{ backgroundColor: '#F1F5FD' }}
    >
      {/* Title */}
      <h1
        className="text-4xl font-bold"
        style={{
          color: Colors.primary,
          fontSize: FontSizes.h1.size,
        }}
      >
        Página no encontrada
      </h1>

      {/* Description */}
      <p
        className="mt-4 text-sm"
        style={{
          color: Colors.textLowContrast,
          fontSize: FontSizes.b1.size,
        }}
      >
        Lo sentimos, no pudimos encontrar la página que estás buscando.
      </p>

      {/* Go Back Button */}
      <Button onClick={handleGoBack} className="max-w-[200px]">
        Volver
      </Button>
    </div>
  );
}
