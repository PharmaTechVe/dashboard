'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Client, CategoryService } from '@pharmatech/sdk';
import Sidebar from '@/components/SideBar';
import AdminNavBar from '@/components/Navbar';
import Link from 'next/link';

const CategoryDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const category = {
    id: id as string,
    name: 'Medicamentos',
    description: 'Fármacos para el tratamiento de enfermedades.',
    status: 'Activo',
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const isDevMode = process.env.NODE_ENV === 'development';
      const client = new Client(isDevMode);
      const categoryService = new CategoryService(client);

      await categoryService.deleteCategory(id as string);
      router.push('/categories');
    } catch (error) {
      console.error('Error deleting category:', error);
      setIsDeleting(false);
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
              Detalle de Categoría
            </h1>
            <p className="text-gray-600">
              Información completa de la categoría
            </p>
          </div>

          <div className="rounded-md bg-white p-6 shadow-md">
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">ID</h2>
                  <p className="mt-1 text-lg text-gray-900">{category.id}</p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500">Nombre</h2>
                  <p className="mt-1 text-lg text-gray-900">{category.name}</p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500">
                    Descripción
                  </h2>
                  <p className="mt-1 text-lg text-gray-900">
                    {category.description}
                  </p>
                </div>

                <div>
                  <h2 className="text-sm font-medium text-gray-500">Estado</h2>
                  <p className="mt-1">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        category.status === 'Activo'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {category.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-md bg-red-100 px-6 py-2 text-red-700 hover:bg-red-200"
                >
                  Eliminar Categoría
                </button>
                <Link
                  href={`/categories/${id}/edit`}
                  className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
                >
                  Editar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-md bg-white p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900">
              Confirmar Desactivación
            </h3>
            <p className="mt-2 text-gray-600">
              ¿Deseas desactivar esta categoría? Esta acción hará que la
              categoría deje de estar disponible para su selección en el
              sistema.
            </p>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-70"
              >
                {isDeleting ? 'Desactivando...' : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDetailPage;
