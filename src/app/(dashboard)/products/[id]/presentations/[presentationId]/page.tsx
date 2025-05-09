'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import ModalConfirm from '@/components/ModalConfirm';
import type { ProductPresentationResponse } from '@pharmatech/sdk';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/Input/Input';

export default function ViewProductPresentationPage() {
  const params = useParams();
  const productId =
    params?.id && typeof params.id === 'string' ? params.id : '';
  const presentationId =
    params?.presentationId &&
    typeof params.presentationId === 'string' &&
    params.presentationId !== 'undefined'
      ? params.presentationId
      : '';
  const router = useRouter();
  const { token } = useAuth();
  const [presentation, setPresentation] =
    useState<ProductPresentationResponse | null>(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchPresentation() {
      if (
        !token ||
        !productId ||
        !presentationId ||
        typeof productId !== 'string' ||
        typeof presentationId !== 'string'
      )
        return;
      try {
        console.log(productId, presentationId);
        const data = await api.productPresentation.getByPresentationId(
          productId,
          presentationId,
        );
        setPresentation(data);
      } catch (err) {
        console.error('Error fetching product presentation:', err);
        setError('Error cargando la presentación.');
      }
    }

    if (presentationId) fetchPresentation();
  }, [productId, presentationId, token]);

  const handleDelete = async () => {
    if (
      !token ||
      typeof productId !== 'string' ||
      typeof presentationId !== 'string'
    ) {
      toast.error('Error: token o ID inválido');
      return;
    }

    try {
      await api.productPresentation.delete(productId, presentationId);
      toast.success('Presentación eliminada exitosamente');
      setTimeout(() => {
        router.push(`/products/${productId}`);
      }, REDIRECTION_TIMEOUT);
    } catch (err) {
      console.error('Error al eliminar presentación:', err);
      toast.error('No se pudo eliminar la presentación');
    }
  };

  const handleEdit = () => {
    router.push(`/products/${productId}/presentations/${presentationId}/edit`);
  };

  const breadcrumbItems = [
    { label: 'Productos', href: '/products' },
    { label: `#${productId}`, href: `/products/${productId}` },
    { label: 'Ver presentación', href: '' },
  ];

  if (error || !presentation)
    return (
      <p className="p-4 text-lg">{error || 'Presentación no encontrada.'}</p>
    );

  return (
    <>
      <div className="mx-auto mb-4 max-w-[904px]">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mb-6 flex items-center justify-between">
          <h1
            className="text-[28px] font-normal leading-none"
            style={{ color: Colors.textMain }}
          >
            Ver presentación
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
              Eliminar presentación
            </Button>
            <Button
              color={Colors.primary}
              paddingX={4}
              paddingY={4}
              textSize="16"
              width="177px"
              height="48px"
              onClick={handleEdit}
              textColor={Colors.textWhite}
            >
              Editar presentación
            </Button>
          </div>
        </div>
      </div>
      <ModalConfirm
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        title="Eliminar Presentación"
        description="¿Estás seguro de que deseas eliminar esta presentación? Esta acción no se puede deshacer."
        cancelText="Cancelar"
        confirmText="Eliminar"
        width="512px"
        height="200px"
      />
      <div className="mx-auto max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
        <div>
          <Input
            label="Presentación"
            value={`${presentation.presentation.name} | ${presentation.presentation.quantity} ${presentation.presentation.measurementUnit}`}
            readViewOnly
          />
        </div>
        <div>
          <Input
            label="Promoción"
            value={presentation.promo?.name || 'Sin promoción'}
            readViewOnly
          />
        </div>
        <div>
          <Input
            label="Precio"
            value={presentation.price.toFixed(2)}
            readViewOnly
          />
        </div>
      </div>
    </>
  );
}
