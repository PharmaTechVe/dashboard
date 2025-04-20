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
import { api } from '@/lib/sdkConfig';
import { useAuth } from '@/context/AuthContext';
import ModalConfirm from '@/components/ModalConfirm';

interface FileWithProgress {
  id: string;
  file: File;
  previewUrl: string;
  progress?: number;
  uploadedUrl?: string;
  fromBackend?: boolean;
  completed?: boolean; // indica que ya puede mostrarse la preview
}

interface ImageUploadProps {
  productId: string;
}

type UploadedImage = {
  id: string;
  url: string;
  name?: string;
  size?: number;
};

const LOCAL_KEY = (productId: string) => `image-upload-buffer-${productId}`;

export default function ImageUpload({ productId }: ImageUploadProps) {
  const { token } = useAuth();
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileWithProgress | null>(
    null,
  );

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response: UploadedImage[] =
          await api.productImage.getByProductId(productId);
        const enriched = response.map((img) => ({
          id: img.id,
          file: new File([], img.name ?? `imagen-${img.id}`),
          previewUrl: img.url,
          uploadedUrl: img.url,
          fromBackend: true,
        }));
        setFiles((prev) => {
          const local = prev.filter((f) => !f.fromBackend);
          return [...enriched, ...local];
        });
      } catch (err) {
        console.error('Error al cargar las imágenes:', err);
      }
    };
    if (token) fetchImages();
  }, [token, productId]);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY(productId));
    if (saved) {
      const parsed: { id: string; name: string; previewUrl: string }[] =
        JSON.parse(saved);
      const restored: FileWithProgress[] = parsed.map((f) => ({
        id: f.id,
        file: new File([], f.name),
        previewUrl: f.previewUrl,
        progress: 100,
        completed: true,
      }));
      setFiles((prev) => [...prev, ...restored]);
    }
  }, [productId]);

  useEffect(() => {
    const toSave = files
      .filter((f) => !f.fromBackend && !f.uploadedUrl)
      .map((f) => ({
        id: f.id,
        name: f.file.name,
        previewUrl: f.previewUrl,
      }));
    localStorage.setItem(LOCAL_KEY(productId), JSON.stringify(toSave));
  }, [files, productId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) =>
          f.fromBackend || f.uploadedUrl || f.completed
            ? f
            : {
                ...f,
                progress:
                  f.progress !== undefined && f.progress < 100
                    ? f.progress + 10
                    : 100,
              },
        ),
      );
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    files.forEach((file) => {
      if (file.progress === 100 && !file.completed) {
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) => (f.id === file.id ? { ...f, completed: true } : f)),
          );
        }, 2000);
      }
    });
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleFiles = (fileList: FileList) => {
    const currentCount = files.length;
    const incomingFiles = Array.from(fileList).slice(0, 5 - currentCount);
    const newFiles: FileWithProgress[] = incomingFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      progress: 0,
      completed: false,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (file: FileWithProgress) => {
    if (file.fromBackend) {
      setFileToDelete(file);
      setShowConfirmModal(true);
    } else {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      toast.info('Imagen eliminada del preview');
    }
  };

  const confirmRemoveBackend = async () => {
    if (!fileToDelete) return;
    try {
      await api.productImage.delete(productId, fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      toast.success('Imagen eliminada');
    } catch {
      toast.error('No se pudo eliminar la imagen');
    } finally {
      setShowConfirmModal(false);
      setFileToDelete(null);
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

  return (
    <div className="mx-auto max-h-[600px] w-[843px] overflow-y-auto rounded-lg bg-white p-6">
      {/* Área de carga */}
      <div
        className={`mx-auto flex h-[230px] w-[747px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
          isDragging ? 'bg-[#769CE4]/10' : 'bg-[#769CE4]/10'
        } border-[#374CBE]`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded border-2 border-[#374CBE] text-[#374CBE]">
          <DocumentPlusIcon className="h-6 w-6" />
        </div>
        <p className="text-center text-gray-600">
          Arrastra y suelta las fotos o{' '}
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

      {/* Preview */}
      <div className="mt-6 space-y-4">
        {files.map((file) => {
          if (
            !file.completed &&
            file.progress !== undefined &&
            file.progress < 100
          ) {
            return (
              <div key={file.id} className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DocumentIcon className="h-6 w-6 text-gray-400" />
                    <span className="text-gray-700">{file.file.name}</span>
                    <span className="text-sm text-gray-500">
                      {formatBytes(file.file.size || 0)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(file)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#374CBE]"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-end text-sm">
                  <span className="text-[#374CBE]">
                    Subiendo... {Math.min(file.progress, 100)}%
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div key={file.id} className="mb-4 flex items-center border-t pt-4">
              <div className="mr-4 h-16 w-16 overflow-hidden rounded bg-gray-100">
                <img
                  src={file.previewUrl}
                  alt={file.file.name}
                  className="h-full w-full object-cover"
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
                <button
                  onClick={() => handleRemoveFile(file)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {fileToDelete && (
        <ModalConfirm
          isOpen={showConfirmModal}
          title="Eliminar imagen"
          description="¿Estás seguro de que deseas eliminar esta imagen del producto?"
          confirmText="Eliminar"
          cancelText="Cancelar"
          onClose={() => {
            setShowConfirmModal(false);
            setFileToDelete(null);
          }}
          onConfirm={confirmRemoveBackend}
        />
      )}
    </div>
  );
}
