'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Input from '@/components/Input/Input';
import Calendar from '@/components/Calendar';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { promoSchema } from '@/lib/validations/promoSchema';
import { useAuth } from '@/context/AuthContext';

export default function EditPromoPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? '');
  const router = useRouter();
  const { token } = useAuth();

  const [tempName, setTempName] = useState('');
  const [tempDiscount, setTempDiscount] = useState<number | ''>('');
  const [tempStartAt, setTempStartAt] = useState<Date | null>(null);
  const [tempExpiredAt, setTempExpiredAt] = useState<Date | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  useEffect(() => {
    const fetchPromo = async () => {
      if (!token || typeof id !== 'string') return;

      try {
        const promo = await api.promo.getById(id, token);
        setTempName(promo.name);
        setTempDiscount(promo.discount);
        setTempStartAt(new Date(promo.startAt));
        setTempExpiredAt(new Date(promo.expiredAt));
      } catch (error) {
        console.error('Error al cargar la promoción:', error);
        toast.error('Error al cargar los datos de la promoción');
        router.push('/promos');
      }
    };

    fetchPromo();
  }, [id, token, router]);

  useEffect(() => {
    const hasChanges =
      tempName.trim() !== tempName ||
      tempDiscount !== tempDiscount ||
      tempStartAt?.toISOString() !== tempStartAt?.toISOString() ||
      tempExpiredAt?.toISOString() !== tempExpiredAt?.toISOString();

    setHasPendingChanges(hasChanges);
  }, [tempName, tempDiscount, tempStartAt, tempExpiredAt]);

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
    } catch (error) {
      console.error('Error al actualizar la promoción:', error);
      toast.error('Error al actualizar la promoción');
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-normal leading-none text-[#393938]">
            Editar Promoción #{typeof id === 'string' ? id.slice(0, 3) : ''}
          </h1>
          <div className="flex gap-4">
            <Button
              color={Colors.secondaryWhite}
              paddingX={4}
              paddingY={4}
              textSize="16"
              width="120px"
              height="44px"
              onClick={() => router.push(`/promos/`)}
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
          <Input
            label="Nombre de la Promoción"
            placeholder="Ingresa el nombre de la promoción"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            helperText={errors.name}
            helperTextColor={Colors.semanticDanger}
            borderColor="#d1d5db"
          />

          <Input
            label="Porcentaje de Descuento"
            placeholder="Ingresa el porcentaje de descuento"
            value={tempDiscount === '' ? '' : tempDiscount.toString()}
            onChange={(e) =>
              setTempDiscount(
                e.target.value === '' ? '' : Number(e.target.value),
              )
            }
            helperText={errors.discount}
            helperTextColor={Colors.semanticDanger}
            borderColor="#d1d5db"
            type="number"
          />

          <div className="flex flex-col gap-4 md:flex-row md:gap-6">
            <div className="w-full md:w-1/2">
              <label className="block text-[16px] font-medium text-gray-600">
                Fecha de Inicio
              </label>
              <Calendar
                onDateSelect={(date) => setTempStartAt(new Date(date))}
              />
              {errors.startAt && (
                <p className="mt-1 text-sm text-red-500">{errors.startAt}</p>
              )}
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-[16px] font-medium text-gray-600">
                Fecha de Finalización
              </label>
              <Calendar
                onDateSelect={(date) => setTempExpiredAt(new Date(date))}
              />
              {errors.expiredAt && (
                <p className="mt-1 text-sm text-red-500">{errors.expiredAt}</p>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
