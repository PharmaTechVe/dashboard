'use client';

import React, { useEffect, useState } from 'react';
import { BellIcon, QueueListIcon } from '@heroicons/react/24/outline';
import Avatar from '@/components/Avatar';
import SearchBar from '@/components/SearchBar';
import { Colors } from '@/styles/styles';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/sdkConfig';

interface AdminProfile {
  name: string;
  email: string;
  profile: {
    profilePicture: string;
  };
}

export default function AdminNavBar() {
  const { token, user } = useAuth();
  const [userData, setUserData] = useState<AdminProfile | null>(null);

  const handleSearch = (query: string) => {
    console.log('Buscando:', query);
  };

  useEffect(() => {
    if (!token || !user?.sub) {
      setUserData(null);
      return;
    }

    (async () => {
      try {
        const profile = await api.user.getProfile(user.sub, token);

        // Adaptar el perfil a nuestro modelo esperado
        const adaptedProfile: AdminProfile = {
          name: `${profile.firstName} ${profile.lastName}`,
          email: profile.email,
          profile: {
            profilePicture: profile.profile.profilePicture,
          },
        };

        setUserData(adaptedProfile);
      } catch (err) {
        console.error('Error al obtener perfil del admin:', err);
        setUserData(null);
      }
    })();
  }, [token, user]);

  if (!token || !userData) return null;

  return (
    <nav className="flex h-20 items-center justify-between bg-white px-4 py-2 shadow-md">
      {/* Barra de búsqueda */}
      <div className="max-w-xl flex-1">
        <SearchBar
          onSearch={handleSearch}
          width="100%"
          height="40px"
          borderRadius="8px"
          backgroundColor="#FFFFFF"
          textColorDrop={Colors.textMain}
          textplaceholderColor={Colors.placeholder}
          inputPlaceholder="Buscar en el panel"
          disableDropdown
        />
      </div>

      {/* Íconos + Usuario */}
      <div className="ml-4 flex items-center gap-6">
        <QueueListIcon className="h-6 w-6 cursor-pointer text-gray-700" />
        <BellIcon className="h-6 w-6 cursor-pointer text-gray-700" />

        <div className="flex flex-col items-start text-sm">
          <span className="font-semibold text-gray-700">
            {userData.name || 'Admin'}
          </span>
          <span className="text-sm text-gray-500">{userData.email}</span>
        </div>

        <Avatar
          name={userData.name}
          imageUrl={userData.profile.profilePicture}
          size={40}
          withDropdown={true}
          dropdownOptions={[
            { label: 'Perfil', route: '/admin/profile' },
            // "Cerrar sesión" se añade automáticamente desde el componente Avatar si hay token
          ]}
        />
      </div>
    </nav>
  );
}
