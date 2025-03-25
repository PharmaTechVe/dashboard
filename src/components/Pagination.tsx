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

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .slice(0, 5)
          .map((page, idx) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex h-[35px] w-[35px] items-center justify-center text-sm ${
                idx !== 0 ? 'border-l border-gray-300' : ''
              } ${
                page === currentPage
                  ? 'border border-cyan-300 bg-indigo-50 text-indigo-900'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}

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
