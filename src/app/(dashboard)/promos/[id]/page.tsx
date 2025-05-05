'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import ModalConfirm from '@/components/ModalConfirm';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { PromoResponse } from '@pharmatech/sdk/types';
import { useAuth } from '@/context/AuthContext';
import Loading from '../../loading';
import Input from '@/components/Input/Input';

export default function PromoDetailsPage() {
  const params = useParams();
  const id = params?.id && typeof params.id === 'string' ? params.id : '';
  const { token } = useAuth();
  const router = useRouter();
  const [promo, setPromo] = useState<PromoResponse | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchPromo = async () => {
      if (!token || typeof id !== 'string') {
        return;
      }

      try {
        const response = await api.promo.getById(id, token);

        if (
          typeof response.startAt !== 'string' ||
          typeof response.expiredAt !== 'string'
        ) {
          throw new Error('El formato de fecha no es válido');
        }

        setPromo(response);
      } catch (error) {
        console.error('Error al obtener la promoción:', error);
        toast.error('Error al cargar la promoción');
      }
    };

    fetchPromo();
  }, [id, token]);

  const handleEdit = () => {
    if (promo && typeof id === 'string') {
      router.push(`/promos/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!promo || typeof id !== 'string') return;

    if (!token) {
      toast.error('Error de autenticación');
      return;
    }

    try {
      await api.promo.delete(id, token);
      toast.success('Promoción eliminada exitosamente');
      router.push('/promos');
    } catch (error) {
      console.error('Error al eliminar la promoción:', error);
      toast.error('Error al eliminar la promoción');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleCancelDelete = () => setShowDeleteModal(false);

  const formatDate = (date: Date) => {
    try {
      return format(date, 'dd/MM/yyyy');
    } catch {
      return date.toString();
    }
  };

  if (!promo) {
    return <Loading />;
  }

  return (
    <>
      <div className="mx-auto mb-4 max-w-[904px]">
        <Breadcrumb
          items={[
            { label: 'Promociones', href: '/promos' },
            {
              label: `Promoción #${promo.id.slice(0, 3)}`,
              href: '',
            },
          ]}
        />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-normal leading-none text-[#393938]">
            Promoción #{promo.id.slice(0, 3)}
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
              Eliminar Promoción
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
              Editar Promoción
            </Button>
          </div>
        </div>
      </div>

      <ModalConfirm
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleDelete}
        title="Eliminar Promoción"
        description="¿Deseas eliminar esta Promoción? Esta acción hará que la Promoción deje de estar disponible para su selección en el sistema."
        cancelText="Cancelar"
        confirmText="Eliminar"
        width="512px"
        height="200px"
      />

      <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
        <div className="space-y-6">
          <div>
            <Input
              label="Nombre de la Promoción"
              value={promo.name}
              readViewOnly
            />
          </div>

          <div>
            <Input
              label="Porcentaje de Descuento"
              value={`${promo.discount}%`}
              readViewOnly
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Input
                label="Fecha de Inicio"
                value={formatDate(new Date(promo.startAt))}
                readViewOnly
              />
            </div>

            <div>
              <Input
                label="Fecha de Finalización"
                value={formatDate(new Date(promo.expiredAt))}
                readViewOnly
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
