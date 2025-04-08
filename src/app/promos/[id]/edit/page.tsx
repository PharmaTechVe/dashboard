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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function EditPromoPage() {
  const { id } = useParams();
  const router = useRouter();
  const [name, setName] = useState('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [expiredAt, setExpiredAt] = useState<Date | null>(new Date());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      if (!token || typeof id !== 'string') return;

      try {
        const promo = await api.promo.getById(id, token);
        setName(promo.name);
        setDiscount(promo.discount);
        setExpiredAt(new Date(promo.expiredAt));
      } catch (error) {
        console.error('Error al cargar la promoción:', error);
        toast.error('Error al cargar los datos de la promoción');
        router.push('/promotions');
      }
    };

    fetchPromo();
  }, [id, router]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    if (!expiredAt) {
      setErrors({ expiredAt: 'La fecha de finalización es requerida' });
      setIsSubmitting(false);
      return;
    }

    const validationData = {
      name,
      discount: Number(discount),
      expiredAt,
    };

    const validationResult = promoSchema.safeParse(validationData);

    if (!validationResult.success) {
      const { fieldErrors } = validationResult.error.flatten();
      setErrors({
        name: fieldErrors.name?.[0] ?? '',
        discount: fieldErrors.discount?.[0] ?? '',
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
          name,
          discount: Number(discount),
          expiredAt: expiredAt,
        },
        token,
      );

      toast.success('Promoción actualizada exitosamente');

      setTimeout(() => {
        router.push(`/promotions/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Error al actualizar la promoción:', error);
      toast.error('Ocurrió un error al actualizar la promoción');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: fieldName, value } = e.target;

    if (fieldName === 'name') {
      setName(value);
    } else if (fieldName === 'discount') {
      setDiscount(value === '' ? '' : Number(value));
    }

    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setExpiredAt(date);
    if (errors['expiredAt']) {
      setErrors((prev) => ({ ...prev, expiredAt: '' }));
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
                  { label: 'Promociones', href: '/promotions' },
                  {
                    label: `Promoción #${typeof id === 'string' ? id.slice(0, 3) : ''}`,
                    href: `/promotions/${id}`,
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
                <Button
                  color={Colors.primary}
                  paddingX={4}
                  paddingY={4}
                  textSize="16"
                  width="196px"
                  height="44px"
                  onClick={() => handleSubmit()}
                  textColor={Colors.textWhite}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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

                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Fecha de finalización
                  </label>
                  <DatePicker
                    selected={expiredAt}
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    className={`mt-1 w-full rounded-md border ${
                      errors.expiredAt ? 'border-red-500' : 'border-gray-300'
                    } p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0`}
                    placeholderText="DD/MM/AAAA"
                    minDate={new Date()}
                    showTimeSelect={false}
                  />
                  {errors.expiredAt && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.expiredAt}
                    </p>
                  )}
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
