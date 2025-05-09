'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Input from '@/components/Input/Input';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { categorySchema } from '@/lib/validations/categorySchema';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { useAuth } from '@/context/AuthContext';

export default function EditCategoryPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? '');
  const { token } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!token || typeof id !== 'string') {
        toast.error('Error');
        return;
      }

      try {
        const category = await api.category.getById(id);
        setName(category.name);
        setDescription(category.description);
      } catch (error) {
        console.error('Error al actualizar la categoría:', error);
        toast.error('Error al actualiza los datos de la categoría');
      }
    };

    fetchCategory();
  }, [id, router, token]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);

    const validationResult = categorySchema.safeParse({
      name,
      description,
    });

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
      if (!token || typeof id !== 'string') {
        toast.error('Error');
        return;
      }

      await api.category.update(
        id,
        {
          name,
          description,
        },
        token,
      );

      toast.success('Categoría actualizada exitosamente');

      setTimeout(() => {
        router.push(`/categories/`);
      }, REDIRECTION_TIMEOUT);
    } catch (error) {
      console.error('Error al actualizar la categoría:', error);
      toast.error('Ocurrió un error al actualizar la categoría');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mx-auto mb-4 max-w-[904px]">
        <Breadcrumb
          items={[
            { label: 'Categorías', href: '/categories' },
            {
              label: `Categoría #${typeof id === 'string' ? id.slice(0, 3) : ''}`,
              href: `/categories/${id}`,
            },
            { label: 'Editar', href: '' },
          ]}
        />
        <div className="mb-6 flex items-center justify-between">
          <h1
            className="text-[28px] font-normal leading-none"
            style={{ color: Colors.textMain }}
          >
            Editar Categoría #{typeof id === 'string' ? id.slice(0, 3) : ''}
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
              Volver
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
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nombre de la Categoría"
            placeholder="Ingresa el nombre de la categoría"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors({ ...errors, name: '' });
            }}
            helperText={errors.name}
            helperTextColor={Colors.semanticDanger}
            borderSize="1px"
            borderColor="#d1d5db"
          />

          <Input
            label="Descripción"
            placeholder="Ingresa la descripción de la categoría"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors({ ...errors, description: '' });
            }}
            helperText={errors.description}
            helperTextColor={Colors.semanticDanger}
            borderSize="1px"
            borderColor="#d1d5db"
            type="text"
            isTextArea
            rows={4}
          />
        </form>
      </div>
    </>
  );
}
