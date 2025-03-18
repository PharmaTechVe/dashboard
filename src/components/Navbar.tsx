'use client';
import React from 'react';
import { BellIcon, QueueListIcon } from '@heroicons/react/24/outline';
import Avatar from '@/components/Avatar';
import SearchBar from '@/components/SearchBar';
import { Colors } from '@/styles/styles';

export default function AdminNavBar() {
  const handleSearch = (query: string) => {
    console.log('Buscando:', query);
  };

  return (
    <nav className="flex h-20 items-center justify-between bg-white px-4 py-2">
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
          inputPlaceholder="Search"
          disableDropdown
        />
      </div>

      {/* Íconos + Datos de usuario */}
      <div className="ml-4 flex items-center gap-6">
        {/* Ejemplo de iconos (lista, notificaciones, etc.) */}
        <QueueListIcon className="h-6 w-6 cursor-pointer text-gray-700" />
        <BellIcon className="h-6 w-6 cursor-pointer text-gray-700" />

        {/* Datos de usuario (texto + email) */}
        <div className="flex flex-col items-start">
          <span className="font-semibold text-gray-700">Utilitis</span>
          <span className="text-sm text-gray-500">fran@pharmatech.com</span>
        </div>

        {/* Avatar */}
        <Avatar
          name="John Doe"
          size={40}
          withDropdown={true}
          dropdownOptions={[
            { label: 'Perfil', route: '/profile' },
            { label: 'Salir', route: '/login' },
          ]}
        />
      </div>
    </nav>
  );
}
