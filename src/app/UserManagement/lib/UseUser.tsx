'use client';

import { useState, useEffect, useCallback } from 'react';
import { findUserById, UserItem } from '../lib/userService';

const useUser = (id: string) => {
  const [user, setUser] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback((): string | null => {
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken')
    );
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (!token) {
        setError('Token no encontrado');
        setLoading(false);
        return;
      }
      try {
        const userResponse = await findUserById(id, token);
        setUser(userResponse);
      } catch (err) {
        console.error('Error al obtener el usuario:', err);
        setError('Error al obtener el usuario');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id, getToken]);

  return { user, loading, error };
};

export default useUser;
