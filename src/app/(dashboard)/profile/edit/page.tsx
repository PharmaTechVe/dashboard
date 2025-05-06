'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/Input/Input';
import Button from '@/components/Button';
import DatePicker1 from '@/components/Calendar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/sdkConfig';
import Loader from '@/components/Loader';
import { toast } from 'react-toastify';
import { editProfileSchema } from '@/lib/validations/editProfileSchema';
import { UserList } from '@pharmatech/sdk';

export default function EditProfilePage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserList | null>(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');

  // Carga inicial del perfil
  const fetchProfile = useCallback(async () => {
    if (!user?.sub || !token) return;
    try {
      const res = await api.user.getProfile(user.sub, token);
      setProfile(res);
      setFirstName(res.firstName);
      setLastName(res.lastName);
      setPhone(res.phoneNumber || '');
      const bd = res.profile?.birthDate;
      const formatted = bd
        ? typeof bd === 'string'
          ? bd
          : bd.toISOString().slice(0, 10)
        : '';
      setBirthDate(formatted);
    } catch (err) {
      console.error(err);
      toast.error('No se pudo cargar tu perfil');
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return <Loader />;
  if (!profile) return null;

  const handleSubmit = async () => {
    // Usando el esquema editProfileSchema para la validación
    const result = editProfileSchema.safeParse({
      firstName,
      lastName,
      phone,
      birthDate,
    });

    if (!result.success) {
      // Manejamos los errores de validación
      const fe = result.error.flatten().fieldErrors;
      setErrors({
        firstName: fe.firstName?.[0] || '',
        lastName: fe.lastName?.[0] || '',
        phone: fe.phone?.[0] || '',
        birthDate: fe.birthDate?.[0] || '',
      });
      toast.error('Por favor corrige los errores');
      return;
    }

    const data = result.data;
    try {
      await api.user.update(
        user!.sub,
        {
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phone,
          birthDate: data.birthDate,
        },
        token!,
      );
      toast.success('Perfil actualizado');
      router.push('/profile');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar cambios');
    }
  };

  return (
    <div className="font-poppins space-y-6 p-8 py-0 [&_input]:text-gray-500">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Nombre */}
        <div className="flex flex-col">
          <Input
            label="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            borderColor="#E7E7E6"
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>
        {/* Apellido */}
        <div className="flex flex-col">
          <Input
            label="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            borderColor="#E7E7E6"
          />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName}</p>
          )}
        </div>
        {/* Cédula (solo lectura) */}
        <div className="flex flex-col">
          <Input
            label="Cédula"
            type="text"
            helperText={errors.documentId}
            value={profile.documentId}
            borderColor="#E7E7E6"
            readViewOnly
          />
        </div>
        {/* Correo (solo lectura) */}
        <div className="flex flex-col">
          <Input
            label="Correo Electrónico"
            type="text"
            helperText={errors.documentId}
            value={profile.email}
            borderColor="#E7E7E6"
            readViewOnly
          />
        </div>
        <div className="flex flex-col">
          <p className="mb-1 font-medium text-[#666666]">Fecha de Nacimiento</p>
          <DatePicker1
            initialDate={birthDate}
            onDateSelect={(date) => setBirthDate(date)}
          />
          {errors.birthDate && (
            <p className="text-sm text-red-500">{errors.birthDate}</p>
          )}
        </div>
        {/* Teléfono */}
        <div className="flex flex-col">
          <Input
            label="Número de Teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            borderColor="#E7E7E6"
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center py-8">
        <Button
          onClick={handleSubmit}
          className="h-[50px] w-full max-w-[804px] rounded-md bg-[#1E2A4A] text-white"
        >
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
