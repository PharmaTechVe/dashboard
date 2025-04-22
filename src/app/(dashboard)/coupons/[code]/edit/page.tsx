'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Calendar from '@/components/Calendar';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { couponSchema } from '@/lib/validations/couponsSchema';
import { useAuth } from '@/context/AuthContext';

export default function EditCouponPage() {
  const params = useParams();
  const id = params?.code && typeof params.code === 'string' ? params.code : '';
  const router = useRouter();
  const { token } = useAuth();

  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [minPurchase, setMinPurchase] = useState<number | ''>('');
  const [maxUses, setMaxUses] = useState<number | ''>('');
  const [expirationDate, setExpirationDate] = useState<string | null>(null);

  const [tempCode, setTempCode] = useState('');
  const [tempDiscount, setTempDiscount] = useState<number | ''>('');
  const [tempMinPurchase, setTempMinPurchase] = useState<number | ''>('');
  const [tempMaxUses, setTempMaxUses] = useState<number | ''>('');
  const [tempExpirationDate, setTempExpirationDate] = useState<string | null>(
    null,
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  useEffect(() => {
    const fetchCoupon = async () => {
      if (!token || typeof id !== 'string') {
        toast.error('Error');
        return;
      }

      try {
        const response = await api.coupon.getByCode(id, token);

        const expirationDate = new Date(response.expirationDate);

        setCode(response.code);
        setDiscount(response.discount);
        setMinPurchase(response.minPurchase);
        setMaxUses(response.maxUses);
        setExpirationDate(expirationDate.toISOString());

        setTempCode(response.code);
        setTempDiscount(response.discount);
        setTempMinPurchase(response.minPurchase);
        setTempMaxUses(response.maxUses);
        setTempExpirationDate(expirationDate.toISOString());
      } catch (error) {
        console.error('Error al cargar el cupón:', error);
        toast.error('Error al cargar los datos del cupón');
        router.push('/coupons');
      }
    };

    fetchCoupon();
  }, [id, router, token]);

  useEffect(() => {
    const hasChanges =
      tempCode !== code ||
      tempDiscount !== discount ||
      tempMinPurchase !== minPurchase ||
      tempMaxUses !== maxUses ||
      tempExpirationDate !== expirationDate;

    setHasPendingChanges(hasChanges);
  }, [
    tempCode,
    tempDiscount,
    tempMinPurchase,
    tempMaxUses,
    tempExpirationDate,
    code,
    discount,
    minPurchase,
    maxUses,
    expirationDate,
  ]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    if (!tempExpirationDate) {
      setErrors({ expirationDate: 'La fecha de finalización es requerida' });
      setIsSubmitting(false);
      return;
    }

    const validationData = {
      code: tempCode.trim(),
      discount: Number(tempDiscount),
      minPurchase: Number(tempMinPurchase),
      maxUses: Number(tempMaxUses),
      expirationDate: new Date(tempExpirationDate),
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

    try {
      if (!token) {
        toast.error('Error');
        return;
      }

      await api.coupon.update(
        id,
        {
          code: tempCode.trim(),
          discount: Number(tempDiscount),
          minPurchase: Number(tempMinPurchase),
          maxUses: Number(tempMaxUses),
          expirationDate: new Date(tempExpirationDate),
        },
        token,
      );

      toast.success('Cupón actualizado exitosamente');
      setTimeout(() => router.push(`/coupons/${id}`), 1500);
    } catch (error) {
      console.error('Error al actualizar el cupón:', error);
      toast.error('Error al actualizar el cupón');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: fieldName, value } = e.target;

    if (fieldName === 'code') {
      setTempCode(value.trimStart());
    } else if (fieldName === 'discount') {
      setTempDiscount(value === '' ? '' : Number(value));
    } else if (fieldName === 'minPurchase') {
      setTempMinPurchase(value === '' ? '' : Number(value));
    } else if (fieldName === 'maxUses') {
      setTempMaxUses(value === '' ? '' : Number(value));
    }

    setErrors((prev) => ({ ...prev, [fieldName]: '' }));
  };

  const handleDateChange = (date: string) => {
    setTempExpirationDate(date);
    setErrors((prev) => ({ ...prev, expirationDate: '' }));
  };

  return (
    <>
      <div className="mx-auto mb-4 max-w-[904px]">
        <Breadcrumb
          items={[
            { label: 'Cupones', href: '/coupons' },
            { label: `Cupón #${code}`, href: `/coupons/${code}` },
            { label: 'Editar', href: '' },
          ]}
        />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-normal leading-none text-[#393938]">
            Editar Cupón {code}
          </h1>
          <div className="flex gap-4">
            <Button
              color={Colors.secondaryWhite}
              paddingX={4}
              paddingY={4}
              textSize="16"
              width="120px"
              height="44px"
              onClick={() => router.push(`/coupons/`)}
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
      </div>

      <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <p className="text-[16px] font-medium text-gray-600">
            Edita la información del cupón
          </p>

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
              value={tempCode}
              onChange={handleChange}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-500">{errors.code}</p>
            )}
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:gap-6">
            <div className="w-full md:w-1/2">
              <label className="block text-[16px] font-medium text-gray-600">
                Fecha de finalización
              </label>
              <Calendar onDateSelect={handleDateChange} />
              {errors.expirationDate && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.expirationDate}
                </p>
              )}
            </div>

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
                value={tempMaxUses}
                onChange={handleChange}
                min="1"
              />
              {errors.maxUses && (
                <p className="mt-1 text-sm text-red-500">{errors.maxUses}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:gap-6">
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
                value={tempDiscount}
                onChange={handleChange}
                min="1"
                max="100"
              />
              {errors.discount && (
                <p className="mt-1 text-sm text-red-500">{errors.discount}</p>
              )}
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-[16px] font-medium text-gray-600">
                Compra mínima
              </label>
              <input
                type="number"
                name="minPurchase"
                className={`mt-1 w-full rounded-md border ${
                  errors.minPurchase ? 'border-red-500' : 'border-gray-300'
                } p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0`}
                value={tempMinPurchase}
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
    </>
  );
}
