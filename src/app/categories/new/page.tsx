// app/categories/new/page.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  categorySchema,
  CategoryFormValues,
} from '@/lib/validations/categorySchema';
import { Client, CategoryService } from '@pharmatech/sdk';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import AdminNavBar from '@/components/Navbar';

const NewCategoryPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const isDevMode = process.env.NODE_ENV === 'development';
      const client = new Client(isDevMode);
      const categoryService = new CategoryService(client);

      await categoryService.create(data, '');

      router.push('/categories');
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Ocurrió un error al crear la categoría');
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <AdminNavBar />
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Nueva Categoría
            </h1>
            <p className="text-gray-600">
              Agrega la información de la Categoría
            </p>
          </div>

          <div className="rounded-md bg-white p-6 shadow-md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre de la Categoría
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  placeholder="Agrega el nombre de la Categoría"
                  className={`block w-full rounded-md border px-4 py-3 focus:outline-none ${
                    errors.name
                      ? 'border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {}
              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Descripción
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description')}
                  placeholder="Agrega una breve descripción"
                  className={`block w-full rounded-md border px-4 py-3 focus:outline-none ${
                    errors.description
                      ? 'border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/categories')}
                  className="rounded-md bg-gray-200 px-6 py-2 text-gray-700 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCategoryPage;
