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
import { categorySchema } from '@/lib/validations/categorySchema';

export default function NewCategoryPage() {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name === 'name') setName(value);
    if (name === 'description') setDescription(value);

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

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
      const token = getToken();
      if (!token) {
        toast.error('No se encontró token de autenticación');
        setIsSubmitting(false);
        return;
      }

      await api.category.create({ name, description }, token);

      toast.success('Categoría creada exitosamente');

      setTimeout(() => {
        router.push('/categories');
      }, 1500);
    } catch (error) {
      console.error('Error al crear la categoría:', error);
      toast.error('Ocurrió un error al crear la categoría');
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
                  { label: 'Nueva Categoría', href: '' },
                ]}
              />
            </div>

            <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                  Nueva Categoría
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
                  {isSubmitting ? 'Creando...' : 'Agregar Categoría'}
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
                    placeholder="Agrega el nombre de la Categoría"
                    value={name}
                    onChange={handleChange}
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
                    placeholder="Agrega una breve descripción"
                    value={description}
                    onChange={handleChange}
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
