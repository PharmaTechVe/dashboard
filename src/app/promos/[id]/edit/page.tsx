'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast, ToastContainer } from 'react-toastify';
import { promoSchema } from '@/lib/validations/promoSchema';
import DatePicker1 from '@/components/Calendar';

export default function EditPromoPage() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [expiredAt, setExpiredAt] = useState<Date | null>(null);

  const [tempName, setTempName] = useState('');
  const [tempDiscount, setTempDiscount] = useState<number | ''>('');
  const [tempStartAt, setTempStartAt] = useState<Date | null>(null);
  const [tempExpiredAt, setTempExpiredAt] = useState<Date | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  const getToken = () => {
    if (typeof window === 'undefined') return '';
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken') ||
      ''
    );
  };

  useEffect(() => {
    const fetchPromo = async () => {
      const token = getToken();
      if (!token || typeof id !== 'string') return;

      try {
        const promo = await api.promo.getById(id, token);
        setName(promo.name);
        setDiscount(promo.discount);
        setStartAt(new Date(promo.startAt));
        setExpiredAt(new Date(promo.expiredAt));

        setTempName(promo.name);
        setTempDiscount(promo.discount);
        setTempStartAt(new Date(promo.startAt));
        setTempExpiredAt(new Date(promo.expiredAt));
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error al cargar la promoción:', error.message);
        } else {
          console.error('Error al cargar la promoción:', error);
        }
        toast.error('Error al cargar los datos de la promoción');
        router.push('/promos');
      }
    };

    fetchPromo();
  }, [id, router]);

  useEffect(() => {
    const hasChanges =
      tempName !== name ||
      tempDiscount !== discount ||
      tempStartAt?.toISOString() !== startAt?.toISOString() ||
      tempExpiredAt?.toISOString() !== expiredAt?.toISOString();

    setHasPendingChanges(hasChanges);
  }, [
    tempName,
    tempDiscount,
    tempStartAt,
    tempExpiredAt,
    name,
    discount,
    startAt,
    expiredAt,
  ]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    const validationData = {
      name: tempName.trim(),
      discount: Number(tempDiscount),
      startAt: tempStartAt,
      expiredAt: tempExpiredAt,
    };

    const validationResult = promoSchema.safeParse(validationData);

    if (!validationResult.success) {
      const { fieldErrors } = validationResult.error.flatten();
      setErrors({
        name: fieldErrors.name?.[0] ?? '',
        discount: fieldErrors.discount?.[0] ?? 'Debe ser entre 1 y 100',
        startAt: fieldErrors.startAt?.[0] ?? '',
        expiredAt: fieldErrors.expiredAt?.[0] ?? '',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const token = getToken();
      if (!token || typeof id !== 'string') {
        toast.error('Token o ID inválido');
        setIsSubmitting(false);
        return;
      }

      await api.promo.update(
        id,
        {
          name: tempName.trim(),
          discount: Number(tempDiscount),
          startAt: tempStartAt as Date,
          expiredAt: tempExpiredAt as Date,
        },
        token,
      );

      toast.success('Promoción actualizada exitosamente');
      setTimeout(() => router.push(`/promos/${id}`), 1500);
    } catch (error: unknown) {
      console.error('Error al actualizar la promoción:', error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as Error)?.message ||
        'Error desconocido';
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: fieldName, value } = e.target;
    if (fieldName === 'name') {
      setTempName(value.trimStart());
    } else if (fieldName === 'discount') {
      setTempDiscount(value === '' ? '' : Number(value));
    }
    setErrors((prev) => ({ ...prev, [fieldName]: '' }));
  };

  const handleStartSelect = (dateStr: string) => {
    const date = new Date(dateStr);
    setTempStartAt(date);
    setErrors((prev) => ({ ...prev, startAt: '' }));
    if (tempExpiredAt && date > tempExpiredAt) {
      setTempExpiredAt(date);
    }
  };

  const handleExpiredSelect = (dateStr: string) => {
    const date = new Date(dateStr);
    setTempExpiredAt(date);
    setErrors((prev) => ({ ...prev, expiredAt: '' }));
  };

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
                    label: `Promoción #${typeof id === 'string' ? id.slice(0, 3) : ''}`,
                    href: `/promos/${id}`,
                  },
                  { label: 'Editar', href: '' },
                ]}
              />
            </div>

            <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                  Editar Promoción #
                  {typeof id === 'string' ? id.slice(0, 3) : ''}
                </h1>
                <div className="flex gap-4">
                  <Button
                    color={Colors.secondaryWhite}
                    paddingX={4}
                    paddingY={4}
                    textSize="16"
                    width="120px"
                    height="44px"
                    onClick={() => router.push(`/promos/${id}`)}
                    textColor={Colors.primary}
                  >
                    Cancelar
                  </Button>
                  <Button
                    color={Colors.primary}
                    paddingX={4}
                    paddingY={4}
                    textSize="16"
                    width="196px"
                    height="44px"
                    onClick={handleSubmit}
                    textColor={Colors.textWhite}
                    disabled={!hasPendingChanges || isSubmitting}
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                <div className="flex flex-col md:flex-row md:space-x-4">
                  <div className="md:w-1/2">
                    <label className="block text-[16px] font-medium text-gray-600">
                      Nombre de la Promoción
                    </label>
                    <input
                      type="text"
                      name="name"
                      className={`mt-1 w-full rounded-md border ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0`}
                      value={tempName}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="mt-4 md:mt-0 md:w-1/2">
                    <label className="block text-[16px] font-medium text-gray-600">
                      Porcentaje de descuento
                    </label>
                    <input
                      type="number"
                      name="discount"
                      className={`mt-1 w-full rounded-md border ${
                        errors.discount ? 'border-red-500' : 'border-gray-300'
                      } p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0`}
                      value={tempDiscount}
                      onChange={handleChange}
                      min="1"
                      max="100"
                    />
                    {errors.discount && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.discount}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                  <div className="w-full md:w-1/2">
                    <label className="block text-[16px] font-medium text-gray-600">
                      Fecha de inicio
                    </label>
                    <DatePicker1 onDateSelect={handleStartSelect} />
                    {errors.startAt && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.startAt}
                      </p>
                    )}
                  </div>

                  <div className="w-full md:w-1/2">
                    <label className="block text-[16px] font-medium text-gray-600">
                      Fecha de finalización
                    </label>
                    <DatePicker1 onDateSelect={handleExpiredSelect} />
                    {errors.expiredAt && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.expiredAt}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
      <ToastContainer autoClose={5000} />
    </>
  );
}
