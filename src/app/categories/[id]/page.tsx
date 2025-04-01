'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import ModalConfirm from '@/components/ModalConfirm';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast, ToastContainer } from 'react-toastify';

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  status: boolean;
}

export default function CategoryDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<CategoryItem | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
        const response = await api.category.getById(id);

        setCategory({
          id: response.id,
          name: response.name,
          description: response.description,
          status: true,
        });
      } catch (error) {
        console.error('Error al obtener la categoría:', error);
        toast.error('Error al cargar la categoría');
      }
    };

    fetchCategory();
  }, [id]);

  const handleEdit = () => {
    if (typeof id === 'string') router.push(`/categories/${id}/edit`);
  };

  const handleToggleStatus = async () => {
    if (!category) return;

    const token = getToken();
    if (!token || typeof id !== 'string') {
      toast.error('Error de autenticación');
      return;
    }

    setIsProcessing(true);
    try {
      await api.category.update(
        id,
        {
          name: category.name,
          description: category.description,
        },
        token,
      );

      toast.success(
        `Categoría ${!category.status ? 'activada' : 'desactivada'} exitosamente`,
      );

      setCategory({ ...category, status: !category.status });
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error al cambiar estado de la categoría:', error);
      toast.error('Error al cambiar estado de la categoría');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelStatusChange = () => setShowStatusModal(false);

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
                    label: `Categoría #${id?.toString().slice(0, 3)}`,
                    href: '',
                  },
                ]}
              />
            </div>

            <ModalConfirm
              isOpen={showStatusModal}
              onClose={handleCancelStatusChange}
              onConfirm={handleToggleStatus}
              title="Desactivar Categoría"
              description="¿Deseas desactivar esta categoría? Esta acción hará que la categoría deje de estar disponible para su selección en el sistema"
              cancelText="Cancelar"
              confirmText="Desactivar"
              width="512px"
              height="200px"
            />

            {category ? (
              <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
                <div className="mb-6 flex items-center justify-between">
                  <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                    Categoría #{category.id.slice(0, 3)}
                  </h1>
                  <div className="flex gap-6">
                    {category.status && (
                      <Button
                        color={Colors.secondaryWhite}
                        paddingX={4}
                        paddingY={4}
                        textSize="16"
                        width="173px"
                        height="48px"
                        onClick={() => setShowStatusModal(true)}
                        className="border-red-600 hover:border-red-600 hover:bg-red-50"
                        textColor={Colors.semanticDanger}
                        disabled={isProcessing}
                      >
                        Desactivar
                      </Button>
                    )}
                    <Button
                      color={Colors.primary}
                      paddingX={4}
                      paddingY={4}
                      textSize="16"
                      width="177px"
                      height="48px"
                      onClick={handleEdit}
                      textColor={Colors.textWhite}
                    >
                      Editar Categoría
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Nombre de la Categoría
                  </label>
                  <input
                    className="mt-1 w-[808px] cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                    value={category.name}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Descripción
                  </label>
                  <textarea
                    className="mt-1 h-[120px] w-[808px] cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                    value={category.description}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Estado
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`rounded-md px-3 py-1 text-xs font-semibold ${
                        category.status
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.status ? 'Activo' : 'Inactivo'}
                    </span>
                    {!category.status && (
                      <Button
                        color={Colors.primary}
                        paddingX={4}
                        paddingY={2}
                        textSize="14"
                        onClick={() => handleToggleStatus()}
                        textColor={Colors.textWhite}
                        disabled={isProcessing}
                      >
                        Reactivar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[16px]">Cargando datos de la categoría...</p>
            )}
          </main>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
