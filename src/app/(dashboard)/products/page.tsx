'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import TableContainer from '@/components/TableContainer';
import Dropdown from '@/components/Dropdown';
import { Column } from '@/components/Table';
import { api } from '@/lib/sdkConfig';
import { CategoryResponse, GenericProductResponse } from '@pharmatech/sdk';

export default function GenericProductListPage() {
  const [products, setProducts] = useState<GenericProductResponse[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<
    GenericProductResponse[]
  >([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const { token, user } = useAuth();
  const router = useRouter();

  const fetchProducts = useCallback(async (page: number, limit: number) => {
    try {
      const response = await api.genericProduct.findAll({ page, limit });
      setProducts(response.results);
      setFilteredProducts(response.results);
      setTotalItems(response.count);
    } catch (error) {
      console.error('Error fetching generic products:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const resp = await api.category.findAll({ page: 1, limit: 20 });
      const catNames = resp.results.map((cat: CategoryResponse) => cat.name);
      setCategories(catNames);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  }, []);

  useEffect(() => {
    if (!token || !user?.sub) return;

    fetchProducts(currentPage, itemsPerPage);
    fetchCategories();
  }, [currentPage, itemsPerPage, token, user, fetchProducts, fetchCategories]);

  useEffect(() => {
    const filtered = searchQuery
      ? products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.genericName
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            product.manufacturer.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
        )
      : products;

    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns: Column<GenericProductResponse>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (item) => item.name,
    },
    {
      key: 'genericName',
      label: 'Nombre genérico',
      render: (item) => item.genericName,
    },
    {
      key: 'manufacturer',
      label: 'Marca',
      render: (item) => item.manufacturer.name,
    },
    {
      key: 'priority',
      label: 'Prioridad',
      render: (item) => item.priority,
    },
  ];

  const handleEdit = (item: GenericProductResponse) => {
    router.push(`/products/${item.id}/edit`);
  };

  const handleView = (item: GenericProductResponse) => {
    router.push(`/products/${item.id}`);
  };

  const handleAdd = () => {
    router.push(`/products/new`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <div
      className="overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 150px)' }}
    >
      <TableContainer
        title="Productos genéricos"
        dropdownComponent={
          <Dropdown
            title="Categorías"
            items={categories}
            onChange={(val) => console.log('Filtrar por categoría:', val)}
          />
        }
        onAddClick={handleAdd}
        onSearch={handleSearch} // Añadida la función de búsqueda
        tableData={filteredProducts} // Usa los datos filtrados
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
          itemsPerPageOptions: [5, 10, 15, 20],
        }}
      />
    </div>
  );
}
