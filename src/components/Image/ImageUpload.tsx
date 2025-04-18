'use client';

import React, { useRef, useState } from 'react';
import {
  XMarkIcon,
  EyeIcon,
  TrashIcon,
  DocumentPlusIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

interface FileWithProgress {
  id: string;
  file: File;
  progress: number;
  uploadedUrl: string | null;
}

interface ImageUploadProps {
  productId: string;
}

export default function ImageUpload({ productId }: ImageUploadProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const currentCount = files.length;
    const incomingFiles = Array.from(fileList).slice(0, 5 - currentCount);

    const filesToAdd: FileWithProgress[] = incomingFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      progress: 0,
      uploadedUrl: null,
    }));

    setFiles((prev) => [...prev, ...filesToAdd]);

    filesToAdd.forEach((file) => uploadToCloudinary(file));
  };

  const uploadToCloudinary = async (fileObj: FileWithProgress) => {
    try {
      const res = await fetch(`/api/sign-cloudinary?productId=${productId}`);
      const { signature, timestamp, apiKey, cloudName, folder } =
        await res.json();

      const formData = new FormData();
      formData.append('file', fileObj.file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const xhr = new XMLHttpRequest();
      xhr.open(
        'POST',
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      );

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setFiles((prev) =>
            prev.map((f) => (f.id === fileObj.id ? { ...f, progress } : f)),
          );
        }
      });

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileObj.id
                  ? { ...f, progress: 100, uploadedUrl: response.secure_url }
                  : f,
              ),
            );
          } else {
            console.error('Upload failed:', xhr.responseText);
          }
        }
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Error during upload:', error);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="mx-auto max-h-[600px] w-[843px] overflow-y-auto rounded-lg bg-white p-6">
      <div
        className={`mx-auto flex h-[230px] w-[747px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-[#374CBE] bg-[#769CE4]/10'
            : 'border-[#769CE4] bg-[#769CE4]/10'
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
          Arrastra y suelta las fotos del
          <br />
          producto o{' '}
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

      {/* Progress & Previews */}
      <div className="mt-6 space-y-4">
        {files.map((file) => (
          <div key={file.id} className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3 h-10 w-8 text-gray-400">
                  <DocumentIcon className="h-6 w-6" />
                </div>
                <span className="text-gray-700">{file.file.name}</span>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => handleRemoveFile(file.id)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#374CBE]"
                style={{ width: `${file.progress}%` }}
              ></div>
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

            {file.uploadedUrl && (
              <div className="mt-4 flex items-center border-t pt-4">
                <div className="mr-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-gray-100">
                  <img
                    src={file.uploadedUrl}
                    alt={file.file.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">{file.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatBytes(file.file.size)}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <a
                    href={file.uploadedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </a>
                  <button
                    className="text-gray-500 hover:text-red-500"
                    onClick={() => handleRemoveFile(file.id)}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
