'use client';

import { useCallback, useState } from 'react';
import {
  EllipsisVerticalIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface ActionsTableProps {
  addButtonText: string;
  onAddClick?: () => void;
  onSearch?: (query: string) => void;
}

export default function ActionTable({
  addButtonText,
  onAddClick,
  onSearch,
}: ActionsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchClick = useCallback(() => {
    onSearch?.(searchTerm);
    console.log('Buscando:', searchTerm);
  }, [onSearch, searchTerm]);

  return (
    <div className="flex w-full items-center justify-between gap-4">
      {/* Botón de "Acciones" */}
      <div>
        <button
          type="button"
          className="border-stroke text-TextMain flex items-center gap-2 rounded-md border bg-white px-3 py-2 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          <EllipsisVerticalIcon className="text-TextMain h-5 w-5" />
          <span>Acciones</span>
        </button>
      </div>

      {/* Contenedor del SearchBar y botón  */}
      <div className="flex w-full items-center justify-end gap-4">
        {/* SearchBar (El que esta en  components no cumple las propiedades...) */}
        <div className="inline-flex h-[38px] w-[204px]">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-full w-[166px] rounded-l-md border border-[#DFE4EA] pl-4 text-sm text-[#666666] placeholder-[#666666] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSearchClick}
            className="flex h-full w-[38px] items-center justify-center rounded-r-md border border-l-0 border-[#DFE4EA] bg-white hover:bg-gray-50 focus:outline-none"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-[#393938]" />
          </button>
        </div>

        {/* Botón "Agregar" */}
        <button
          type="button"
          onClick={onAddClick}
          className="border-stroke text-TextMain flex items-center gap-2 rounded-md border bg-white px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          <PlusIcon className="text-TextMain h-5 w-5" />
          <span>{addButtonText}</span>
        </button>
      </div>
    </div>
  );
}
