'use client';

import { useEffect, useState } from 'react';
import { PharmaTech } from '@pharmatech/sdk';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import TableContainer from '@/components/TableContainer';
import RowTable, { RowColumn } from '@/components/RowTable';
import { Column } from '@/components/Table';
import Dropdown from '@/components/Dropdown';
import {
  ChevronRightIcon,
  Square3Stack3DIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Colors } from '@/styles/styles';
import Image from 'next/image';

interface Presentation {
  id: string;
  nombre: string;
  precio: string;
  stock: number;
  fechaStock: string;
  image?: string;
}

interface ProductItem {
  id: string;
  nombre: string;
  categoria: string;
  presentaciones: Presentation[];
  stockTotal: number;
  precioMin: string;
}

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return (
    sessionStorage.getItem('pharmatechToken') ||
    localStorage.getItem('pharmatechToken')
  );
};

export default function Page() {
  const [productos, setProductos] = useState<ProductItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = async (page: number, limit: number) => {
    const token = getToken();
    if (!token) return;

    const pharmaTech = PharmaTech.getInstance(true);
    const response = await pharmaTech.product.getProducts({ page, limit });

    const grouped: Record<string, ProductItem> = {};

    response.results.forEach((item) => {
      const id = item.id.slice(0, 6);
      const precio = item.price;
      const stock = item.presentation.quantity;

      if (!grouped[id]) {
        grouped[id] = {
          id,
          nombre: item.product.name,
          categoria: item.product.categories[0]?.name || '-',
          presentaciones: [],
          stockTotal: 0,
          precioMin: `$${precio.toFixed(2)}`,
        };
      } else {
        const currentMin = parseFloat(grouped[id].precioMin.replace('$', ''));
        if (precio < currentMin) {
          grouped[id].precioMin = `$${precio.toFixed(2)}`;
        }
      }

      grouped[id].stockTotal += stock;

      grouped[id].presentaciones.push({
        id: item.id,
        nombre: item.presentation.name,
        precio: `$${precio.toFixed(2)}`,
        stock,
        fechaStock: '-',
        image: item.product.images?.[0]?.url || '/placeholder.png',
      });
    });

    setProductos(Object.values(grouped));
    setTotalItems(response.count);
  };

  useEffect(() => {
    fetchData(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const columns: Column<ProductItem>[] = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoria', label: 'Categoría' },
    {
      key: 'stockTotal',
      label: 'Stock',
      render: (item) => (
        <span className="text-sm text-gray-600">{item.stockTotal}</span>
      ),
    },
    {
      key: 'precioMin',
      label: 'Precio',
      render: (item) => (
        <span className="text-sm text-gray-600">{item.precioMin}</span>
      ),
    },
  ];

  const textClass = 'text-sm font-medium text-gray-600';
  const iconTextClass = 'flex items-center gap-2 text-sm text-gray-500';
  const imageWrapperClass =
    'flex h-12 w-12 items-center justify-center overflow-hidden rounded border border-transparent';

  const subColumns: RowColumn<Presentation>[] = [
    {
      key: 'image',
      render: (item) => (
        <div className={imageWrapperClass}>
          <Image
            src={item.image || '/placeholder.png'}
            alt={item.nombre}
            width={48}
            height={48}
            className="h-full w-full object-contain"
          />
        </div>
      ),
    },
    {
      key: 'id',

      render: (item) => (
        <span className={textClass}>{item.id.slice(0, 6)}</span>
      ),
    },
    {
      key: 'nombre',

      render: (item) => <span className={textClass}>{item.nombre}</span>,
    },
    {
      key: 'precio',

      render: (item) => <span className={textClass}>{item.precio}</span>,
    },
    {
      key: 'stock',

      render: (item) => (
        <span className={iconTextClass}>
          <Square3Stack3DIcon className="h-5 w-5" />
          {item.stock} unidades
        </span>
      ),
    },
    {
      key: 'fechaStock',

      render: (item) => (
        <span className={iconTextClass}>
          <CalendarIcon className="h-5 w-5" />
          {item.fechaStock}
        </span>
      ),
    },
    {
      key: 'detalles',
      render: () => (
        <div
          className="flex cursor-pointer items-center justify-end gap-1"
          style={{ color: Colors.primaryVariant }}
        >
          <span>Detalles</span>
          <ChevronRightIcon className="h-4 w-4" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-gray-100 p-4">
          <TableContainer
            title="Lista de Presentaciones"
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
              currentPage,
              totalPages: Math.ceil(totalItems / itemsPerPage),
              totalItems,
              itemsPerPage,
              onPageChange: setCurrentPage,
              onItemsPerPageChange: setItemsPerPage,
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
