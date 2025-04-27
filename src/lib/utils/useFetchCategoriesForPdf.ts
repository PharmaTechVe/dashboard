'use client';

import { useState, useEffect } from 'react';
import { CategoryResponse } from '@pharmatech/sdk/types';
import { api } from '@/lib/sdkConfig';
import { useAuth } from '@/context/AuthContext';

export function useFetchCategoriesForPdf(limit = 40) {
  const { token } = useAuth();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);

      try {
        const response = await api.category.findAll({ page: 1, limit });
        setCategories(response.results);
      } catch (error) {
        console.error('Error al obtener categorías:', error);
        setError('Error al cargar categorías');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [token, limit]);

  return { categories, loading, error };
}
