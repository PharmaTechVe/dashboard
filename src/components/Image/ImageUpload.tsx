'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  XMarkIcon,
  EyeIcon,
  TrashIcon,
  DocumentPlusIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import Image from 'next/image';
import { api } from '@/lib/sdkConfig';
import { useAuth } from '@/context/AuthContext';
import { uploadImageToCloudinary } from '@/lib/utils/uploadImage';
import ModalConfirm from '@/components/ModalConfirm';

interface FileWithProgress {
  id: string;
  file: File;
  progress: number;
  uploadedUrl: string | null;
  fromBackend?: boolean;
  previewUrl?: string;
}

interface ImageUploadProps {
  productId: string;
  onUploadedImagesChange?: (urls: string[]) => void;
}

type UploadedImage = {
  id: string;
  url: string;
  name?: string;
  size?: number;
};

export default function ImageUpload({
  productId,
  onUploadedImagesChange,
}: ImageUploadProps) {
  const { token } = useAuth();
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileWithProgress | null>(
    null,
  );

  useEffect(() => {
    const fetchExistingImages = async () => {
      try {
        const response: UploadedImage[] =
          await api.productImage.getByProductId(productId);

        const enriched = await Promise.all(
          response.map(async (img) => {
            let size = img.size;
            if (!size) {
              try {
                const res = await fetch(img.url, { method: 'HEAD' });
                const sizeStr = res.headers.get('content-length');
                size = sizeStr ? parseInt(sizeStr, 10) : undefined;
              } catch {
                console.warn('No se pudo obtener el tama\u00f1o para', img.url);
              }
            }

            return {
              id: img.id,
              file: new File([], img.name ?? `imagen-${img.id}`),
              uploadedUrl: img.url,
              progress: 100,
              fromBackend: true,
            } as FileWithProgress;
          }),
        );

        setFiles((prev) => {
          const onlyFrontend = prev.filter((f) => !f.fromBackend);
          return [...enriched, ...onlyFrontend];
        });
      } catch (err) {
        console.error('Error al traer im\u00e1genes existentes:', err);
      }
    };

    if (token) fetchExistingImages();
  }, [productId, token]);

  useEffect(() => {
    const newUploaded = files.filter((f) => !f.fromBackend && f.uploadedUrl);
    const urls = newUploaded.map((f) => f.uploadedUrl!).filter(Boolean);
    onUploadedImagesChange?.(urls);
  }, [files, onUploadedImagesChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleFiles = (fileList: FileList) => {
    const currentCount = files.length;
    const incomingFiles = Array.from(fileList).slice(0, 5 - currentCount);

    const filesToAdd: FileWithProgress[] = incomingFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      progress: 0,
      uploadedUrl: null,
      previewUrl: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...filesToAdd]);
    filesToAdd.forEach((file) => uploadToCloudinary(file));
  };

  const uploadToCloudinary = async (fileObj: FileWithProgress) => {
    try {
      toast.info(`Subiendo \"${fileObj.file.name}\"...`);

      const uploadedUrl = await uploadImageToCloudinary(
        fileObj.file,
        productId,
        (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === fileObj.id ? { ...f, progress } : f)),
          );
        },
      );

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id ? { ...f, uploadedUrl, progress: 100 } : f,
        ),
      );

      toast.success(`\"${fileObj.file.name}\" subida con \u00e9xito`);
    } catch (error) {
      console.error('Error durante la subida:', error);
      toast.error('No se pudo subir la imagen');
    }
  };

  const handleRemoveFile = async (file: FileWithProgress) => {
    try {
      if (file.fromBackend) {
        await api.productImage.delete(productId, file.id);
        toast.success('Imagen eliminada del backend');
      } else {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
        toast.info('Imagen eliminada del preview');
      }

      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      toast.error('No se pudo eliminar la imagen');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleBrowseClick = () => fileInputRef.current?.click();
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      });
    };
  }, [files]);

  return (
    <div className="mx-auto max-h-[600px] w-[843px] overflow-y-auto rounded-lg bg-white p-6">
      <div
        className={`mx-auto flex h-[230px] w-[747px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-[#374CBE] bg-[#769CE4]/10'
            : 'border-[#374CBE] bg-[#769CE4]/10'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded border-2 border-[#374CBE] text-[#374CBE]">
          <DocumentPlusIcon className="h-6 w-6 text-[#374CBE]" />
        </div>
        <p className="text-center text-gray-600">
          Arrastra y suelta las fotos del <br /> producto o{' '}
          <button className="font-medium text-[#374CBE]">búscalas</button>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          multiple
          accept="image/*"
        />
      </div>

      <div className="mt-6 space-y-4">
        {files.map((file) => (
          <div key={file.id} className="mb-4">
            {!file.fromBackend && (
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 h-10 w-8 text-gray-400">
                    <DocumentIcon className="h-6 w-6" />
                  </div>
                  <span className="text-gray-700">{file.file.name}</span>
                </div>
                <button
                  className="text-gray-500 hover:text-red-500"
                  onClick={() => handleRemoveFile(file)}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            )}

            {!file.fromBackend && !file.uploadedUrl && (
              <>
                <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#374CBE]"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-gray-600">
                    {formatBytes(file.file.size)}
                  </span>
                  <span className="text-[#374CBE]">
                    {file.progress < 100
                      ? `Subiendo... ${Math.round(file.progress)}%`
                      : 'Completado'}
                  </span>
                </div>
              </>
            )}

            {(file.previewUrl || file.uploadedUrl) && (
              <div className="mt-4 flex items-center border-t pt-4">
                <div className="relative mr-4 h-16 w-16 overflow-hidden rounded bg-gray-100">
                  <Image
                    src={file.uploadedUrl ?? (file.previewUrl as string)}
                    alt={file.file.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-gray-700">{file.file.name}</p>
                </div>
                <div className="flex space-x-3">
                  {file.uploadedUrl && (
                    <a
                      href={file.uploadedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </a>
                  )}
                  {file.fromBackend && (
                    <button
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => {
                        setFileToDelete(file);
                        setShowConfirmModal(true);
                      }}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {fileToDelete && (
        <ModalConfirm
          isOpen={showConfirmModal}
          title="Eliminar imagen"
          description="¿Estás seguro de que deseas eliminar esta imagen?"
          confirmText="Eliminar"
          cancelText="Cancelar"
          onClose={() => {
            setShowConfirmModal(false);
            setFileToDelete(null);
          }}
          onConfirm={async () => {
            await handleRemoveFile(fileToDelete);
            setShowConfirmModal(false);
            setFileToDelete(null);
          }}
        />
      )}
    </div>
  );
}
