'use client';

//import { useState } from 'react';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import TableContainer from '@/components/TableContainer';
import RowTable, { RowColumn } from '@/components/RowTable';
import { Column } from '@/components/Table';
import Dropdown from '@/components/Dropdown';
import { CubeIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

interface Presentation {
  image: string;
  nombre: string;
  precio: string;
  stock: number;
  fechaStock: string;
}

interface Product {
  id: string;
  nombre: string;
  categoria: string;
  precio: string;
  stock: number;
  presentaciones: Presentation[];
}

const productos: Product[] = [
  {
    id: '001',
    nombre: 'Acetaminofén 500mg x 10 tabletas',
    categoria: 'Medicamentos',
    precio: '$5.00',
    stock: 125,
    presentaciones: [
      {
        image: '/images/presentacion1.png',
        nombre: 'Caja x 10',
        precio: '$5.50',
        stock: 150,
        fechaStock: '17/05/2025',
      },
      {
        image: '/images/presentacion2.png',
        nombre: 'Caja x 20',
        precio: '$9.90',
        stock: 85,
        fechaStock: '25/06/2025',
      },
    ],
  },
];

const columns: Column<Product>[] = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'categoria', label: 'Categoría' },
  { key: 'precio', label: 'Precio' },
  { key: 'stock', label: 'Stock' },
];

const subColumns: RowColumn<Presentation>[] = [
  {
    key: 'icon',
    render: () => <CubeIcon className="h-5 w-5 text-gray-500" />,
  },
  {
    key: 'image',
    render: (item) => (
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded border border-gray-200">
        <Image
          src={item.image}
          alt={item.nombre}
          width={48}
          height={48}
          className="h-full w-full object-contain"
        />
      </div>
    ),
  },
  {
    key: 'nombre',
    render: (item) => (
      <span className="text-sm font-medium">{item.nombre}</span>
    ),
  },
  {
    key: 'precio',
    render: (item) => <span>{item.precio}</span>,
  },
  {
    key: 'stock',
    render: (item) => <span>{item.stock} unidades</span>,
  },
  {
    key: 'fechaStock',
    render: (item) => (
      <span className="text-sm text-gray-500">{item.fechaStock}</span>
    ),
  },
  {
    key: 'detalles',
    render: () => (
      <div className="flex cursor-pointer items-center justify-end text-blue-600">
        <span className="mr-1">Detalles</span>
        <ArrowRightIcon className="h-4 w-4" />
      </div>
    ),
  },
];

export default function Page() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-100 p-4">
          <TableContainer
            title="Lista de Productos"
            dropdownComponent={
              <Dropdown
                title="Categoría"
                items={[
                  'Todos',
                  'Antibiótico',
                  'Analgésico',
                  'Gastrointestinal',
                ]}
                onChange={(val) => console.log('Filtrar por:', val)}
              />
            }
            onAddClick={() => console.log('Agregar')}
            onSearch={(query) => console.log('Buscar:', query)}
            tableData={productos}
            tableColumns={columns}
            onEdit={(item) => console.log('Editar', item)}
            onView={(item) => console.log('Ver', item)}
            pagination={{
              currentPage: 1,
              totalPages: 1,
              totalItems: productos.length,
              itemsPerPage: 10,
              onPageChange: () => {},
              onItemsPerPageChange: () => {},
              itemsPerPageOptions: [5, 10, 20],
            }}
            expandableRows
            rowDropdownComponent={(item) => (
              <RowTable data={item.presentaciones} columns={subColumns} />
            )}
          />
        </main>
      </div>
    </div>
  );
}
