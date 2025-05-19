'use client';

import React from 'react';
import { PencilSquareIcon, EyeIcon } from '@heroicons/react/24/solid';
import { Colors } from '@/styles/styles';
import CheckButton from './CheckButton';
import Pagination from './Pagination';
import Loader from './Loader';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
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
  pagination?: PaginationProps;
  selectedRows: T[];
  setSelectedRows: (rows: T[]) => void;
  isLoading?: boolean;
  showSelector?: boolean;
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
  pagination,
  selectedRows,
  setSelectedRows,
  isLoading = false,
  showSelector = true,
}: TableProps<T>) => {
  const isAllSelected = data.length > 0 && selectedRows.length === data.length;

  const toggleSelectAll = () => {
    const newSelected = isAllSelected ? [] : data;
    setSelectedRows(newSelected);
  };

  const toggleSelectRow = (item: T) => {
    let newSelected: T[];
    if (selectedRows.includes(item)) {
      newSelected = selectedRows.filter((i) => i !== item);
    } else {
      newSelected = [...selectedRows, item];
    }
    setSelectedRows(newSelected);
  };

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
            {showSelector && (
              <th className="px-4 py-2 text-center">
                <CheckButton
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  strokeColor={Colors.stroke}
                  filled={Colors.iconWhite}
                />
              </th>
            )}
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
          {isLoading ? (
            <tr>
              <td colSpan={columns.length + 2}>
                <div className="flex h-40 items-center justify-center">
                  <Loader />
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const isSelected = selectedRows.includes(item);
              return (
                <tr
                  key={index}
                  className={`${
                    customColors?.rowBorder || 'border-gray-200'
                  } border-b bg-white`}
                >
                  {' '}
                  {showSelector && (
                    <td className="px-4 py-2 text-center">
                      <CheckButton
                        checked={isSelected}
                        onChange={() => toggleSelectRow(item)}
                        strokeColor={Colors.stroke}
                      />
                    </td>
                  )}
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
            })
          )}
        </tbody>
      </table>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          itemsPerPage={pagination.itemsPerPage}
          totalItems={pagination.totalItems}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
};

export default Table;
