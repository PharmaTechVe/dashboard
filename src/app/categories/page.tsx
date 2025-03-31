'use client';
import { useState, useEffect } from 'react';
import { Client, CategoryService } from '@pharmatech/sdk';
import Link from 'next/link';
import Sidebar from '@/components/SideBar';
import AdminNavBar from '@/components/Navbar';

interface Category {
  id: string;
  name: string;
  description: string;
  status: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FindAllCategoriesParams {
  page: number;
  limit: number;
  search?: string;
}

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const isDevMode = process.env.NODE_ENV === 'development';
        const client = new Client(isDevMode);
        const categoryService = new CategoryService(client);

        const params: FindAllCategoriesParams = {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm || undefined,
        };

        const response = await categoryService.findAll(params);

        setCategories(response.results);
        setPagination({
          page: pagination.page,
          limit: pagination.limit,
          total: response.count,
          totalPages: Math.ceil(response.count / pagination.limit),
        });
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [pagination.page, pagination.limit, searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPagination(DEFAULT_PAGINATION);
  };

  if (loading) return <div className="p-6">Cargando categorías...</div>;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <AdminNavBar />
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Buscar categorías..."
                className="rounded-md border border-gray-300 px-3 py-2"
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Link
                href="/categories/new"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Agregar Categoría
              </Link>
            </div>
          </div>

          <div className="rounded-md bg-white p-6 shadow-md">
            {/* Tabla de categorías */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-[#1C2143] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Nombre</th>
                    <th className="px-4 py-3 text-left">Descripción</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{category.id}</td>
                      <td className="px-4 py-3 font-medium">{category.name}</td>
                      <td className="px-4 py-3">{category.description}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            category.status === 'Activo'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {category.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/categories/${category.id}/edit`}
                            className="rounded-md bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
                          >
                            Editar
                          </Link>
                          <Link
                            href={`/categories/${category.id}`}
                            className="rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200"
                          >
                            Ver
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                de {pagination.total} categorías
              </p>

              <div className="flex items-center gap-4">
                <select
                  value={pagination.limit}
                  onChange={(e) =>
                    setPagination((prev) => ({
                      ...prev,
                      limit: Number(e.target.value),
                      page: 1,
                    }))
                  }
                  className="rounded-md border border-gray-300 p-1 text-sm"
                >
                  <option value="5">5 por página</option>
                  <option value="10">10 por página</option>
                  <option value="20">20 por página</option>
                  <option value="50">50 por página</option>
                </select>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="rounded-md border border-gray-300 p-1 disabled:opacity-50"
                  >
                    &lt;
                  </button>

                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 rounded-md p-1 ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="rounded-md border border-gray-300 p-1 disabled:opacity-50"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
