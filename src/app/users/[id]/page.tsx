'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import ModalConfirm from '@/components/ModalConfirm';
import { Colors } from '@/styles/styles';
import { toast, ToastContainer } from 'react-toastify';
import { api } from '@/lib/sdkConfig';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { useAuth } from '@/context/AuthContext';

enum UserRole {
  ADMIN = 'admin',
  BRANCH_ADMIN = 'branch_admin',
  CUSTOMER = 'customer',
  DELIVERY = 'delivery',
}

const roleLabels = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.BRANCH_ADMIN]: 'Administrador de Sucursal',
  [UserRole.CUSTOMER]: 'Cliente',
  [UserRole.DELIVERY]: 'Repartidor',
};

type ApiUserResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  documentId: string;
  phoneNumber: string;
  role: string;
  isValidated: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lastOrderDate: Date | null;
  profile: {
    birthDate?: Date | string;
    gender?: string;
    profilePicture?: string;
  };
};

type UserList = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  documentId: string;
  phoneNumber: string;
  role: string;
  profile: {
    birthDate?: Date | string;
    gender?: 'm' | 'f';
    profilePicture?: string;
  };
};

export default function UserDetailsPage() {
  const params = useParams();
  const id = params?.id && typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<UserList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchUser = useCallback(async () => {
    if (!token || typeof id !== 'string') {
      setError('Token no encontrado o ID inválido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userData: ApiUserResponse = await api.user.getProfile(id, token);

      const processedUser: UserList = {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        documentId: userData.documentId,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        profile: {
          birthDate: userData.profile?.birthDate,
          gender:
            userData.profile?.gender === 'm' || userData.profile?.gender === 'f'
              ? userData.profile.gender
              : undefined,
          profilePicture: userData.profile?.profilePicture,
        },
      };

      setUser(processedUser);
      setError(null);
    } catch (err) {
      console.error('Error al cargar el usuario:', err);
      setError('No se pudo cargar la información del usuario');
      toast.error('No se pudo cargar la información del usuario');
    } finally {
      setLoading(false);
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
    ? new Date(user.profile.birthDate).toLocaleDateString('es-ES')
    : '';

  const displayGender =
    user?.profile?.gender === 'm'
      ? 'Masculino'
      : user?.profile?.gender === 'f'
        ? 'Femenino'
        : 'No especificado';

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

            {loading ? (
              <p className="font-poppins text-[16px]">
                Cargando datos del usuario...
              </p>
            ) : error ? (
              <p className="font-poppins text-[16px] text-red-500">{error}</p>
            ) : user ? (
              <div className="mx-auto max-w-[904px] rounded-[16px] bg-white p-12 shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_10px_15px_rgba(0,0,0,0.1)]">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h1 className="font-poppins text-[28px] font-normal leading-[42px] text-[#393938]">
                      Usuario: #{user.id.slice(0, 3)}
                    </h1>
                  </div>
                  <div className="flex gap-6">
                    <button
                      onClick={() => setShowModal(true)}
                      className="font-poppins flex h-[44px] w-[196px] items-center justify-center rounded-[6px] border border-[#E10000] bg-white text-[16px] font-medium leading-[24px] text-[#E10000] transition-colors hover:bg-red-50"
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
                      <label className="font-poppins mb-1 block text-sm font-medium text-[#393938]">
                        Nombre
                      </label>
                      <input
                        className="font-poppins h-10 w-full rounded-[6px] border border-[#E7E7E6] bg-[#E7E7E6] px-5 py-2 text-[16px] text-[#6E6D6C] focus:outline-none focus:ring-0"
                        value={user.firstName}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="font-poppins mb-1 block text-sm font-medium text-[#393938]">
                        Cédula
                      </label>
                      <input
                        className="font-poppins h-10 w-full rounded-[6px] border border-[#E7E7E6] bg-[#E7E7E6] px-5 py-2 text-[16px] text-[#6E6D6C] focus:outline-none focus:ring-0"
                        value={user.documentId || ''}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="font-poppins mb-1 block text-sm font-medium text-[#393938]">
                        Fecha de nacimiento
                      </label>
                      <input
                        className="font-poppins h-10 w-full rounded-[6px] border border-[#E7E7E6] bg-[#E7E7E6] px-5 py-2 text-[16px] text-[#6E6D6C] focus:outline-none focus:ring-0"
                        value={formattedBirthDate}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="font-poppins mb-1 block text-sm font-medium text-[#393938]">
                        Teléfono
                      </label>
                      <input
                        className="font-poppins h-10 w-full rounded-[6px] border border-[#E7E7E6] bg-[#E7E7E6] px-5 py-2 text-[16px] text-[#6E6D6C] focus:outline-none focus:ring-0"
                        value={user.phoneNumber || ''}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Columna derecha */}
                  <div className="space-y-6">
                    <div>
                      <label className="font-poppins mb-1 block text-sm font-medium text-[#393938]">
                        Apellido
                      </label>
                      <input
                        className="font-poppins h-10 w-full rounded-[6px] border border-[#E7E7E6] bg-[#E7E7E6] px-5 py-2 text-[16px] text-[#6E6D6C] focus:outline-none focus:ring-0"
                        value={user.lastName}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="font-poppins mb-1 block text-sm font-medium text-[#393938]">
                        Género
                      </label>
                      <input
                        className="font-poppins h-10 w-full rounded-[6px] border border-[#E7E7E6] bg-[#E7E7E6] px-5 py-2 text-[16px] text-[#6E6D6C] focus:outline-none focus:ring-0"
                        value={displayGender}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="font-poppins mb-1 block text-sm font-medium text-[#393938]">
                        Rol
                      </label>
                      <input
                        className="font-poppins h-10 w-full rounded-[6px] border border-[#E7E7E6] bg-[#E7E7E6] px-5 py-2 text-[16px] text-[#6E6D6C] focus:outline-none focus:ring-0"
                        value={roleLabels[user.role as UserRole] || user.role}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="font-poppins mb-1 block text-sm font-medium text-[#393938]">
                        Correo electrónico
                      </label>
                      <input
                        className="font-poppins h-10 w-full rounded-[6px] border border-[#E7E7E6] bg-[#E7E7E6] px-5 py-2 text-[16px] text-[#6E6D6C] focus:outline-none focus:ring-0"
                        value={user.email || ''}
                        readOnly
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
              <p className="font-poppins text-[16px]">
                No se encontró información del usuario.
              </p>
            )}
          </main>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
