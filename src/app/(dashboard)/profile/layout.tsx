'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/sdkConfig';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserList } from '@pharmatech/sdk';
import Breadcrumb from '@/components/Breadcrumb';
import { toast } from 'react-toastify';

interface ProfileLayoutProps {
  children: ReactNode;
}

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  superadmin: 'Superadministrador',
};

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<UserList | null>(null);
  const [uploading, setUploading] = useState(false);
  const path = usePathname() ?? '';
  const isSecurity = path.includes('/profile/security');
  const isEdit = path.includes('/profile/edit');

  const breadcrumbItems = [
    { label: 'Mi Perfil', href: '/profile' },
    ...(isEdit
      ? [{ label: 'Editar perfil', href: '/profile/edit' }]
      : isSecurity
        ? [{ label: 'Cambiar contraseña', href: '/profile/security' }]
        : []),
  ];

  useEffect(() => {
    if (!user?.sub || !token) return;
    (async () => {
      try {
        const res = await api.user.getProfile(user.sub, token);
        setProfile(res);
      } catch (err) {
        console.error('Error cargando perfil:', err);
      }
    })();
  }, [user, token]);

  if (!profile) return <p className="p-6 text-center">Cargando perfil…</p>;

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const sigRes = await fetch('/api/sign-cloudinary');
      if (!sigRes.ok) throw new Error(`Firma fallida: ${sigRes.status}`);
      const { signature, timestamp, apiKey, cloudName, folder } =
        await sigRes.json();
      if (!signature || timestamp == null || !apiKey || !cloudName) {
        throw new Error('Datos de firma inválidos');
      }

      const form = new FormData();
      form.append('file', file);
      form.append('api_key', apiKey);
      form.append('timestamp', String(timestamp));
      form.append('signature', signature);
      form.append('folder', folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: form },
      );
      const data = await uploadRes.json();
      if (!data.secure_url) {
        console.error('Cloudinary error:', data);
        throw new Error('No se recibió URL de la imagen');
      }

      await api.user.update(
        user!.sub,
        { profilePicture: data.secure_url },
        token!,
      );
      setProfile((p) =>
        p
          ? {
              ...p,
              profile: { ...p.profile!, profilePicture: data.secure_url },
            }
          : p,
      );
      toast.success('Avatar actualizado');
    } catch (err) {
      console.error('[UPLOAD ERROR]', err);
      toast.error('Error al subir el avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-12 flex flex-col items-center">
      <div className="mb-4 w-[906px]">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="relative w-[906px] rounded-[16px] bg-white p-8 shadow-lg">
        <div className="mx-6 my-2 flex items-center">
          <div className="relative h-24 w-24 rounded-full border-4 border-white bg-gray-100 shadow-md">
            <Image
              src={profile.profile?.profilePicture ?? '/images/avatar.png'}
              alt="Avatar"
              width={96}
              height={96}
              className="h-full w-full rounded-full object-cover"
            />
            {isEdit && (
              <>
                <button
                  className="absolute bottom-0 right-0 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#2D397B] hover:bg-opacity-90"
                  onClick={() =>
                    document.getElementById('avatar-upload')?.click()
                  }
                  aria-label="Editar avatar"
                >
                  <svg
                    width="15"
                    height="19"
                    viewBox="0 0 15 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.40974 16.5121L13.8218 13.529M5.44435 5.18871L11.3094 14.9138M7.88488 3.45702C7.97384 3.60685 7.91605 3.80123 7.75579 3.8912L2.89534 6.6196C2.73508 6.70956 2.53304 6.66103 2.44407 6.5112C0.438238 3.13329 1.74333 1.84064 2.90922 1.18617C4.07511 0.531702 5.87569 0.0734776 7.88488 3.45702ZM8.04596 3.72831L13.739 13.3157C13.8083 13.4324 13.842 13.5661 13.8346 13.7008C13.7407 15.3999 13.5009 16.8887 13.3418 17.7344C13.2662 18.1358 12.8503 18.3715 12.454 18.2369C11.6172 17.9527 10.1627 17.416 8.59372 16.6428C8.46993 16.5818 8.3675 16.4865 8.29812 16.3697L2.60516 6.78248L8.04596 3.72831Z"
                      stroke="white"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handleImageUpload(e.target.files[0])
                  }
                />
                {uploading && (
                  <p className="mt-2 text-center text-sm text-gray-600">
                    Subiendo imagen…
                  </p>
                )}
              </>
            )}
          </div>

          <div className="ml-4">
            <h2 className="text-[19px] font-medium text-gray-800">
              {profile.firstName} {profile.lastName}
              {' - '}
              <span className="text-[14px] font-normal text-[#666666]">
                {roleLabels[profile.role] ?? profile.role}
              </span>
            </h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>

        <nav className="mx-6 mt-6 flex w-[804px] border-b">
          <Link
            href="/profile"
            className={`px-12 py-4 font-normal transition ${
              !isSecurity
                ? 'border-b-2 border-blue-600 font-medium text-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Datos Personales
          </Link>
          <Link
            href="/profile/security"
            className={`px-12 py-4 font-normal transition ${
              isSecurity
                ? 'border-b-2 border-blue-600 text-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Cambiar Contraseña
          </Link>
        </nav>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
