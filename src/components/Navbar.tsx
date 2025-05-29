'use client';

import React, { useEffect, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/context/AuthContext';
import Loader from './Loader';

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

  useEffect(() => {
    if (!token || !user?.sub) {
      setUserData(null);
      return;
    }

    (() => {
      const adaptedProfile: AdminProfile = {
        name: user.name,
        email: user.email,
        profile: {
          profilePicture: user.profilePicture || '',
        },
      };
      setUserData(adaptedProfile);
    })();
  }, [token, user]);

  if (!token || !userData)
    return (
      <div className="h-18 flex items-end justify-end bg-white px-4 py-2 shadow-md">
        <div className="ml-4 flex items-center gap-6">
          <BellIcon className="h-6 w-6 cursor-pointer text-gray-700" />
          <div className="flex flex-col items-start text-sm">
            <span className="font-semibold text-gray-700">Cargando...</span>
          </div>
          <Loader />
        </div>
      </div>
    );

  return (
    <nav className="h-18 flex items-end justify-end bg-white px-4 py-2 shadow-md">
      {/* Íconos + Usuario */}
      <div className="ml-4 flex items-center gap-6">
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
          dropdownOptions={[{ label: 'Perfil', route: '/profile' }]}
        />
      </div>
    </nav>
  );
}
