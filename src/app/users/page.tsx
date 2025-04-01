'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import TableContainer from '@/components/TableContainer';
import Dropdown from '@/components/Dropdown';
import { Column } from '@/components/Table';
import { api } from '@/lib/sdkConfig';

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
} as const;

// Objeto inverso para mapear de español a inglés.
const roleReverse: Record<string, string> = {
  Administrador: 'admin',
  'Administrador de Sucursal': 'branch_admin',
  Cliente: 'customer',
  Repartidor: 'delivery',
};

export default function UsersPage() {
  const router = useRouter();

  // Estado para la lista de usuarios
  const [users, setUsers] = useState<UserItem[]>([]);

  // Roles en español para el dropdown (incluye "Todos")
  const roles = [
    'Todos',
    'Administrador',
    'Administrador de Sucursal',
    'Cliente',
    'Repartidor',
  ];

  // Estado para el rol seleccionado (internamente en inglés, excepto "Todos")
  const [selectedRole, setSelectedRole] = useState<string>('Todos');

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Función para traer usuarios de la API
  const fetchUsers = async (page: number, limit: number) => {
    try {
      const token =
        sessionStorage.getItem('pharmatechToken') ||
        localStorage.getItem('pharmatechToken');
      if (!token) return;

      const response: UserResponse = await api.user.findAll(
        { page, limit },
        token,
      );
      setUsers(response.results);
      setTotalItems(response.count);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // Filtrar usuarios según el rol seleccionado (valor en inglés)
  const filteredUsers =
    selectedRole === 'Todos'
      ? users
      : users.filter((user) => user.role === selectedRole);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Columnas a mostrar en la tabla
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
    console.log('Ver usuario:', item);
  };

  const handleEdit = (item: UserItem) => {
    router.push(`/users/${item.id}/edit`);
    console.log('Editar usuario:', item);
  };

  // Si se selecciona "Todos" se guarda directamente; sino se convierte la etiqueta en español al valor en inglés.
  const handleRoleChange = (val: string) => {
    setSelectedRole(val === 'Todos' ? 'Todos' : roleReverse[val]);
    console.log('Filtrar por rol:', val);
  };

  const handleSearch = (query: string) => {
    console.log('Buscando usuario:', query);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
          <div className="mx-auto my-12">
            <div className="[&>ul]:max-h-60 [&>ul]:overflow-y-auto">
              <TableContainer
                title="Usuarios"
                dropdownComponent={
                  <Dropdown
                    title="Rol"
                    items={roles}
                    onChange={handleRoleChange}
                  />
                }
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
        </main>
      </div>
    </div>
  );
}
