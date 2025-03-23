import React, { useState } from 'react';
import {
  PencilSquareIcon,
  EyeIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/solid';
import { Colors, FontSizes } from '@/styles/styles';
import CheckButton from './CheckButton';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  itemsPerPageDropdown?: React.ReactNode;
  itemsPerPageOptions?: number[];
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
  pagination?: PaginationProps;
}

function getValueSafely<T>(item: T, key: string): unknown {
  if (Object.prototype.hasOwnProperty.call(item, key)) {
    return item[key as keyof T];
  }
  return undefined;
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

  let displayedData = data;
  if (pagination) {
    const { currentPage, itemsPerPage } = pagination;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    displayedData = data.slice(startIndex, endIndex);
  }

  return (
    <div className="w-full overflow-x-auto">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      {description && <p className="text-sm text-gray-600">{description}</p>}

      <table className="w-full border-collapse">
        <thead
          className={`${customColors?.headerBg || 'bg-gray-200'} ${
            customColors?.headerText || 'text-black'
          }`}
        >
          <tr>
            <th className="px-4 py-2 text-center">
              <CheckButton
                checked={isAllSelected}
                onChange={toggleSelectAll}
                strokeColor={Colors.iconWhite}
                filled={Colors.iconWhite}
              />
            </th>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-2 text-left">
                {column.label}
              </th>
            ))}
            {(onEdit || onView) && (
              <th className="px-4 py-2 text-center">Acciones</th>
            )}
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
                className={`${
                  customColors?.rowBorder || 'border-gray-200'
                } border-b bg-white`}
              >
                <td className="px-4 py-2 text-center">
                  <CheckButton
                    checked={isSelected}
                    onChange={() => toggleSelectRow(globalIndex)}
                    strokeColor={Colors.stroke}
                  />
                </td>

                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-2 text-left">
                    {column.render
                      ? column.render(item)
                      : String(getValueSafely(item, column.key) ?? '')}
                  </td>
                ))}

                {(onEdit || onView) && (
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center space-x-4">
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
                          <PencilSquareIcon className="h-4 w-4" />
                          <span className="ml-1">Editar</span>
                        </button>
                      )}
                      {onView && (
                        <button
                          onClick={() => onView(item)}
                          className="flex items-center justify-center"
                          style={{
                            color: Colors.textMain,
                            border: 'none',
                            background: 'transparent',
                          }}
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span className="ml-1">Ver</span>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {pagination && (
        <div className="mt-4 flex flex-col items-center justify-between space-y-2 px-2 md:flex-row md:space-y-0">
          <span
            className="text-sm"
            style={{
              color: Colors.textMain,
              fontSize: FontSizes.b1.size,
            }}
          >
            Se muestran del{' '}
            <span>
              {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
            </span>{' '}
            al{' '}
            <span>
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                data.length,
              )}
            </span>{' '}
            de <span>{data.length}</span> resultados
          </span>

          <div className="flex h-[35px] overflow-hidden rounded-md border border-gray-300">
            <button
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              disabled={pagination.currentPage === 1}
              className={`flex h-[35px] w-[35px] items-center justify-center text-sm ${
                pagination.currentPage === 1
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .slice(0, 5)
              .map((page, idx) => (
                <button
                  key={page}
                  onClick={() => pagination.onPageChange(page)}
                  className={`flex h-[35px] w-[35px] items-center justify-center text-sm ${
                    idx !== 0 ? 'border-l border-gray-300' : ''
                  } ${
                    page === pagination.currentPage
                      ? 'border border-cyan-300 bg-indigo-50 text-indigo-900'
                      : 'bg-white text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

            <button
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              disabled={pagination.currentPage === pagination.totalPages}
              className={`flex h-[35px] w-[35px] items-center justify-center border-l border-gray-300 text-sm ${
                pagination.currentPage === pagination.totalPages
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
