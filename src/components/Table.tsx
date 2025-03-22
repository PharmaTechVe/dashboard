import React, { useState } from 'react';
import { PencilSquareIcon, EyeIcon } from '@heroicons/react/24/solid';
import { Colors } from '@/styles/styles';
import CheckButton from './CheckButton';

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  description?: string;
  customColors?: {
    headerBg?: string;
    headerText?: string;
    rowBorder?: string;
  };
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  onSelect?: (selected: T[]) => void;
  pagination?: PaginationProps; // <-- Nueva propiedad
}

const Table = <T,>({
  data,
  columns,
  title,
  description,
  customColors,
  onEdit,
  onView,
  onSelect,
  pagination,
}: TableProps<T>) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Lógica de selección (no se altera)
  const isAllSelected = data.length > 0 && selectedRows.length === data.length;

  const toggleSelectAll = () => {
    let newSelected: number[] = [];
    if (!isAllSelected) {
      newSelected = data.map((_, index) => index);
    }
    setSelectedRows(newSelected);
    if (onSelect) {
      onSelect(newSelected.map((i) => data[i]));
    }
  };

  const toggleSelectRow = (index: number) => {
    let newSelected: number[] = [];
    if (selectedRows.includes(index)) {
      newSelected = selectedRows.filter((i) => i !== index);
    } else {
      newSelected = [...selectedRows, index];
    }
    setSelectedRows(newSelected);
    if (onSelect) {
      onSelect(newSelected.map((i) => data[i]));
    }
  };

  // Lógica de paginación:
  // Si no hay `pagination`, mostramos todos los datos.
  // Si hay paginación, calculamos el subset correspondiente a la página actual.
  let displayedData = data;
  if (pagination) {
    const { currentPage, itemsPerPage } = pagination;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    displayedData = data.slice(startIndex, endIndex);
  }

  return (
    <div className="w-full overflow-hidden rounded-lg shadow-lg">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      {description && <p className="text-sm text-gray-600">{description}</p>}

      <table className="w-full border-collapse">
        <thead
          className={`${customColors?.headerBg || 'bg-gray-200'} ${
            customColors?.headerText || 'text-black'
          }`}
        >
          <tr>
            <th className="flex items-center justify-center border px-4 py-2.5">
              <CheckButton
                checked={isAllSelected}
                onChange={toggleSelectAll}
                strokeColor={Colors.iconWhite}
                filled={Colors.iconWhite}
              />
            </th>
            {columns.map((column) => (
              <th key={String(column.key)} className="border px-4 py-2">
                {column.label}
              </th>
            ))}
            {(onEdit || onView) && <th className="border px-4 py-2" />}
          </tr>
        </thead>

        <tbody>
          {displayedData.map((item, index) => {
            const globalIndex = pagination
              ? (pagination.currentPage - 1) * pagination.itemsPerPage + index
              : index;

            const isSelected = selectedRows.includes(globalIndex);

            return (
              <tr
                key={globalIndex}
                className={`${customColors?.rowBorder || 'border-gray-200'} border-b ${
                  isSelected ? 'bg-[#D4D4D8]' : 'bg-white'
                }`}
              >
                <td className="mt-[10px] flex items-center justify-center">
                  <CheckButton
                    checked={isSelected}
                    onChange={() => toggleSelectRow(globalIndex)}
                    strokeColor={Colors.primary}
                  />
                </td>
                {columns.map((column) => (
                  <td key={String(column.key)} className="border px-4 py-2">
                    {column.render
                      ? column.render(item)
                      : String(item[column.key])}
                  </td>
                ))}
                {(onEdit || onView) && (
                  <td className="flex items-center justify-center space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="flex items-center justify-center"
                        style={{
                          color: Colors.primary,
                          border: 'none',
                          background: 'transparent',
                        }}
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                        <span className="ml-1">Editar</span>
                      </button>
                    )}
                    {onView && (
                      <button
                        onClick={() => onView(item)}
                        className="flex items-center focus:outline-none"
                        style={{
                          color: Colors.primary,
                          border: 'none',
                          background: 'transparent',
                        }}
                      >
                        <EyeIcon className="h-5 w-5" />
                        <span className="ml-1">Ver</span>
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {pagination && (
        <div className="mt-4 flex items-center justify-between px-2">
          <span className="text-sm">
            Se muestran del{' '}
            <strong>
              {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
            </strong>{' '}
            al{' '}
            <strong>
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                data.length,
              )}
            </strong>{' '}
            de <strong>{data.length}</strong> resultados
          </span>

          {pagination.onItemsPerPageChange && (
            <div className="flex items-center space-x-2">
              <span className="text-sm">Items por página:</span>
              <select
                className="rounded border px-2 py-1 text-sm"
                value={pagination.itemsPerPage}
                onChange={(e) =>
                  pagination.onItemsPerPageChange?.(Number(e.target.value))
                }
              >
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          )}

          <div className="flex items-center space-x-1">
            <button
              className="rounded border px-2 py-1 text-sm"
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              disabled={pagination.currentPage === 1}
            >
              &lt;
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => pagination.onPageChange(page)}
                  className={`rounded border px-2 py-1 text-sm ${
                    page === pagination.currentPage
                      ? 'bg-blue-200 font-semibold'
                      : ''
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              className="rounded border px-2 py-1 text-sm"
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              disabled={pagination.currentPage === pagination.totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
