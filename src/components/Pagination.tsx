'use client';

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { Colors, FontSizes } from '@/styles/styles';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
}: PaginationProps) {
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  /**
   * Calcula el listado de botones a mostrar.
   * Si totalPages <= 7 se muestran todos los números.
   * Si > 7 se implementa la lógica de ellipsis:
   *
   * - Si la página actual es menor o igual a 4:
   *   [1, 2, 3, 4, 5, '...', totalPages]
   *
   * - Si la página actual está en las últimas 4 páginas:
   *   [1, '...', totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages]
   *
   * - En caso intermedio:
   *   [1, '...', currentPage-1, currentPage, currentPage+1, '...', totalPages]
   */
  const getPageNumbers = () => {
    let pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages = [1, 2, 3, 4, 5, '...', totalPages];
      } else if (currentPage >= totalPages - 3) {
        pages = [
          1,
          '...',
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        pages = [
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages,
        ];
      }
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="mt-4 flex flex-col items-center justify-between space-y-2 px-2 md:flex-row md:space-y-0">
      <span
        className="text-sm"
        style={{
          color: Colors.textMain,
          fontSize: FontSizes.b1.size,
        }}
      >
        Se muestran del <span>{startIndex}</span> al <span>{endIndex}</span> de{' '}
        <span>{totalItems}</span> resultados
      </span>

      <div className="flex h-[35px] overflow-hidden rounded-md border border-gray-300">
        {/* Botón de página anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex h-[35px] w-[35px] items-center justify-center text-sm ${
            currentPage === 1
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {/* Botones de páginas */}
        {pageNumbers.map((page, idx) => {
          if (page === '...') {
            return (
              <button
                key={`ellipsis-${idx}`}
                onClick={() => {
                  /**
                   * Al hacer clic en el botón de ellipsis se salta un grupo.
                   * Si el ellipsis está a la izquierda (idx === 1), se retrocede un salto,
                   * y si está a la derecha (último pero uno), se avanza.
                   */
                  const ellipsisIndex = idx;
                  if (ellipsisIndex === 1) {
                    // Retornar hacia atrás, pero sin quedar por debajo de la página 2.
                    const jumpPage = Math.max(2, currentPage - 3);
                    onPageChange(jumpPage);
                  } else {
                    // Avanzar, pero sin pasar de totalPages - 1.
                    const jumpPage = Math.min(totalPages - 1, currentPage + 3);
                    onPageChange(jumpPage);
                  }
                }}
                className="flex h-[35px] w-[35px] items-center justify-center border-l border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-100"
              >
                {page}
              </button>
            );
          }
          return (
            <button
              key={page}
              onClick={() => onPageChange(Number(page))}
              className={`flex h-[35px] w-[35px] items-center justify-center text-sm ${
                Number(page) === currentPage
                  ? 'border border-cyan-300 bg-indigo-50 text-indigo-900'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              } ${idx !== 0 ? 'border-l border-gray-300' : ''}`}
            >
              {page}
            </button>
          );
        })}

        {/* Botón de página siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex h-[35px] w-[35px] items-center justify-center border-l border-gray-300 text-sm ${
            currentPage === totalPages
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
