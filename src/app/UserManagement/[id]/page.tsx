'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import ModalConfirm from '@/components/ModalConfirm';
import { Colors } from '@/styles/styles';
import { toast, ToastContainer } from 'react-toastify';
import { deleteUser } from '../lib/userService';
import useUser from '../lib/UseUser'; // Asegúrate de que la ruta y el casing sean correctos

export default function UserDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  // Uso del hook para obtener el usuario
  const { user, loading, error } = useUser(typeof id === 'string' ? id : '');

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken')
    );
  };

  const handleEdit = () => {
    if (typeof id === 'string') {
      router.push(`/UserManagement/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    const token = getToken();
    if (!token || typeof id !== 'string') {
      toast.error('Error: Token no encontrado o ID inválido.');
      return;
    }
    try {
      await deleteUser(id, token);
      toast.success('Usuario eliminado exitosamente');
      setShowModal(false);
      setTimeout(() => {
        router.push('/UserManagement');
      }, 2000);
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      toast.error('Error al eliminar el usuario');
    }
  };

  const handleCancel = () => setShowModal(false);

  // Formatear la fecha y asignar el género (ya vienen transformados en el usuario)
  const formattedBirthDate =
    user && user.birthDate
      ? new Date(user.birthDate).toLocaleDateString('es-ES')
      : '';
  const displayGender =
    user && user.gender === 'm'
      ? 'Masculino'
      : user && user.gender === 'f'
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
                  { label: 'Usuarios', href: '/UserManagement' },
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
              <p className="text-[16px]">Cargando datos del usuario...</p>
            ) : error ? (
              <p className="text-[16px] text-red-500">{error}</p>
            ) : user ? (
              <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
                <div className="mb-6 flex items-center justify-between">
                  <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                    Usuario #{user.id.slice(0, 3)}
                  </h1>
                  <div className="flex gap-6">
                    <Button
                      color={Colors.secondaryWhite}
                      paddingX={4}
                      paddingY={4}
                      textSize="16"
                      width="173px"
                      height="48px"
                      onClick={() => setShowModal(true)}
                      className="border-red-600 hover:border-red-600 hover:bg-red-50"
                      textColor={Colors.semanticDanger}
                    >
                      Eliminar Usuario
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
                      Editar Usuario
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-[16px] font-medium text-gray-600">
                      Nombre
                    </label>
                    <input
                      className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
                      value={user.firstName}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-[16px] font-medium text-gray-600">
                      Apellido
                    </label>
                    <input
                      className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
                      value={user.lastName}
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-[16px] font-medium text-gray-600">
                      Cédula
                    </label>
                    <input
                      className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
                      value={user.documentId || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-[16px] font-medium text-gray-600">
                      Género
                    </label>
                    <input
                      className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
                      value={displayGender}
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-[16px] font-medium text-gray-600">
                      Fecha de Nacimiento
                    </label>
                    <input
                      className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
                      value={formattedBirthDate}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-[16px] font-medium text-gray-600">
                      Rol
                    </label>
                    <input
                      className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
                      value={user.role || ''}
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-[16px] font-medium text-gray-600">
                      Teléfono
                    </label>
                    <input
                      className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
                      value={user.phoneNumber || ''}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-[16px] font-medium text-gray-600">
                      Correo electrónico
                    </label>
                    <input
                      className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
                      value={user.email || ''}
                      readOnly
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    color={Colors.secondaryWhite}
                    paddingX={4}
                    paddingY={4}
                    textSize="16"
                    width="240px"
                    height="48px"
                    onClick={() => console.log('Ver registro de actividad')}
                    className="border-gray-300 hover:bg-gray-100"
                    textColor={Colors.primary}
                  >
                    Ver Registro de Actividad
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-[16px]">
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
