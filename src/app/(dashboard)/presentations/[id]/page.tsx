'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import ModalConfirm from '@/components/ModalConfirm';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { Presentation } from '@pharmatech/sdk';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { useAuth } from '@/context/AuthContext';

export default function PresentationDetailPage() {
  const params = useParams();
  const id = params?.id && typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const { token } = useAuth();

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchPresentation() {
      if (!token || typeof id !== 'string') return;

      try {
        const data: Presentation = await api.presentation.getById(id, token);
        setPresentation(data);
      } catch (error) {
        toast.error('Error al cargar la presentación');
        console.error(error);
      } finally {
      }
    }

    if (id) fetchPresentation();
  }, [id, token]);

  const handleDelete = async () => {
    if (!token || typeof id !== 'string') return;

    try {
      await api.presentation.delete(id, token);
      toast.success('Presentación eliminada exitosamente');
      setTimeout(() => {
        router.push('/presentations');
      }, REDIRECTION_TIMEOUT);
    } catch (err) {
      console.error('Error al eliminar la presentación:', err);
      toast.error('No se pudo eliminar la presentación');
    }
  };

  const handleCancel = () => setShowModal(false);

  const breadcrumbItems = [
    { label: 'Presentaciones', href: '/presentations' },
    { label: presentation?.name || 'Presentación', href: '' },
  ];

  if (!presentation)
    return <p className="p-4 text-lg">Presentación no encontrada</p>;

  return (
    <>
      <div className="mx-auto mb-4 max-w-[904px]">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-normal leading-none text-[#393938]">
            {presentation.name}
          </h1>
          <div className="flex gap-6">
            <Button
              color={Colors.secondaryWhite}
              paddingX={4}
              paddingY={4}
              textSize="16"
              width="173px"
              height="48px"
              onClick={() => setShowModal(true)}
              className="border-red-600 hover:border-red-600 hover:bg-red-50"
              textColor={Colors.semanticDanger}
            >
              Eliminar Presentación
            </Button>
            <Button
              color={Colors.primary}
              paddingX={4}
              paddingY={4}
              textSize="16"
              width="177px"
              height="48px"
              onClick={() => router.push(`/presentations/${id}/edit`)}
              textColor={Colors.textWhite}
            >
              Editar Presentación
            </Button>
          </div>
        </div>
      </div>

      <ModalConfirm
        isOpen={showModal}
        onClose={handleCancel}
        onConfirm={handleDelete}
        title="Eliminar Presentación"
        description="¿Estás seguro de que deseas eliminar esta presentación? Esta acción no se puede deshacer."
        cancelText="Cancelar"
        confirmText="Eliminar"
        width="512px"
        height="200px"
      />

      <div className="mx-auto max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
        <p className="text-[16px] font-normal leading-6 text-[#393938]">
          Detalles de la presentación
        </p>
        <div>
          <label className="block text-[16px] font-medium text-gray-600">
            Nombre
          </label>
          <input
            readOnly
            value={presentation.name}
            className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
          />
        </div>
        <div className="flex space-x-4">
          <div className="w-1/2">
            <label className="block text-[16px] font-medium text-gray-600">
              Unidad de medida
            </label>
            <input
              readOnly
              value={presentation.measurementUnit}
              className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-[16px] font-medium text-gray-600">
              Cantidad del producto
            </label>
            <input
              readOnly
              value={presentation.quantity}
              className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
            />
          </div>
        </div>
        <div>
          <label className="block text-[16px] font-medium text-gray-600">
            Descripción
          </label>
          <textarea
            readOnly
            value={presentation.description || ''}
            className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
          />
        </div>
      </div>
    </>
  );
}
