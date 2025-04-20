'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import ModalConfirm from '@/components/ModalConfirm';
import type { ProductPresentationResponse } from '@pharmatech/sdk';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { ToastContainer, toast } from 'react-toastify';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';

export default function ViewProductPresentationPage() {
  const { id: productId, presentationId: presentationId } = useParams();
  const router = useRouter();

  const [presentation, setPresentation] =
    useState<ProductPresentationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken')
    );
  }, []);

  useEffect(() => {
    async function fetchPresentation() {
      const token = getToken();
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
      } finally {
        setLoading(false);
      }
    }

    if (presentationId) fetchPresentation();
  }, [productId, presentationId, getToken]);

  const handleDelete = async () => {
    const token = getToken();
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

  if (loading) return <p className="p-4 text-lg">Cargando presentación...</p>;
  if (error || !presentation)
    return (
      <p className="p-4 text-lg">{error || 'Presentación no encontrada.'}</p>
    );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
          <div className="mx-auto mb-4 max-w-[904px]">
            <Breadcrumb items={breadcrumbItems} />
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-[28px] font-normal leading-none text-[#393938]">
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
              <label className="block text-[16px] font-medium text-gray-600">
                Presentación
              </label>
              <input
                className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
                value={`${presentation.presentation.name} | ${presentation.presentation.quantity} ${presentation.presentation.measurementUnit}`}
                readOnly
              />
            </div>
            <div>
              <label className="block text-[16px] font-medium text-gray-600">
                Promoción
              </label>
              <input
                className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
                value={presentation.promo?.name || 'Sin promoción'}
                readOnly
              />
            </div>
            <div>
              <label className="block text-[16px] font-medium text-gray-600">
                Precio
              </label>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
                value={presentation.price.toFixed(2)}
                readOnly
              />
            </div>
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
