'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TableContainer from '@/components/TableContainer';
import Dropdown from '@/components/Dropdown';
import { api } from '@/lib/sdkConfig';
import { useAuth } from '@/context/AuthContext';
import { Pagination, BranchResponse, StateResponse } from '@pharmatech/sdk';

const COUNTRY_ID = '1238bc2a-45a5-47e4-9cc1-68d573089ca1';

export default function BranchesPage() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [states, setStates] = useState<StateResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const DEBOUNCE_MS = 500;

  const handleSearch = (q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(q.trim());
      setCurrentPage(1);
    }, DEBOUNCE_MS);
  };

  const handleStateChange = (label: string) => {
    const st = states.find((s) => s.name === label);
    setSelectedStateId(st?.id ?? '');
    setCurrentPage(1);
  };

  const fetchStates = useCallback(async () => {
    if (!token) return;
    try {
      const resp = await api.state.findAll({
        page: 1,
        limit: 100,
        countryId: COUNTRY_ID,
      });
      setStates(resp.results);
    } catch (err) {
      console.error('Error fetching states:', err);
    }
  }, [token]);

  const fetchBranches = useCallback(
    async (page: number, limit: number, q: string, stateId: string) => {
      if (!token) return;
      try {
        const params: Parameters<typeof api.branch.findAll>[0] = {
          page,
          limit,
          ...(q ? { q } : {}),
          ...(stateId ? { stateId } : {}),
        };
        const response: Pagination<BranchResponse> =
          await api.branch.findAll(params);
        setBranches(response.results);
        setTotalItems(response.count);
      } catch (err) {
        console.error('Error fetching branches:', err);
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token || !user?.sub) return;
    fetchStates();
  }, [fetchStates, token, user]);

  useEffect(() => {
    if (!token || !user?.sub) return;
    fetchBranches(currentPage, itemsPerPage, searchQuery, selectedStateId);
  }, [
    fetchBranches,
    currentPage,
    itemsPerPage,
    searchQuery,
    selectedStateId,
    token,
    user,
  ]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const branchColumns = [
    { key: 'name', label: 'Nombre', render: (b: BranchResponse) => b.name },
    {
      key: 'address',
      label: 'Ubicación',
      render: (b: BranchResponse) => b.address,
    },
    {
      key: 'city',
      label: 'Ciudad',
      render: (b: BranchResponse) => b.city.name,
    },
  ];

  const stateOptions = ['Todos', ...states.map((s) => s.name)];

  return (
    <div className="mx-auto my-12 max-h-[616px] max-w-[949px]">
      <TableContainer
        title="Sucursales"
        onSearch={handleSearch}
        dropdownComponent={
          <Dropdown
            title="Estado"
            items={stateOptions}
            onChange={handleStateChange}
          />
        }
        addButtonText="Agregar Sucursal"
        onAddClick={() => router.push('/branches/new')}
        tableData={branches}
        tableColumns={branchColumns}
        onView={(b) => router.push(`/branches/${b.id}`)}
        onEdit={(b) => router.push(`/branches/${b.id}/edit`)}
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
    </div>
  );
}
