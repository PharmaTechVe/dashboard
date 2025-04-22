'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Input from '@/components/Input/Input';
import Calendar from '@/components/Calendar';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { couponSchema } from '@/lib/validations/couponsSchema';

export default function NewCouponPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [minPurchase, setMinPurchase] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expirationDate, setExpirationDate] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    if (!expirationDate) {
      setErrors({ expirationDate: 'La fecha de finalización es requerida' });
      setIsSubmitting(false);
      return;
    }

    try {
      const validationData = {
        code: code.trim(),
        discount: Number(discount),
        minPurchase: Number(minPurchase),
        maxUses: Number(maxUses),
        expirationDate: new Date(expirationDate), // Convertir a Date
      };

      const validationResult = couponSchema.safeParse(validationData);
      if (!validationResult.success) {
        const { fieldErrors } = validationResult.error.flatten();
        setErrors({
          code: fieldErrors.code?.[0] || '',
          discount: fieldErrors.discount?.[0] || '',
          minPurchase: fieldErrors.minPurchase?.[0] || '',
          maxUses: fieldErrors.maxUses?.[0] || '',
          expirationDate: fieldErrors.expirationDate?.[0] || '',
        });
        setIsSubmitting(false);
        return;
      }

      const token =
        sessionStorage.getItem('pharmatechToken') ||
        localStorage.getItem('pharmatechToken');
      if (!token) {
        toast.error('No se encontró token de autenticación');
        setIsSubmitting(false);
        return;
      }

      const payload = validationResult.data;

      await api.coupon.create(payload, token);
      toast.success('Cupón creado exitosamente');
      setTimeout(() => router.push('/coupons'), 1500);
    } catch (error) {
      console.error('Error al crear el cupón:', error);
      toast.error('Ocurrió un error al crear el cupón');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mx-auto mb-4 max-w-[904px]">
        <Breadcrumb
          items={[
            { label: 'Cupones', href: '/coupons' },
            { label: 'Nuevo Cupón', href: '' },
          ]}
        />
      </div>
      <div className="mx-auto max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
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
        <p className="text-[16px] font-medium text-gray-600">
          Agrega la información del cupón
        </p>
        <div className="space-y-6">
          <Input
            label="Código del cupón"
            placeholder="Agrega el código del cupón"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            helperText={errors.code}
            helperTextColor="#E10000"
            borderColor="#d1d5db"
          />
          <div className="flex flex-col gap-4 md:flex-row md:gap-6">
            <div className="w-full">
              <label className="block text-[16px] font-medium text-gray-600">
                Fecha de finalización
              </label>
              <Calendar onDateSelect={(date) => setExpirationDate(date)} />
              {errors.expirationDate && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.expirationDate}
                </p>
              )}
            </div>
            <Input
              label="Usos máximos"
              placeholder="Agrega los usos máximos"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              helperText={errors.maxUses}
              helperTextColor="#E10000"
              borderColor="#d1d5db"
              type="number"
            />
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:gap-6">
            <Input
              label="Porcentaje de descuento"
              placeholder="Agrega el porcentaje de descuento"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              helperText={errors.discount}
              helperTextColor="#E10000"
              borderColor="#d1d5db"
              type="number"
            />
            <Input
              label="Compra mínima"
              placeholder="Agrega la compra mínima"
              value={minPurchase}
              onChange={(e) => setMinPurchase(e.target.value)}
              helperText={errors.minPurchase}
              helperTextColor="#E10000"
              borderColor="#d1d5db"
              type="number"
            />
          </div>
        </div>
      </div>
    </>
  );
}
