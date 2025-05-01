'use client';

import { useCallback, useEffect, useState } from 'react';
import TableContainer from '@/components/TableContainer';
import Dropdown from '@/components/Dropdown';
import { Column } from '@/components/Table';
import { api } from '@/lib/sdkConfig';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { BranchResponse, StateResponse } from '@pharmatech/sdk';

/// This is a constant that represents the ID of Venezuela.
const COUNTRY_ID = '1238bc2a-45a5-47e4-9cc1-68d573089ca1';

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [states, setStates] = useState<string[]>(['Todos']);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const { token, user } = useAuth();
  const router = useRouter();

  const fetchBranches = useCallback(
    async (page: number, limit: number) => {
      try {
        if (!token) return;

        const response = await api.branch.findAll({ page, limit });
        setBranches(response.results);
        setTotalItems(response.count);
      } catch (error) {
        console.error('Error al obtener sucursales:', error);
      }
    },
    [token],
  );

  const fetchStates = useCallback(async () => {
    try {
      if (!token) return;

      const response = await api.state.findAll({
        page: 1,
        limit: 24,
        countryId: COUNTRY_ID,
      });

      const statesList = response.results as StateResponse[];
      const stateNames = statesList.map((state) => state.name);
      setStates(['Todos', ...stateNames]);
    } catch (error) {
      console.error('Error al obtener estados:', error);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !user?.sub) return;

    fetchBranches(currentPage, itemsPerPage);
    fetchStates();
  }, [currentPage, itemsPerPage, token, user, fetchBranches, fetchStates]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: Column<BranchResponse>[] = [
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
  ];

  const handleAddBranch = () => {
    router.push('/branches/new');
  };

  const handleView = (item: BranchResponse) => {
    router.push(`/branches/${item.id}`);
  };

  const handleEdit = (item: BranchResponse) => {
    router.push(`/branches/${item.id}/edit`);
  };

  return (
    <div className="mx-auto my-12">
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
          addButtonText="Agregar Sucursal"
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
  );
}
