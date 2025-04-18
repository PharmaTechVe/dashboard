'use client';

import { EyeIcon, InboxArrowDownIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Colors } from '@/styles/styles';

type UploadedImage = {
  id: string;
  name: string;
  size: number;
  url: string;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

const images: UploadedImage[] = Array.from({ length: 5 }, (_, i) => ({
  id: `${i + 1}`,
  name: `IMG_389${i + 1}.jpg`,
  size: 6820000,
  url: 'https://via.placeholder.com/100x100.png?text=Imagen',
}));

export default function UploadedImages() {
  return (
    <div className="mx-auto h-[516px] w-[843px] overflow-auto rounded-lg bg-white p-4">
      <h2 className="mb-4 flex items-center gap-2 text-[16px] font-semibold text-purple-600">
        <span>🔹</span> Imágenes cargadas
      </h2>

      <div className="space-y-[4%]">
        {images.map((img) => (
          <div
            key={img.id}
            className="mx-auto flex h-[230px] w-[747px] items-center justify-between rounded-lg bg-gray-50 px-6"
          >
            {/* Imagen */}
            <div className="flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded bg-white">
              <Image
                src={img.url}
                alt={img.name}
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
                {img.name}
              </p>
              <p className="text-sm text-gray-500">{formatBytes(img.size)}</p>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-6 text-gray-500">
              <button className="flex items-center gap-1 hover:text-gray-700">
                <EyeIcon className="h-5 w-5" />
                <span>Ver</span>
              </button>
              <button className="flex items-center gap-1 hover:text-gray-700">
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
