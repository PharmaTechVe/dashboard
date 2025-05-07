'use client';

import React from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  accept = '.csv',
  label = 'Selecciona un archivo CSV',
  inputRef,
}) => {
  const internalRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = inputRef || internalRef;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col items-start space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer rounded-md border border-dashed border-gray-400 bg-gray-50 px-4 py-3 text-sm text-gray-600 transition hover:border-blue-500 hover:bg-blue-50"
      >
        Haz clic aquí o arrastra un archivo
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUploader;
