'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import TableContainer from '@/components/TableContainer';
import Dropdown from '@/components/Dropdown';
import { Column } from '@/components/Table';
import { api } from '@/lib/sdkConfig';
import { useAuth } from '@/context/AuthContext';

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  documentId: string;
  phoneNumber: string;
  lastOrderDate: Date;
  role: string;
  isValidated: boolean;
}

interface UserResponse {
  results: UserItem[];
  count: number;
  next: string | null;
  previous: string | null;
}

const roleTranslations: Record<string, string> = {
  admin: 'Administrador',
  branch_admin: 'Administrador de Sucursal',
  customer: 'Cliente',
  delivery: 'Repartidor',
};

const roleReverse: Record<string, string> = {
  Administrador: 'admin',
  'Administrador de Sucursal': 'branch_admin',
  Cliente: 'customer',
  Repartidor: 'delivery',
};

export default function UsersPage() {
  const router = useRouter();
  const { token, user, loading } = useAuth();

  const [users, setUsers] = useState<UserItem[]>([]);
  const roles = [
    'Todos',
    'Administrador',
    'Administrador de Sucursal',
    'Cliente',
    'Repartidor',
  ];
  const [selectedRole, setSelectedRole] = useState<string>('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingData, setLoadingData] = useState(true); // solo para datos

  const fetchUsers = useCallback(
    async (page: number, limit: number) => {
      try {
        if (!token) return;
        const response: UserResponse = await api.user.findAll(
          { page, limit },
          token,
        );
        setUsers(response.results);
        setTotalItems(response.count);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      } finally {
        setLoadingData(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token || !user?.sub) return;
    fetchUsers(currentPage, itemsPerPage);
  }, [fetchUsers, currentPage, itemsPerPage, token, user]);

  const filteredUsers =
    selectedRole === 'Todos'
      ? users
      : users.filter((user) => user.role === selectedRole);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: Column<UserItem>[] = [
    {
      key: 'firstName',
      label: 'Nombre',
      render: (item) => item.firstName,
    },
    {
      key: 'lastName',
      label: 'Apellido',
      render: (item) => item.lastName,
    },
    {
      key: 'email',
      label: 'Correo',
      render: (item) => item.email,
    },
    {
      key: 'role',
      label: 'Rol',
      render: (item) => roleTranslations[item.role] || item.role,
    },
    {
      key: 'isValidated',
      label: 'Correo\u00A0Validado',
      render: (item) => (
        <div
          className={`ml-2.5 flex h-[24px] w-[85px] min-w-[100px] flex-none flex-grow-0 flex-row items-center justify-center gap-px rounded-[6px] px-[10px] py-[3px] ${
            item.isValidated ? 'bg-[#A3E4D7]' : 'bg-[#F5B7B1]'
          } text-xs font-medium`}
        >
          {item.isValidated ? 'Validado' : 'No Validado'}
        </div>
      ),
    },
  ];

  const handleAddUser = () => {
    router.push('/users/new');
  };

  const handleView = (item: UserItem) => {
    router.push(`/users/${item.id}`);
  };

  const handleEdit = (item: UserItem) => {
    router.push(`/users/${item.id}/edit`);
  };

  const handleRoleChange = (val: string) => {
    setSelectedRole(val === 'Todos' ? 'Todos' : roleReverse[val]);
  };

  const handleSearch = (query: string) => {
    console.log('Buscando usuario:', query);
  };

  // ⏳ Esperamos sesión o datos
  if (loading || !token || !user?.sub || loadingData) {
    return <h1 className="p-4 text-lg">Cargando usuarios...</h1>;
  }

  return (
    <div className="mx-auto my-12">
      <div className="[&>ul]:max-h-60 [&>ul]:overflow-y-auto">
        <TableContainer
          title="Usuarios"
          dropdownComponent={
            <Dropdown title="Rol" items={roles} onChange={handleRoleChange} />
          }
          addButtonText="Agregar Usuario"
          onAddClick={handleAddUser}
          onSearch={handleSearch}
          tableData={filteredUsers}
          tableColumns={columns}
          onView={handleView}
          onEdit={handleEdit}
          pagination={{
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage,
            onPageChange: (page) => setCurrentPage(page),
            onItemsPerPageChange: (val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            },
            itemsPerPageOptions: [3, 5, 10, 15, 20],
          }}
        />
      </div>
    </div>
  );
}
