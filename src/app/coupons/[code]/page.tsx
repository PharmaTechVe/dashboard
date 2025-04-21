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
import { CouponResponse } from '@pharmatech/sdk/types';

export default function CouponDetailsPage() {
  const params = useParams();
  const code =
    params?.code && typeof params.code === 'string' ? params.code : '';
  const router = useRouter();
  const [coupon, setCoupon] = useState<CouponResponse | null>(null);
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
    const fetchCoupon = async () => {
      console.log('Fetching coupon with code:', code);
      const token = getToken();
      if (!token || !code) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.coupon.getByCode(code, token);
        setCoupon(response);
      } catch (error) {
        console.error('Error al obtener el cupón:', error);
        toast.error('Error al cargar el cupón');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupon();
  }, [code]);

  const handleEdit = () => {
    if (coupon) {
      router.push(`/coupons/${code}/edit`);
    }
  };

  const handleDelete = async () => {
    const token = getToken();
    if (!token || !coupon) {
      toast.error('Error de autenticación');
      return;
    }

    try {
      await api.coupon.delete(code, token);
      toast.success('Cupón eliminado exitosamente');
      router.push('/coupons');
    } catch (error) {
      console.error('Error al eliminar el cupón:', error);
      toast.error('Error al eliminar el cupón');
    } finally {
      setShowDeleteModal(false);
    }
  };

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
            <p className="text-center text-[16px]">Cargando cupón...</p>
          </main>
        </div>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
            <p className="text-center text-[16px] text-red-500">
              No se pudo cargar el cupón
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
                  { label: 'Cupones', href: '/coupons' },
                  { label: `Cupón #${coupon.id.slice(0, 3)}`, href: '' },
                ]}
              />
            </div>

            <ModalConfirm
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={handleDelete}
              title="Eliminar Cupón"
              description="¿Deseas eliminar este cupón? Esta acción hará que el cupón deje de estar disponible para su selección en el sistema."
              cancelText="Cancelar"
              confirmText="Eliminar"
              width="512px"
              height="200px"
            />

            <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                  Cupón #{coupon.id.slice(0, 3)}
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
                    Eliminar Cupón
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
                    Editar Cupón
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Código del cupón
                  </label>
                  <p className="mt-1 w-full rounded-md bg-gray-200 p-2 text-[16px]">
                    {coupon.code}
                  </p>
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Fecha de finalización
                  </label>
                  <p className="mt-1 w-full rounded-md bg-gray-200 p-2 text-[16px]">
                    {formatDate(coupon.expirationDate)}
                  </p>
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Usos máximos
                  </label>
                  <p className="mt-1 w-full rounded-md bg-gray-200 p-2 text-[16px]">
                    {coupon.maxUses}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h2 className="text-[20px] font-medium text-gray-800">
                    Detalles del descuento
                  </h2>
                  <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-[16px] font-medium text-gray-600">
                        Porcentaje de descuento
                      </label>
                      <p className="mt-1 w-full rounded-md bg-gray-200 p-2 text-[16px]">
                        {`${coupon.discount}%`}
                      </p>
                    </div>

                    <div>
                      <label className="block text-[16px] font-medium text-gray-600">
                        Compra mínima
                      </label>
                      <p className="mt-1 w-full rounded-md bg-gray-200 p-2 text-[16px]">
                        {`$${coupon.minPurchase.toFixed(2)}`}
                      </p>
                    </div>
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
