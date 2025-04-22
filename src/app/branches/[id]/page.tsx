//Ver una sucursal por id
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
//import Dropdown from '@/components/Dropdown';
import { toast, ToastContainer } from 'react-toastify';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { useAuth } from '@/context/AuthContext';

interface BranchItem {
  id: string;
  name: string;
  address: string;
  city: {
    id: string;
    name: string;
    state: {
      name: string;
    };
  };
  latitude: number;
  longitude: number;
}

export default function BranchDetailsPage() {
  const params = useParams();
  const { token } = useAuth();
  const id = params?.id && typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const [branch, setBranch] = useState<BranchItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchBranch = async () => {
      if (!token || typeof id !== 'string') return;

      try {
        const response = await api.branch.getById(id, token);
        setBranch(response);
      } catch (error) {
        console.error('Error al obtener la sucursal:', error);
      }
    };

    fetchBranch();
  }, [id]);

  const handleEdit = () => {
    if (typeof id === 'string') router.push(`/branches/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!token || typeof id !== 'string') {
      toast.error('Error');
      return;
    }

    try {
      await api.branch.delete(id, token);
      toast.success('Sucursal eliminada exitosamente');
      setShowModal(false);

      setTimeout(() => {
        router.push('/branches');
      }, REDIRECTION_TIMEOUT);
    } catch (error) {
      console.error('Error al eliminar la sucursal:', error);
      toast.error('Error al eliminar la sucursal');
    }
  };

  const handleCancel = () => setShowModal(false);

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
                  { label: 'Sucursales', href: '/branches' },
                  {
                    label: `Sucursal #${id?.toString().slice(0, 3)}`,
                    href: '',
                  },
                ]}
              />
            </div>

            <ModalConfirm
              isOpen={showModal}
              onClose={handleCancel}
              onConfirm={handleDelete}
              title="Eliminar Sucursal"
              description="¿Estás seguro de que deseas eliminar esta sucursal? Esta acción hará que la sucursal deje de estar activa en el sistema"
              cancelText="Cancelar"
              confirmText="Eliminar"
              width="512px"
              height="200px"
            />

            {branch ? (
              <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
                <div className="mb-6 flex items-center justify-between">
                  <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                    Sucursal #{branch.id.slice(0, 3)}
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
                      Eliminar Sucursal
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
                      Editar Sucursal
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Nombre
                  </label>
                  <input
                    className="mt-1 w-[808px] cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                    value={branch.name}
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-[16px] font-medium text-gray-600">
                      Estado
                    </label>
                    <input
                      className="mt-1 w-[375px] cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                      value={branch.city.state.name}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-[16px] font-medium text-gray-600">
                      Ciudad
                    </label>
                    <input
                      className="mt-1 w-[375px] cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                      value={branch.city.name}
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Dirección
                  </label>
                  <input
                    className="mt-1 w-[808px] cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                    value={branch.address}
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-[16px] font-medium text-gray-600">
                      Latitud
                    </label>
                    <input
                      className="mt-1 w-[249px] cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                      value={branch.latitude}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-[16px] font-medium text-gray-600">
                      Longitud
                    </label>
                    <input
                      className="mt-1 w-[249px] cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                      value={branch.longitude}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[16px]">Cargando datos de la sucursal...</p>
            )}
          </main>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
