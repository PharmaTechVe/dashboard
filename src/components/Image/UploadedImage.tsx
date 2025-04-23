'use client';

import { useEffect, useState } from 'react';
import { EyeIcon, InboxArrowDownIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Colors } from '@/styles/styles';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type UploadedImage = {
  id: string;
  url: string;
  name?: string;
  size?: number;
};

interface UploadedImagesProps {
  productId: string;
}

const formatBytes = (bytes: number = 0) => {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const getImageSize = async (url: string): Promise<number | null> => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const size = res.headers.get('content-length');
    return size ? parseInt(size, 10) : null;
  } catch {
    return null;
  }
};

export default function UploadedImages({ productId }: UploadedImagesProps) {
  const { token } = useAuth();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      if (!token) return;

      try {
        const response = await api.productImage.getByProductId(productId);

        const enrichedImages = await Promise.all(
          response.map(async (img: UploadedImage) => {
            const size = await getImageSize(img.url);
            return { ...img, size: size ?? undefined };
          }),
        );

        setImages(enrichedImages);
      } catch (err) {
        console.error('Error fetching product images:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [productId, token]);

  if (loading) return <p className="text-gray-500">Cargando imágenes...</p>;

  return (
    <div className="mx-auto h-auto w-[904px] overflow-auto rounded-lg bg-white p-8">
      <h2
        className="mb-4 flex items-center gap-2 text-[16px] font-semibold"
        style={{ color: Colors.textMain }}
      >
        Imágenes cargadas
      </h2>

      <div className="space-y-[2%]">
        {images.map((img) => (
          <div
            key={img.id}
            className="mx-auto flex h-[150px] w-[747px] items-center justify-between rounded-lg bg-gray-50 px-6"
          >
            {/* Imagen */}
            <div className="flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded bg-white">
              <Image
                src={img.url}
                alt={img.name ?? `Imagen ${img.id}`}
                width={100}
                height={100}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Detalles */}
            <div className="ml-6 flex-1">
              <p
                className="text-[16px] font-medium"
                style={{ color: Colors.textMain }}
              >
                {img.name ?? 'Sin nombre'}
              </p>
              <p className="text-sm text-gray-500">
                {img.size ? formatBytes(img.size) : 'Tamaño no disponible'}
              </p>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-6 text-gray-500">
              <a
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-gray-700"
              >
                <EyeIcon className="h-5 w-5" />
                <span>Ver</span>
              </a>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(img.url);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);

                    const link = document.createElement('a');
                    link.href = url;
                    link.download = img.name ?? `imagen-${img.id}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);

                    toast.success('Descarga iniciada con éxito');
                  } catch (error) {
                    console.error('Error descargando la imagen:', error);
                    toast.error('No se pudo descargar la imagen');
                  }
                }}
                className="flex items-center gap-1 hover:text-gray-700"
              >
                <InboxArrowDownIcon className="h-5 w-5" />
                <span>Descargar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
