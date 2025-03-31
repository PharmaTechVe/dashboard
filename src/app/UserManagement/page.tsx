'use client';

import { useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import TableContainer from '@/components/TableContainer';
import Dropdown from '@/components/Dropdown';
import useUsers from './lib/useUsers';
import { UserItem } from './lib/userService';
import { Column } from '@/components/Table';

export default function UsersPage() {
  const router = useRouter();
  const { users, pagination, actions, loading, error } = useUsers();

  const roles = ['Todos', 'Administrador', 'Usuario'];

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
      render: (item) => item.role,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <span className="font-poppins flex h-[24px] w-[85px] flex-row items-center justify-center gap-[1px] rounded-[6px] bg-[#A3E4D7] px-[10px] py-[3px] text-[12px] font-medium leading-[20px] text-[#393938]">
          {item.status}
        </span>
      ),
    },
  ];

  const handleAddUser = () => router.push('/UserManagement/new');
  const handleView = (item: UserItem) =>
    router.push(`/UserManagement/${item.id}`);
  const handleEdit = (item: UserItem) =>
    router.push(`/UserManagement/${item.id}/edit`);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
          <div className="mx-auto my-12">
            {loading && <p className="mb-4">Cargando...</p>}
            {error && <p className="mb-4 text-red-500">{error}</p>}
            <div className="rounded-[12px] border border-[#E4E4E7] drop-shadow-sm">
              <TableContainer
                title="Usuarios"
                dropdownComponent={
                  <Dropdown
                    title="Filtrar por rol"
                    items={roles}
                    onChange={(val) => {
                      console.log('Filtrar por rol:', val);
                      actions.setFilter(val);
                    }}
                  />
                }
                onAddClick={handleAddUser}
                onSearch={(query) => {
                  console.log('Buscando usuario:', query);
                  actions.setSearch(query);
                }}
                tableData={users}
                tableColumns={columns}
                onEdit={handleEdit}
                onView={handleView}
                pagination={{
                  currentPage: pagination.page,
                  totalPages: Math.ceil(pagination.total / pagination.limit),
                  totalItems: pagination.total,
                  itemsPerPage: pagination.limit,
                  onPageChange: actions.changePage,
                  onItemsPerPageChange: actions.changeLimit,
                  itemsPerPageOptions: [5, 10, 15, 20],
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
