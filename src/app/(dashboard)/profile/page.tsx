// src/app/(dashboard)/profile/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input/Input';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/sdkConfig';
import Loader from '@/components/Loader';
import { toast } from 'react-toastify';
import { UserList } from '@pharmatech/sdk';

export default function ProfilePage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user?.sub || !token) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.user.getProfile(user.sub, token);
      setProfile(res);
      setError(null);
    } catch (err) {
      console.error('Error cargando perfil:', err);
      toast.error('Error cargando perfil');
      setError('No se pudo cargar tu perfil');
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return <Loader />;
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>;
  if (!profile) return null;

  const bd = profile.profile?.birthDate;
  // formatea la fecha como DD/MM/YYYY
  const birthDate = bd
    ? new Date(bd).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  return (
    <div className="font-poppins space-y-4 p-8 py-0 [&_input]:text-gray-500">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 font-normal">Nombre</p>
          <Input value={profile.firstName} readViewOnly />
        </div>
        <div>
          <p className="mb-2 font-normal">Apellido</p>
          <Input value={profile.lastName} readViewOnly />
        </div>
        <div>
          <p className="mb-2 font-normal">Cédula</p>
          <Input value={profile.documentId} readViewOnly />
        </div>
        <div>
          <p className="mb-2 font-normal">Correo Electrónico</p>
          <Input value={profile.email} readViewOnly />
        </div>
        <div>
          <p className="mb-2 font-normal">Fecha de Nacimiento</p>
          <Input value={birthDate} readViewOnly iconPosition="right" />
        </div>
        <div>
          <p className="mb-2 font-normal">Número de Teléfono</p>
          <Input value={profile.phoneNumber} readViewOnly />
        </div>
      </div>
      <div className="mt-8 flex justify-center py-8">
        <Button
          onClick={() => router.push('/profile/edit')}
          className="h-[50px] w-full max-w-[804px] rounded-md bg-[#1E2A4A] text-white"
        >
          Editar Perfil
        </Button>
      </div>
    </div>
  );
}
