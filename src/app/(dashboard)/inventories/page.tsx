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
  InventoryResponse,
} from '@pharmatech/sdk';
import { toast } from 'react-toastify';
import Input from '@/components/Input/Input';
import { formatDateSafe } from '@/lib/utils/useFormatDate';

export default function InventoryListPage() {
  const { token, user } = useAuth();

  const [inventories, setInventories] = useState<InventoryResponse[]>([]);
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

  const fetchInventories = useCallback(async () => {
    if (!token || !user?.sub) return;
    setIsLoading(true);
    setError(null);
    const params: Parameters<typeof api.inventory.findAll>[0] = {
      page: currentPage,
      limit: itemsPerPage,
      ...(selectedBranchId ? { branchId: selectedBranchId } : {}),
    };
    try {
      const response: Pagination<InventoryResponse> =
        await api.inventory.findAll(params);
      setInventories(response.results);
      setTotalItems(response.count);
    } catch (err: unknown) {
      console.error('Error fetching inventories:', err);
      toast.error('Error al cargar los inventarios');
      setError('No se pudieron cargar los inventarios.');
    } finally {
      setIsLoading(false);
    }
  }, [token, user?.sub, currentPage, itemsPerPage, selectedBranchId]);

  useEffect(() => {
    fetchInventories();
  }, [fetchInventories]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getColumns = () => {
    const columns = [
      {
        key: 'name',
        label: 'Producto',
        render: (i: InventoryResponse) => i.productPresentation.product.name,
      },
      {
        key: 'presentation',
        label: 'Presentación',
        render: (i: InventoryResponse) =>
          i.productPresentation.presentation.name,
      },
      {
        key: 'manufacturer',
        label: 'Marca',
        render: (i: InventoryResponse) =>
          i.productPresentation.product.manufacturer.name,
      },
      {
        key: 'updatedAt',
        label: 'Actualizado el',
        render: (i: InventoryResponse) => formatDateSafe(i.updatedAt),
      },
      {
        key: 'stockQuantity',
        label: 'Existencia',
        render: (i: InventoryResponse) => {
          //const [value, setValue] = useState(i.stockQuantity);
          return (
            <Input
              value={i.stockQuantity.toString()}
              //onChange={(e) => setValue(Number(e.target.value))}
            />
          );
        },
      },
    ];
    if (user?.role == UserRole.ADMIN) {
      columns.unshift({
        key: 'branch',
        label: 'Sucursal',
        render: (i: InventoryResponse) => i.branch.name,
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

      <TableContainer<InventoryResponse>
        title="Inventario"
        dropdownComponent={renderDropdown()}
        tableData={inventories}
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
