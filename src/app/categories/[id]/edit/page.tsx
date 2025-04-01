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
import { categorySchema } from '@/lib/validations/categorySchema';

export default function EditCategoryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken')
    );
  };

  useEffect(() => {
    const fetchCategory = async () => {
      const token = getToken();
      if (!token || typeof id !== 'string') return;

      try {
        const category = await api.category.getById(id);
        setName(category.name);
        setDescription(category.description);
      } catch (error) {
        console.error('Error al cargar la categoría:', error);
        toast.error('Error al cargar los datos de la categoría');
        router.push('/categories');
      }
    };

    fetchCategory();
  }, [id, router]);

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
      const token = getToken();
      if (!token || typeof id !== 'string') {
        toast.error('Token o ID inválido');
        setIsSubmitting(false);
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
        router.push(`/categories/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Error al actualizar la categoría:', error);
      toast.error('Ocurrió un error al actualizar la categoría');
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
                  { label: 'Categorías', href: '/categories' },
                  {
                    label: `Categoría #${typeof id === 'string' ? id.slice(0, 3) : ''}`,
                    href: `/categories/${id}`,
                  },
                  { label: 'Editar', href: '' },
                ]}
              />
            </div>

            <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                  Editar Categoría #
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
                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Nombre de la Categoría
                  </label>
                  <input
                    name="name"
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors({ ...errors, name: '' });
                    }}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    className="mt-1 h-[120px] w-full rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setErrors({ ...errors, description: '' });
                    }}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.description}
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
