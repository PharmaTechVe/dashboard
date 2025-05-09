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
import Loading from '../../loading';
import Input from '@/components/Input/Input';

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

  if (!presentation) return <Loading />;

  return (
    <>
      <div className="mx-auto mb-4 max-w-[904px]">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mb-6 flex items-center justify-between">
          <h1
            className="text-[28px] font-normal leading-none"
            style={{ color: Colors.textMain }}
          >
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
        <p
          className="text-[16px] font-normal leading-6"
          style={{ color: Colors.textMain }}
        >
          Detalles de la presentación
        </p>
        <div>
          <Input label="Nombre" value={presentation.name} readViewOnly />
        </div>
        <div className="flex space-x-4">
          <div className="w-1/2">
            <Input
              label="Unidad de medida"
              value={presentation.measurementUnit}
              readViewOnly
            />
          </div>
          <div className="w-1/2">
            <Input
              label="Cantidad del producto"
              value={String(presentation.quantity)}
              readViewOnly
            />
          </div>
        </div>
        <div>
          <Input
            label="Descripción"
            placeholder="Sin descripción"
            value={presentation?.description || ''}
            readViewOnly
            isTextArea
            rows={5}
          />
        </div>
      </div>
    </>
  );
}
