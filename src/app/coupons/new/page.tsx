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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { couponSchema } from '@/lib/validations/couponsSchema';

type CouponCreatePayload = {
  code: string;
  discount: number;
  minPurchase: number;
  maxUses: number;
  expirationDate: Date;
};

type ErrorsType = {
  code?: string;
  discount?: string;
  minPurchase?: string;
  maxUses?: string;
  expirationDate?: string;
};

export default function NewCouponPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [minPurchase, setMinPurchase] = useState<number | ''>('');
  const [maxUses, setMaxUses] = useState<number | ''>('');
  const [expirationDate, setExpirationDate] = useState<Date | null>(new Date());
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
      case 'code':
        setCode(value.trimStart());
        break;
      case 'discount':
        setDiscount(value === '' ? '' : Number(value));
        break;
      case 'minPurchase':
        setMinPurchase(value === '' ? '' : Number(value));
        break;
      case 'maxUses':
        setMaxUses(value === '' ? '' : Number(value));
        break;
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setExpirationDate(date);
    if (errors.expirationDate) {
      setErrors((prev) => ({ ...prev, expirationDate: '' }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    if (!expirationDate) {
      setErrors({
        expirationDate: 'La fecha de finalización es requerida',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const validationData = {
        code: code.trim(),
        discount: Number(discount),
        minPurchase: Number(minPurchase),
        maxUses: Number(maxUses),
        expirationDate,
      };

      const validationResult = couponSchema.safeParse(validationData);
      if (!validationResult.success) {
        const { fieldErrors } = validationResult.error.flatten();
        setErrors({
          code: fieldErrors.code?.[0] ?? '',
          discount: fieldErrors.discount?.[0] ?? '',
          minPurchase: fieldErrors.minPurchase?.[0] ?? '',
          maxUses: fieldErrors.maxUses?.[0] ?? '',
          expirationDate: fieldErrors.expirationDate?.[0] ?? '',
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

      const couponData: CouponCreatePayload = {
        code: code.trim(),
        discount: Number(discount),
        minPurchase: Number(minPurchase),
        maxUses: Number(maxUses),
        expirationDate: expirationDate as Date,
      };

      await api.coupon.create(couponData, token);
      toast.success('Cupón creado exitosamente');
      setTimeout(() => router.push('/coupons'), 1500);
    } catch (error: any) {
      console.error('Error al crear el cupón:', error);
      let errorMessage = 'Ocurrió un error al crear el cupón';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
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
                  { label: 'Cupones', href: '/coupons' },
                  { label: 'Nuevo Cupón', href: '' },
                ]}
              />
            </div>
            <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                  Nuevo Cupón
                </h1>
                <div className="flex gap-4">
                  <Button
                    color={Colors.secondaryWhite}
                    paddingX={4}
                    paddingY={4}
                    textSize="16"
                    width="120px"
                    height="44px"
                    onClick={() => router.push('/coupons')}
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
                    {isSubmitting ? 'Creando...' : 'Agregar Cupón'}
                  </Button>
                </div>
              </div>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <p className="text-[16px] font-medium text-gray-600">
                  Agrega la información del cupón
                </p>

                {/* Código del cupón */}
                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Código del cupón
                  </label>
                  <input
                    type="text"
                    name="code"
                    className={`mt-1 w-full rounded-md border ${
                      errors.code ? 'border-red-500' : 'border-gray-300'
                    } p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0`}
                    placeholder="Agrega el código del cupón"
                    value={code}
                    onChange={handleChange}
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-500">{errors.code}</p>
                  )}
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                  {/* Fecha de finalización */}
                  <div className="w-full md:w-1/2">
                    <label className="block text-[16px] font-medium text-gray-600">
                      Fecha de finalización
                    </label>
                    <DatePicker
                      selected={expirationDate}
                      onChange={handleDateChange}
                      dateFormat="dd/MM/yyyy"
                      className={`mt-1 w-full rounded-md border ${
                        errors.expirationDate
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0`}
                      placeholderText="DD/MM/AAAA"
                      minDate={new Date()}
                      showTimeSelect={false}
                    />
                    {errors.expirationDate && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.expirationDate}
                      </p>
                    )}
                  </div>

                  {/* Usos máximos */}
                  <div className="w-full md:w-1/2">
                    <label className="block text-[16px] font-medium text-gray-600">
                      Usos máximos
                    </label>
                    <input
                      type="number"
                      name="maxUses"
                      className={`mt-1 w-full rounded-md border ${
                        errors.maxUses ? 'border-red-500' : 'border-gray-300'
                      } p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0`}
                      placeholder="Agrega los usos máximos"
                      value={maxUses}
                      onChange={handleChange}
                      min="1"
                    />
                    {errors.maxUses && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.maxUses}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:gap-6">
                  {/* Porcentaje de descuento */}
                  <div className="w-full md:w-1/2">
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

                  {/* Compra mínima */}
                  <div className="w-full md:w-1/2">
                    <label className="block text-[16px] font-medium text-gray-600">
                      Compra mínima
                    </label>
                    <input
                      type="number"
                      name="minPurchase"
                      className={`mt-1 w-full rounded-md border ${
                        errors.minPurchase
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0`}
                      placeholder="Agrega la compra mínima"
                      value={minPurchase}
                      onChange={handleChange}
                      min="0"
                      step="1" 
                    />
                    {errors.minPurchase && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.minPurchase}
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
