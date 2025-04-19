'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast, ToastContainer } from 'react-toastify';
import { promoSchema } from '@/lib/validations/promoSchema';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type PromoCreatePayload = {
  name: string;
  discount: number;
  startAt: Date;
  expiredAt: Date;
};

type ErrorsType = {
  name?: string;
  discount?: string;
  startAt?: string;
  expiredAt?: string;
};

export default function NewPromotionPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [startAt, setStartAt] = useState<Date | null>(new Date());
  const [expiredAt, setExpiredAt] = useState<Date | null>(new Date());
  const [errors, setErrors] = useState<ErrorsType>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken')
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name: rawName, value } = e.target;
    const name = rawName as keyof ErrorsType;
    switch (name) {
      case 'name':
        setName(value.trimStart());
        break;
      case 'discount':
        setDiscount(value === '' ? '' : Number(value));
        break;
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    setStartAt(date);
    if (errors.startAt) {
      setErrors((prev) => ({ ...prev, startAt: '' }));
    }
    if (date && expiredAt && date > expiredAt) {
      setExpiredAt(date);
    }
  };

  const handleExpiredDateChange = (date: Date | null) => {
    setExpiredAt(date);
    if (errors.expiredAt) {
      setErrors((prev) => ({ ...prev, expiredAt: '' }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});
    if (!startAt || !expiredAt) {
      setErrors({
        startAt: !startAt ? 'La fecha de inicio es requerida' : '',
        expiredAt: !expiredAt ? 'La fecha de finalización es requerida' : '',
      });
      setIsSubmitting(false);
      return;
    }
    if (startAt >= expiredAt) {
      setErrors({
        expiredAt: 'La fecha de finalización debe ser posterior a la de inicio',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const validationData = {
        name: name.trim(),
        discount: Number(discount),
        startAt,
        expiredAt,
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

      const token = getToken();
      if (!token) {
        toast.error('No se encontró token de autenticación');
        setIsSubmitting(false);
        return;
      }

      const promoData: PromoCreatePayload = {
        name: name.trim(),
        discount: Number(discount),
        startAt: startAt as Date,
        expiredAt: expiredAt as Date,
      };

      await api.promo.create(promoData, token);
      toast.success('Promoción creada exitosamente');
      setTimeout(() => router.push('/promos'), 1500);
    } catch (error: unknown) {
      console.error('Error al crear la promoción:', error);
      let errorMessage = 'Ocurrió un error al crear la promoción';
      if (error instanceof Error) {
        if (
          (error as { response?: { data?: { message?: string } } }).response
            ?.data?.message
        ) {
          errorMessage = (
            error as unknown as { response: { data: { message: string } } }
          ).response.data.message;
        } else {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
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
                  { label: 'Nueva Promoción', href: '' },
                ]}
              />
            </div>
            <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                  Nueva Promoción
                </h1>
                <div className="flex gap-4">
                  <Button
                    color={Colors.secondaryWhite}
                    paddingX={4}
                    paddingY={4}
                    textSize="16"
                    width="120px"
                    height="44px"
                    onClick={() => router.push('/promos')}
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creando...' : 'Agregar Promoción'}
                  </Button>
                </div>
              </div>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <p className="text-[16px] font-medium text-gray-600">
                  Agrega la información de la Promoción
                </p>
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
                      placeholder="Agrega el nombre de la Promoción"
                      value={name}
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
                      placeholder="Agrega el porcentaje de descuento"
                      value={discount}
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
                    <DatePicker
                      selected={startAt}
                      onChange={handleStartDateChange}
                      dateFormat="dd/MM/yyyy"
                      className={`mt-1 w-full rounded-md border ${
                        errors.startAt ? 'border-red-500' : 'border-gray-300'
                      } p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0`}
                      placeholderText="DD/MM/AAAA"
                      minDate={new Date()}
                      showTimeSelect={false}
                    />
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
                    <DatePicker
                      selected={expiredAt}
                      onChange={handleExpiredDateChange}
                      dateFormat="dd/MM/yyyy"
                      className={`mt-1 w-full rounded-md border ${
                        errors.expiredAt ? 'border-red-500' : 'border-gray-300'
                      } p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0`}
                      placeholderText="DD/MM/AAAA"
                      minDate={startAt || new Date()}
                      showTimeSelect={false}
                    />
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
