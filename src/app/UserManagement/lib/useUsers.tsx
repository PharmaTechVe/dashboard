// src/app/UserManagement/lib/useUsers.tsx
import { useState, useEffect, useCallback } from 'react';
import { findAllUsers, UserItem, UserResponse } from './userService';

interface UseUsersProps {
  initialPage?: number;
  initialLimit?: number;
}

const useUsers = ({
  initialPage = 1,
  initialLimit = 10,
}: UseUsersProps = {}) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
  });
  const [filter, setFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getToken = useCallback((): string | null => {
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken')
    );
  }, []);

  const fetchUsers = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('No se encontró token de autenticación');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Si hay búsqueda o filtro distinto a "Todos", obtenemos un listado amplio y filtramos localmente.
      if (searchQuery || filter !== 'Todos') {
        const response: UserResponse = await findAllUsers(
          { page: 1, limit: 1000 },
          token,
        );
        let filteredResults = response.results;
        // Filtrar por rol si corresponde
        if (filter === 'Administrador') {
          filteredResults = filteredResults.filter(
            (u) => u.role === 'admin' || u.role === 'branch_admin',
          );
        } else if (filter === 'Usuario') {
          filteredResults = filteredResults.filter(
            (u) => u.role === 'customer',
          );
        }
        // Filtrar por búsqueda en id, firstName o lastName (insensible a mayúsculas)
        if (searchQuery) {
          const lowerSearch = searchQuery.toLowerCase();
          filteredResults = filteredResults.filter(
            (u) =>
              u.id.toLowerCase().includes(lowerSearch) ||
              u.firstName.toLowerCase().includes(lowerSearch) ||
              u.lastName.toLowerCase().includes(lowerSearch) ||
              u.email.toLowerCase().includes(lowerSearch),
          );
        }
        const totalFiltered = filteredResults.length;
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        const pageData = filteredResults.slice(startIndex, endIndex);
        setUsers(pageData);
        setPagination((prev) => ({
          ...prev,
          total: totalFiltered,
        }));
      } else {
        // Sin búsqueda y con filtro "Todos": usar paginación desde la API
        const response: UserResponse = await findAllUsers(
          { page: pagination.page, limit: pagination.limit },
          token,
        );
        setUsers(response.results);
        setPagination((prev) => ({
          ...prev,
          total: response.count,
        }));
      }
    } catch (err: unknown) {
      let errorMessage = 'Error al obtener los usuarios';
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filter, searchQuery, getToken]);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setPagination((prev) => ({
      page: 1,
      limit: newLimit,
      total: prev.total,
    }));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    filter,
    searchQuery,
    actions: {
      refresh: fetchUsers,
      changePage: handlePageChange,
      changeLimit: handleLimitChange,
      setFilter: (val: string) => {
        setFilter(val);
        setPagination((prev) => ({ ...prev, page: 1 }));
      },
      setSearch: (query: string) => {
        setSearchQuery(query);
        setPagination((prev) => ({ ...prev, page: 1 }));
      },
    },
  };
};

export default useUsers;
