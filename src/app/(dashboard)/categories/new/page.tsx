'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Input from '@/components/Input/Input';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { categorySchema } from '@/lib/validations/categorySchema';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { useAuth } from '@/context/AuthContext';

export default function NewCategoryPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);

    const validationResult = categorySchema.safeParse({ name, description });

    if (!validationResult.success) {
      const { fieldErrors } = validationResult.error.flatten();
      setErrors({
        name: fieldErrors.name?.[0] ?? '',
        description: fieldErrors.description?.[0] ?? '',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (!token) {
        toast.error('Error');
        return;
      }

      await api.category.create({ name, description }, token);

      toast.success('Categoría creada exitosamente');

      setTimeout(() => {
        router.push('/categories');
      }, REDIRECTION_TIMEOUT);
    } catch (error) {
      console.error('Error al crear la categoría:', error);
      toast.error('Ocurrió un error al crear la categoría');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mx-auto mb-4 max-w-[904px]">
        <Breadcrumb
          items={[
            { label: 'Categorías', href: '/categories' },
            { label: 'Nueva Categoría', href: '' },
          ]}
        />
      </div>

      <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-normal leading-none text-[#393938]">
            Nueva Categoría
          </h1>
          <div className="flex gap-6">
            <Button
              color={Colors.secondaryWhite}
              paddingX={4}
              paddingY={4}
              textSize="16"
              width="120px"
              height="48px"
              onClick={() => router.push('/categories')}
              textColor={Colors.primary}
              className="border-gray-300 hover:bg-gray-100"
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
              onClick={() => handleSubmit()}
              textColor={Colors.textWhite}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Agregar Categoría'}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nombre de la Categoría"
            placeholder="Agrega el nombre de la Categoría"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors({ ...errors, name: '' });
            }}
            helperText={errors.name}
            helperTextColor="text-red-500"
            borderColor="#d1d5db"
          />

          <Input
            label="Descripción"
            placeholder="Agrega una breve descripción"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors({ ...errors, description: '' });
            }}
            helperText={errors.description}
            helperTextColor="text-red-500"
            borderColor="#d1d5db"
            type="text"
          />
        </form>
      </div>
    </>
  );
}
