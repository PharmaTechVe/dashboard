'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import ModalConfirm from '@/components/ModalConfirm';
import { Colors } from '@/styles/styles';
import { toast } from 'react-toastify';
import { api } from '@/lib/sdkConfig';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { useAuth } from '@/context/AuthContext';
import Loading from '../../loading';
import { UserList, UserRole } from '@pharmatech/sdk';
import Input from '@/components/Input/Input';
import { formatDateSafe } from '@/lib/utils/useFormatDate';

const roleLabels = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.BRANCH_ADMIN]: 'Administrador de Sucursal',
  [UserRole.CUSTOMER]: 'Cliente',
  [UserRole.DELIVERY]: 'Repartidor',
};

export default function UserDetailsPage() {
  const params = useParams();
  const id = params?.id && typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<UserList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchUser = useCallback(async () => {
    if (!token || typeof id !== 'string') {
      setError('Token no encontrado o ID inválido');
      return;
    }

    try {
      const userData = await api.user.getProfile(id, token);
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Error al cargar el usuario:', err);
      setError('No se pudo cargar la información del usuario');
      toast.error('No se pudo cargar la información del usuario');
    }
  }, [id, token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleEdit = () => {
    if (typeof id === 'string') {
      router.push(`/users/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!token || typeof id !== 'string') {
      toast.error('Error: Token no encontrado o ID inválido.');
      return;
    }
    try {
      await api.user.delete(id, token);
      toast.success('Usuario eliminado exitosamente');
      setShowModal(false);
      setTimeout(() => {
        router.push('/users');
      }, REDIRECTION_TIMEOUT);
    } catch (error) {
      console.error('Ocurrio un error al eliminar el usuario:', error);
      toast.error('Ocurrio un error al eliminar el usuario');
    }
  };

  const handleCancel = () => setShowModal(false);

  const formattedBirthDate = user?.profile?.birthDate
    ? formatDateSafe(user.profile.birthDate)
    : '';
  const displayGender =
    user?.profile?.gender === 'm'
      ? 'Masculino'
      : user?.profile?.gender === 'f'
        ? 'Femenino'
        : 'No especificado';

  return (
    <>
      <div className="mx-auto mb-4 max-w-[904px]">
        <Breadcrumb
          items={[
            { label: 'Usuarios', href: '/users' },
            { label: `Usuario #${id?.toString().slice(0, 3)}`, href: '' },
          ]}
        />
      </div>

      <ModalConfirm
        isOpen={showModal}
        onClose={handleCancel}
        onConfirm={handleDelete}
        title="Eliminar Usuario"
        description="¿Estás seguro de que deseas eliminar este usuario? Esta acción hará que el usuario deje de estar activo en el sistema."
        cancelText="Cancelar"
        confirmText="Eliminar"
        width="512px"
        height="200px"
      />

      {error ? (
        <p className="font-poppins text-[16px] text-red-500">{error}</p>
      ) : user ? (
        <div className="mx-auto max-w-[904px] rounded-[16px] bg-white p-12 shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_10px_15px_rgba(0,0,0,0.1)]">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1
                className="font-poppins text-[28px] font-normal leading-[42px]"
                style={{ color: Colors.textMain }}
              >
                Usuario: #{user.id.slice(0, 3)}
              </h1>
            </div>
            <div className="flex gap-6">
              <button
                onClick={() => setShowModal(true)}
                className="font-poppins flex h-[44px] w-[196px] items-center justify-center rounded-[6px] border border-[#E10000] bg-white text-[16px] font-medium leading-[24px] transition-colors hover:bg-red-50"
                style={{ color: Colors.semanticDanger }}
              >
                Eliminar Usuario
              </button>
              <Button
                color={Colors.primary}
                paddingX={4}
                paddingY={2.5}
                textSize="16"
                width="196px"
                height="44px"
                onClick={handleEdit}
                textColor={Colors.textWhite}
                className="font-poppins rounded-[6px] border-none bg-[#1C2143] text-[16px] font-medium leading-[24px] text-white transition-colors hover:bg-[#2D365F] focus:outline-none focus:ring-2 focus:ring-[#1C2143]/50 active:bg-[#151A35]"
              >
                Editar Usuario
              </Button>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-2 items-start gap-x-16 gap-y-6">
            {/* Columna izquierda */}
            <div className="space-y-6">
              <div>
                <Input label="Nombre" value={user.firstName} readViewOnly />
              </div>

              <div>
                <Input
                  label="Cédula"
                  value={user.documentId || ''}
                  readViewOnly
                />
              </div>

              <div>
                <Input
                  label="Fecha de nacimiento"
                  value={formattedBirthDate}
                  readViewOnly
                />
              </div>

              <div>
                <Input
                  label="Teléfono"
                  value={user.phoneNumber || ''}
                  readViewOnly
                />
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              <div>
                <Input label="Apellido" value={user.lastName} readViewOnly />
              </div>

              <div>
                <Input label="Género" value={displayGender} readViewOnly />
              </div>

              <div>
                <Input
                  label="Rol"
                  value={roleLabels[user.role as UserRole] || user.role}
                  readViewOnly
                />
              </div>

              <div>
                <Input
                  label="Correo electrónico"
                  value={user.email || ''}
                  readViewOnly
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="font-poppins flex items-center justify-center gap-1 rounded-[6px] bg-white px-4 py-2 text-[16px] font-normal leading-[24px] text-[#393938] transition-colors hover:bg-gray-100 focus:outline-none focus:ring-0">
              <span>Ver Registro de Actividad</span>
              <ChevronRightIcon className="h-6 w-6 text-[#393938]" />
            </button>
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
}
