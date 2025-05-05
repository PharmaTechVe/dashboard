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
import { promoSchema } from '@/lib/validations/promoSchema';
import { useAuth } from '@/context/AuthContext';

export default function NewPromotionPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [name, setName] = useState('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [startAt, setStartAt] = useState<Date | null>(new Date());
  const [expiredAt, setExpiredAt] = useState<Date | null>(new Date());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      if (!token) {
        toast.error('No se encontró token de autenticación');
        setIsSubmitting(false);
        return;
      }

      await api.promo.create(validationData, token);
      toast.success('Promoción creada exitosamente');
      setTimeout(() => router.push('/promos'), 1500);
    } catch (error) {
      console.error('Error al crear la promoción:', error);
      toast.error('Ocurrió un error al crear la promoción');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mx-auto mb-4 max-w-[904px]">
        <Breadcrumb
          items={[
            { label: 'Promociones', href: '/promos' },
            { label: 'Nueva Promoción', href: '' },
          ]}
        />
      </div>
      <div className="mx-auto max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h1
            className="text-[28px] font-normal leading-none"
            style={{ color: Colors.textMain }}
          >
            Nueva Promoción
          </h1>
          <div className="flex space-x-4">
            <Button
              color={Colors.textWhite}
              paddingX={4}
              paddingY={4}
              textSize="16"
              width="120px"
              height="44px"
              onClick={() => router.push('/promos')}
              textColor={Colors.textMain}
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
        <p
          className="text-[16px] font-normal leading-6"
          style={{ color: Colors.textMain }}
        >
          Agrega la información de la Promoción
        </p>
        <div>
          <Input
            label="Nombre de la Promoción"
            placeholder="Agrega el nombre de la Promoción"
            value={name}
            onChange={(e) => setName(e.target.value)}
            helperText={errors.name}
            helperTextColor={Colors.semanticDanger}
            borderColor="#d1d5db"
          />
        </div>
        <div>
          <Input
            label="Porcentaje de Descuento"
            placeholder="Agrega el porcentaje de descuento"
            value={discount === '' ? '' : discount.toString()}
            onChange={(e) =>
              setDiscount(e.target.value === '' ? '' : Number(e.target.value))
            }
            helperText={errors.discount}
            helperTextColor={Colors.semanticDanger}
            borderColor="#d1d5db"
            type="number"
          />
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          <div className="w-full md:w-1/2">
            <label className="block text-[16px] font-medium text-gray-600">
              Fecha de Inicio
            </label>
            <Calendar onDateSelect={(date) => setStartAt(new Date(date))} />
            {errors.startAt && (
              <p className="mt-1 text-sm text-red-500">{errors.startAt}</p>
            )}
          </div>
          <div className="w-full md:w-1/2">
            <label className="block text-[16px] font-medium text-gray-600">
              Fecha de Finalización
            </label>
            <Calendar onDateSelect={(date) => setExpiredAt(new Date(date))} />
            {errors.expiredAt && (
              <p className="mt-1 text-sm text-red-500">{errors.expiredAt}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
