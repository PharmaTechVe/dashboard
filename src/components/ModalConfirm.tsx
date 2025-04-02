import React, { useEffect, useState } from 'react';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Colors } from '@/styles/styles';

type IconType = React.FC<React.SVGProps<SVGSVGElement>>;

interface ModalConfirmProps {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  icon?: IconType;
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  width?: string;
  height?: string;
}

const ModalConfirm: React.FC<ModalConfirmProps> = ({
  isOpen,
  onClose,
  onConfirm,
  icon,
  title = 'Confirmar acción',
  description = '¿Estás seguro de realizar esta acción?',
  cancelText = 'Cancelar',
  confirmText = 'Confirmar',
  width = '512px',
  height = '200px',
}) => {
  const [show, setShow] = useState(false);
  const [render, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
      setTimeout(() => setRender(false), 300); // Delay unmount until animation ends
    }
  }, [isOpen]);

  if (!render) return null;

  const IconComponent = icon || ExclamationTriangleIcon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300">
      <div
        className={`relative transform rounded-xl bg-white p-6 shadow-md transition-all duration-300 ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{ width, height }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div className="flex items-start gap-4">
          <div className="mt-1 flex items-center justify-center">
            <IconComponent className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="mb-1 text-[18px] font-semibold text-[#393938]">
              {title}
            </h2>
            <p className="max-w-[430px] text-[14px] text-[#777]">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md px-4 py-2 text-sm text-white hover:opacity-90"
            style={{ backgroundColor: Colors.semanticDanger }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirm;
