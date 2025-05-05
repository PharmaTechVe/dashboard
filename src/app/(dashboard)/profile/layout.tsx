// src/app/(dashboard)/profile/layout.tsx
'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserList } from '@pharmatech/sdk';

interface ProfileLayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<UserList | null>(null);
  const path = usePathname() ?? '';
  const isSecurity = path.includes('/profile/security');

  useEffect(() => {
    if (!user?.sub || !token) return;
    (async () => {
      try {
        const res = await (
          await import('@/lib/sdkConfig')
        ).api.user.getProfile(user.sub, token);
        setProfile(res);
      } catch (err) {
        console.error('Error cargando perfil:', err);
      }
    })();
  }, [user, token]);

  if (!profile) {
    return <p className="p-6 text-center">Cargando perfil…</p>;
  }

  return (
    <div className="mt-12 flex justify-center">
      <div className="relative h-[690px] w-[906px] rounded-[16px] bg-white p-8 shadow-lg">
        <div className="mx-6 my-2 flex items-center pb-0">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md">
            {profile.profile?.profilePicture ? (
              <Image
                src={profile.profile.profilePicture}
                alt="Avatar"
                width={96}
                height={96}
                className="object-cover"
              />
            ) : (
              <Image
                src="/images/avatar.png"
                alt="Avatar"
                width={96}
                height={96}
                className="object-cover"
              />
            )}
          </div>
          <div className="ml-4">
            <h2 className="text-[19px] font-medium text-gray-800">
              {profile.firstName} {profile.lastName}
              {' - '}
              <span className="text-[14px] font-normal">{profile.role}</span>
            </h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="mx-6 mt-6 flex w-[804px] border-b">
          <Link
            href="/profile"
            className={`px-12 py-4 font-normal transition ${
              !isSecurity
                ? 'border-b-2 border-blue-600 text-gray-800'
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

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
