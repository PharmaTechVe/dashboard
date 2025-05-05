'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TableContainer from '@/components/TableContainer';
import Dropdown from '@/components/Dropdown';
import { api } from '@/lib/sdkConfig';
import { Pagination, UserList, UserRole } from '@pharmatech/sdk';
import { useAuth } from '@/context/AuthContext';

const roleTranslations: Record<string, string> = {
  '': 'Todos',
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.BRANCH_ADMIN]: 'Administrador de Sucursal',
  [UserRole.CUSTOMER]: 'Cliente',
  [UserRole.DELIVERY]: 'Repartidor',
};

const roleOptions = Object.entries(roleTranslations).map(([value, label]) => ({
  label,
  value,
}));

export default function UsersPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [users, setUsers] = useState<UserList[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (q: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchQuery(q.trim());
      setCurrentPage(1);
    }, 500);
  };

  const fetchUsers = useCallback(
    async (page: number, limit: number, q: string, role: string) => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      try {
        const params: Parameters<typeof api.user.findAll>[0] = {
          page,
          limit,
          ...(q ? { q } : {}),
          ...(role ? { role: role as UserRole } : {}),
        };
        const response: Pagination<UserList> = await api.user.findAll(
          params,
          token,
        );
        setUsers(response.results);
        setTotalItems(response.count);
      } catch (err: unknown) {
        console.error('Error fetching users:', err);
        setError('No se pudieron cargar los usuarios.');
      } finally {
        setIsLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (token && user?.sub) {
      fetchUsers(currentPage, itemsPerPage, searchQuery, selectedRole);
    }
  }, [
    fetchUsers,
    currentPage,
    itemsPerPage,
    searchQuery,
    selectedRole,
    token,
    user,
  ]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns = [
    { key: 'firstName', label: 'Nombre', render: (u: UserList) => u.firstName },
    { key: 'lastName', label: 'Apellido', render: (u: UserList) => u.lastName },
    { key: 'email', label: 'Correo', render: (u: UserList) => u.email },
    {
      key: 'role',
      label: 'Rol',
      render: (u: UserList) => roleTranslations[u.role] || u.role,
    },
    {
      key: 'isValidated',
      label: 'Correo Validado',
      render: (u: UserList) => (
        <div
          className={`ml-2.5 flex h-[24px] w-[85px] min-w-[100px] items-center justify-center rounded-[6px] px-[10px] py-[3px] text-xs font-medium ${
            u.isValidated ? 'bg-[#A3E4D7]' : 'bg-[#F5B7B1]'
          }`}
        >
          {u.isValidated ? 'Validado' : 'No Validado'}
        </div>
      ),
    },
  ];

  const handleRoleChange = (label: string) => {
    const opt = roleOptions.find((o) => o.label === label);
    setSelectedRole(opt?.value || '');
    setCurrentPage(1);
  };

  return (
    <div
      className="overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 150px)' }}
    >
      {error && (
        <div className="mb-4 rounded bg-red-100 p-2 text-red-700">{error}</div>
      )}
      <TableContainer
        title="Usuarios"
        onAddClick={() => router.push('/users/new')}
        addButtonText="Agregar Usuario"
        onSearch={handleSearch}
        dropdownComponent={
          <Dropdown
            title="Rol"
            items={roleOptions.map((o) => o.label)}
            onChange={handleRoleChange}
          />
        }
        tableData={users}
        tableColumns={columns}
        onView={(u) => router.push(`/users/${u.id}`)}
        onEdit={(u) => router.push(`/users/${u.id}/edit`)}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: (val) => {
            setItemsPerPage(val);
            setCurrentPage(1);
          },
          itemsPerPageOptions: [5, 10, 15, 20],
        }}
      />
      {isLoading && (
        <div className="mt-4 text-center">Cargando usuarios...</div>
      )}
    </div>
  );
}
