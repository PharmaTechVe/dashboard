'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import ModalConfirm from '@/components/ModalConfirm';
import { Colors } from '@/styles/styles';
import { CategoryResponse } from '@pharmatech/sdk';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/Input/Input';

export default function CategoryDetailsPage() {
  const params = useParams();
  const id = params?.id && typeof params.id === 'string' ? params.id : '';
  const { token } = useAuth();
  const router = useRouter();
  const [category, setCategory] = useState<CategoryResponse | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!token || typeof id !== 'string') {
        toast.error('Error');
        return;
      }

      try {
        const response = await api.category.getById(id);
        setCategory({
          id: response.id,
          name: response.name,
          description: response.description,
        });
      } catch (error) {
        console.error('Error al obtener la categoría:', error);
        toast.error('Error al cargar la categoría');
      }
    };

    fetchCategory();
  }, [id, token]);

  const handleEdit = () => {
    if (typeof id === 'string') {
      router.push(`/categories/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!category) return;

    if (!token || typeof id !== 'string') {
      toast.error('Error');
      return;
    }

    try {
      await api.category.delete(id, token);
      toast.success(`Categoría eliminada exitosamente`);

      setTimeout(() => {
        router.push('/categories');
      }, REDIRECTION_TIMEOUT);
    } catch (error) {
      console.error('Error al eliminar la categoría:', error);
      toast.error('Error al eliminar la categoría');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleCancelDelete = () => setShowDeleteModal(false);

  return (
    <>
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
        <div className="mb-6 flex items-center justify-between">
          <h1
            className="text-[28px] font-normal leading-none"
            style={{ color: Colors.textMain }}
          >
            Categoría #{category?.id?.slice(0, 3) || 'N/A'}
          </h1>
          <div className="flex gap-6">
            <Button
              color={Colors.secondaryWhite}
              paddingX={4}
              paddingY={4}
              textSize="16"
              width="173px"
              height="48px"
              onClick={() => setShowDeleteModal(true)}
              className="border-red-600 hover:border-red-600 hover:bg-red-50"
              textColor={Colors.semanticDanger}
            >
              Eliminar Categoría
            </Button>
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
      </div>

      <ModalConfirm
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleDelete}
        title="Eliminar Categoría"
        description="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
        cancelText="Cancelar"
        confirmText="Eliminar"
        width="512px"
        height="200px"
      />

      <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
        <div>
          <Input label="Nombre" value={category?.name || ''} readViewOnly />
        </div>

        <div>
          <label className="block text-[16px] font-medium text-gray-600">
            Descripción
          </label>
          <textarea
            className="mt-1 h-[120px] w-[808px] cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:outline-none"
            value={category?.description || ''}
            readOnly
          />
        </div>
      </div>
    </>
  );
}
