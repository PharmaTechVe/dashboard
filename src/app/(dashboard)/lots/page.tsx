'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TableContainer from '@/components/TableContainer';
import Dropdown from '@/components/Dropdown';
import { api } from '@/lib/sdkConfig';
import { useAuth } from '@/context/AuthContext';
import {
  Pagination,
  BranchResponse,
  UserRole,
  LotResponse,
} from '@pharmatech/sdk';
import { toast } from 'react-toastify';
import { formatDateSafe } from '@/lib/utils/useFormatDate';
import { formatPrice } from '@/lib/utils/priceFormatter';

export default function InventoryListPage() {
  const { token, user } = useAuth();

  const [lots, setLots] = useState<LotResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const branchOptions = ['Todas', ...branches.map((branch) => branch.name)];
  const handleBranchChange = (label: string) => {
    const branch = branches.find((branch) => branch.name === label);
    setSelectedBranchId(branch?.id ?? '');
    setCurrentPage(1);
  };

  const fetchBranches = useCallback(async () => {
    try {
      const resp = await api.branch.findAll({ page: 1, limit: 100 });
      setBranches(resp.results);
    } catch (err: unknown) {
      console.error('Error fetching Branches:', err);
      toast.error('No se pudieron cargar las sucursales');
    }
  }, []);

  useEffect(() => {
    if (token && user?.sub && user.role == UserRole.ADMIN) fetchBranches();
  }, [fetchBranches, token, user?.sub]);

  const fetchLots = useCallback(async () => {
    if (!token || !user?.sub) return;
    setIsLoading(true);
    setError(null);
    const params: Parameters<typeof api.lot.findAll>[0] = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (user.role == UserRole.BRANCH_ADMIN) {
      params.branchId = user.branch?.id;
    } else {
      params.branchId = selectedBranchId ? selectedBranchId : undefined;
    }
    try {
      const response: Pagination<LotResponse> = await api.lot.findAll(params);
      setLots(response.results);
      setTotalItems(response.count);
    } catch (err: unknown) {
      console.error('Error fetching lots:', err);
      toast.error('Error al cargar los lotes');
      setError('No se pudieron cargar los lotes.');
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.sub, currentPage, itemsPerPage, selectedBranchId]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getColumns = () => {
    const columns = [
      {
        key: 'name',
        label: 'Producto',
        render: (i: LotResponse) => i.productPresentation.product.name,
      },
      {
        key: 'presentation',
        label: 'Presentación',
        render: (i: LotResponse) => i.productPresentation.presentation.name,
      },
      {
        key: 'manufacturer',
        label: 'Marca',
        render: (i: LotResponse) =>
          i.productPresentation.product.manufacturer.name,
      },
      {
        key: 'expirationDate',
        label: 'Fecha de expiración',
        render: (i: LotResponse) => formatDateSafe(i.expirationDate),
      },
      {
        key: 'stockQuantity',
        label: 'Existencia',
        render: (i: LotResponse) => i.quantity,
      },
      {
        key: 'price',
        label: 'Precio',
        render: (i: LotResponse) =>
          `$${formatPrice(i.productPresentation.price)}`,
      },
      {
        key: 'total',
        label: 'Total',
        render: (i: LotResponse) =>
          `$${formatPrice(i.quantity * i.productPresentation.price)}`,
      },
    ];
    if (user?.role == UserRole.ADMIN) {
      columns.unshift({
        key: 'branch',
        label: 'Sucursal',
        render: (i: LotResponse) => i.branch.name,
      });
    }
    return columns;
  };

  const renderDropdown = () => {
    if (user?.role == UserRole.ADMIN) {
      return (
        <Dropdown
          title="Sucursales"
          items={branchOptions}
          onChange={handleBranchChange}
        />
      );
    }
    return <></>;
  };

  return (
    <div
      className="overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 150px)' }}
    >
      {error && (
        <div className="mb-4 rounded bg-red-100 p-2 text-red-700">{error}</div>
      )}

      <TableContainer<LotResponse>
        title="Lotes"
        dropdownComponent={renderDropdown()}
        tableData={lots}
        tableColumns={getColumns()}
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
        isLoading={isLoading}
      />
    </div>
  );
}
