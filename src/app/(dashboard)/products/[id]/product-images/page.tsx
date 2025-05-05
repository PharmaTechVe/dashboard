'use client';

import React from 'react';
import ImageUpload from '@/components/Image/ImageUpload';
import UploadedImages from '@/components/Image/UploadedImage';
import { useParams } from 'next/navigation';
import { Colors } from '@/styles/styles';

export default function ProductImagesPage() {
  const rawParams = useParams() as Record<string, string | string[]>;
  const productId = Array.isArray(rawParams.id)
    ? rawParams.id[0]
    : rawParams.id;
  if (!productId) {
    return (
      <div className="p-6 text-red-600">No se encontró el ID del producto.</div>
    );
  }
  return (
    <>
      <h1 className="text-2xl font-semibold" style={{ color: Colors.textMain }}>
        Cargar imagenes del producto
      </h1>
      <ImageUpload productId={productId} />
      <UploadedImages productId={productId} />
    </>
  );
}
