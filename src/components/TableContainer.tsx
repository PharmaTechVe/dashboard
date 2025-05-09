'use client';

import React, { useState } from 'react';
import ActionsTable from '@/components/ActionsTable';
import Table, { Column } from '@/components/Table';
import Dropdown from '@/components/Dropdown';
import { Colors } from '@/styles/styles';

interface TableContainerProps<T> {
  title: string;
  dropdownComponent?: React.ReactNode;
  onAddClick: () => void;
  onSearch: (query: string) => void;
  tableData: T[];
  tableColumns: Column<T>[];
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  onSelect?: (selected: T[]) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (newItemsPerPage: number) => void;
    itemsPerPageOptions: number[];
  };
  customColors?: {
    headerBg?: string;
    headerText?: string;
    rowBorder?: string;
  };
  addButtonText?: string;
}

export default function TableContainer<T>({
  title,
  dropdownComponent,
  onAddClick,
  onSearch,
  tableData,
  tableColumns,
  onEdit,
  onView,
  onSelect,
  pagination,
  customColors,
  addButtonText = 'Agregar Producto',
}: TableContainerProps<T>) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownItemHeight = 35; // px
  const dropdownOptionsCount = pagination.itemsPerPageOptions.length;
  const dropdownHeight = isDropdownOpen
    ? `${dropdownItemHeight * dropdownOptionsCount + 1.5 * 35}px`
    : '35px';

  return (
    <div className="w-full min-w-[405px] rounded-lg bg-white p-4 shadow-md">
      {/* Título + Dropdown */}
      <div className="mb-8 mt-[24px] flex items-center justify-between">
        <h2
          className="mb-4 ml-6 text-[24px] font-normal"
          style={{ color: Colors.textMain }}
        >
          {title}
        </h2>
        <div>{dropdownComponent}</div>
      </div>

      {/* Contenedor para ActionsTable */}
      <div className="mb-4">
        <ActionsTable
          addButtonText={addButtonText}
          onAddClick={onAddClick}
          onSearch={onSearch}
        />
      </div>

      {/* Tabla */}
      <div className="mb-0">
        <Table
          data={tableData}
          columns={tableColumns}
          customColors={{
            headerBg: customColors?.headerBg || 'bg-[#2D397B]',
            headerText: customColors?.headerText || 'text-white',
            rowBorder: customColors?.rowBorder || 'border-gray-200',
          }}
          onEdit={onEdit}
          onView={onView}
          onSelect={onSelect}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalItems: pagination.totalItems,
            itemsPerPage: pagination.itemsPerPage,
            onPageChange: pagination.onPageChange,
            onItemsPerPageChange: pagination.onItemsPerPageChange,
          }}
        />
      </div>

      {/* Dropdown de ítems por página */}
      <div className="mt-[-38px] flex justify-center">
        <Dropdown
          placeholder="Página"
          width="125px"
          height={dropdownHeight}
          items={pagination.itemsPerPageOptions.map((num) => num.toString())}
          onChange={(val) => pagination.onItemsPerPageChange(Number(val))}
          onToggle={setIsDropdownOpen}
        />
      </div>
    </div>
  );
}
