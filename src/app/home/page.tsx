//Ver sucursales
'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import TableContainer from '@/components/TableContainer';
import { Column } from '@/components/Table';
//import { Colors } from '@/styles/styles';
import Dropdown from '@/components/Dropdown';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/sdkConfig';

interface BranchItem {
  id: string;
  name: string;
  address: string;
  city: {
    id: string;
    name: string;
  };
  latitude: number;
  longitude: number;
}

interface BranchResponse {
  results: BranchItem[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface StateItem {
  id: string;
  name: string;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [states, setStates] = useState<string[]>(['Todos']);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const router = useRouter();

  const fetchBranches = async (page: number, limit: number) => {
    try {
      const token =
        sessionStorage.getItem('pharmatechToken') ||
        localStorage.getItem('pharmatechToken');
      if (!token) return;
      const response: BranchResponse = await api.branch.findAll(
        { page, limit },
        token,
      );
      setBranches(response.results);
      setTotalItems(response.count);
    } catch (error) {
      console.error('Error al obtener sucursales:', error);
    }
  };

  const fetchStates = async () => {
    try {
      const token =
        sessionStorage.getItem('pharmatechToken') ||
        localStorage.getItem('pharmatechToken');
      if (!token) return;
      const response = await api.state.findAll({
        page: 1,
        limit: 24,
        countryId: '1238bc2a-45a5-47e4-9cc1-68d573089ca1',
      });
      const stateNames = response.results.map((state: StateItem) => state.name);
      setStates(['Todos', ...stateNames]);
    } catch (error) {
      console.error('Error al obtener estados:', error);
    }
  };

  useEffect(() => {
    fetchBranches(currentPage, itemsPerPage);
    fetchStates();
  }, [currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: Column<BranchItem>[] = [
    /* {
      key: 'id',
      label: 'ID',
      render: (item) => item.id.slice(0, 6),
    }, */
    {
      key: 'name',
      label: 'Nombre',
      render: (item) => item.name,
    },
    {
      key: 'address',
      label: 'Ubicación',
      render: (item) => item.address,
    },
    {
      key: 'city',
      label: 'Ciudad',
      render: (item) => item.city.name,
    },
    /* {
      key: 'status',
      label: 'Status',
      render: () => (
        <span
          className="items-center justify-center rounded-md px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: Colors.secondaryLight,
            color: Colors.textMain,
          }}
        >
          Disponible
        </span>
      ),
    }, */
  ];
  const handleAddBranch = () => {
    router.push('/home/new');
  };

  const handleView = (item: BranchItem) => {
    router.push(`/home/${item.id}`);
    console.log('Ver sucursal:', item);
  };

  const handleEdit = (item: BranchItem) => {
    router.push(`/home/${item.id}/edit`);
    console.log('Editar sucursal:', item);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
          <div className="mx-auto my-12 max-h-[616px] max-w-[949px]">
            <div className="[&>ul]:max-h-60 [&>ul]:overflow-y-auto">
              <TableContainer
                title="Sucursales"
                dropdownComponent={
                  <Dropdown
                    title="Estado"
                    items={states}
                    onChange={(val) => console.log('Filtrar por estado:', val)}
                  />
                }
                //onAddClick={() => console.log('Agregar nueva sucursal')}
                onAddClick={handleAddBranch}
                onSearch={(query) => console.log('Buscando sucursal:', query)}
                tableData={branches}
                tableColumns={columns}
                onEdit={handleEdit}
                onView={handleView}
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
