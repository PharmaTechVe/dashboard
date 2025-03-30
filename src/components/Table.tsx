'use client';

import React, { useState } from 'react';
import {
  PencilSquareIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/solid';
import { Colors } from '@/styles/styles';
import CheckButton from './CheckButton';
import Pagination from './Pagination';

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
  onSelect?: (selected: T[]) => void;
  pagination?: PaginationProps;
  expandableRows?: boolean;
  rowDropdownComponent?: (item: T, index: number) => React.ReactNode;
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
  expandableRows = false,
  rowDropdownComponent,
}: TableProps<T>) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;

  const toggleSelectAll = () => {
    const newSelected = isAllSelected ? [] : data.map((_, i) => i);
    setSelectedRows(newSelected);
    if (onSelect) {
      onSelect(newSelected.map((i) => data[i]));
    }
  };

  const toggleSelectRow = (index: number) => {
    let newSelected: number[];
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

  const toggleExpandRow = (index: number) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <div className="w-full overflow-x-auto">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      {description && <p className="text-sm text-gray-600">{description}</p>}

      <table className="w-full border-collapse">
        <thead
          className={`${customColors?.headerBg || 'bg-gray-200'} ${
            customColors?.headerText || 'text-gray'
          }`}
        >
          <tr>
            <th className="w-12 px-4 py-2 text-center">
              <CheckButton
                checked={isAllSelected}
                onChange={toggleSelectAll}
                strokeColor={Colors.iconWhite}
                filled={Colors.iconWhite}
              />
            </th>

            {expandableRows && <th className="w-10" />}

            {columns.map((column) => (
              <th key={column.key} className="px-4 py-2 text-left">
                {column.label}
              </th>
            ))}

            {(onEdit || onView) && (
              <th className="px-4 py-2 text-center"></th> // columna de acciones sin texto
            )}
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => {
            const isSelected = selectedRows.includes(index);
            const isExpanded = expandedRows.includes(index);

            return (
              <React.Fragment key={index}>
                <tr
                  className={`${
                    customColors?.rowBorder || 'border-gray-200'
                  } border-b bg-white`}
                >
                  <td className="text-gray px-4 py-2 text-center">
                    <CheckButton
                      checked={isSelected}
                      onChange={() => toggleSelectRow(index)}
                      strokeColor={Colors.stroke}
                    />
                  </td>

                  {expandableRows && (
                    <td
                      className="text-center"
                      style={{ color: Colors.textMain }}
                    >
                      <button onClick={() => toggleExpandRow(index)}>
                        {isExpanded ? (
                          <ChevronUpIcon className="h-5 w-5 text-gray-600" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                        )}
                      </button>
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
                      <div className="flex items-center justify-center gap-x-6 px-2">
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

                {expandableRows && isExpanded && rowDropdownComponent && (
                  <tr className="bg-gray-50">
                    <td
                      colSpan={
                        columns.length +
                        1 + // checkbox
                        (expandableRows ? 1 : 0) + // expand arrow
                        (onEdit || onView ? 1 : 0) // acciones
                      }
                    >
                      {rowDropdownComponent(item, index)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
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
