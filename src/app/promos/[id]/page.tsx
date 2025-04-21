'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import ModalConfirm from '@/components/ModalConfirm';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast, ToastContainer } from 'react-toastify';
import { format } from 'date-fns';
import { PromoResponse } from '@pharmatech/sdk/types';

export default function PromoDetailsPage() {
  const params = useParams();
  const id = params?.id && typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const [promo, setPromo] = useState<PromoResponse | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => {
    if (typeof window === 'undefined') return '';
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken')
    );
  };

  useEffect(() => {
    const fetchPromo = async () => {
      const token = getToken();
      if (!token || typeof id !== 'string') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.promo.getById(id, token);

        if (
          typeof response.startAt !== 'string' ||
          typeof response.expiredAt !== 'string'
        ) {
          throw new Error('El formato de fecha no es válido');
        }

        setPromo(response);
      } catch (error) {
        console.error('Error al obtener la promoción:', error);
        toast.error('Error al cargar la promoción');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromo();
  }, [id]);

  const handleEdit = () => {
    if (promo && typeof id === 'string') {
      router.push(`/promos/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!promo || typeof id !== 'string') return;

    const token = getToken();
    if (!token) {
      toast.error('Error de autenticación');
      return;
    }

    try {
      await api.promo.delete(id, token);
      toast.success('Promoción eliminada exitosamente');
      router.push('/promos');
    } catch (error) {
      console.error('Error al eliminar la promoción:', error);
      toast.error('Error al eliminar la promoción');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleCancelDelete = () => setShowDeleteModal(false);

  const formatDate = (date: Date) => {
    try {
      return format(date, 'dd/MM/yyyy');
    } catch {
      return date.toString();
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
            <p className="text-center text-[16px]">Cargando promoción...</p>
          </main>
        </div>
      </div>
    );
  }

  if (!promo) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
            <p className="text-center text-[16px] text-red-500">
              No se pudo cargar la promoción
            </p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
            <div className="mx-auto mb-4 max-w-[904px]">
              <Breadcrumb
                items={[
                  { label: 'Promociones', href: '/promos' },
                  {
                    label: `Promoción #${promo.id.slice(0, 3)}`,
                    href: '',
                  },
                ]}
              />
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                  Promoción #{promo.id.slice(0, 3)}
                </h1>
                <div className="flex gap-6">
                  <Button
                    color={Colors.secondaryWhite}
                    paddingX={4}
                    paddingY={4}
                    textSize="16"
                    width="173px"
                    height="48px"
                    onClick={() => setShowDeleteModal(true)}
                    className="border-red-600 hover:border-red-600 hover:bg-red-50"
                    textColor={Colors.semanticDanger}
                  >
                    Eliminar Promoción
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
                    Editar Promoción
                  </Button>
                </div>
              </div>
            </div>

            <ModalConfirm
              isOpen={showDeleteModal}
              onClose={handleCancelDelete}
              onConfirm={handleDelete}
              title="Eliminar Promoción"
              description="¿Deseas eliminar esta Promoción? Esta acción hará que la Promoción deje de estar disponible para su selección en el sistema."
              cancelText="Cancelar"
              confirmText="Eliminar"
              width="512px"
              height="200px"
            />

            <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
              <div className="space-y-6">
                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Nombre de la Promoción
                  </label>
                  <input
                    className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:outline-none"
                    value={promo.name}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Porcentaje de descuento
                  </label>
                  <input
                    className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:outline-none"
                    value={`${promo.discount}%`}
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-[16px] font-medium text-gray-600">
                      Fecha de inicio
                    </label>
                    <input
                      className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:outline-none"
                      value={formatDate(promo.startAt)}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-[16px] font-medium text-gray-600">
                      Fecha de finalización
                    </label>
                    <input
                      className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:outline-none"
                      value={formatDate(promo.expiredAt)}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
