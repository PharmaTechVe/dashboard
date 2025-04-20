'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import ModalConfirm from '@/components/ModalConfirm';
import { Colors } from '@/styles/styles';
import type {
  GenericProductResponse,
  ProductPresentationResponse,
} from '@pharmatech/sdk';
import { api } from '@/lib/sdkConfig';
import { toast, ToastContainer } from 'react-toastify';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { Column } from '@/components/Table';
import TableContainer from '@/components/TableContainer';

type ProductPresentationItem = ProductPresentationResponse;
export default function GenericProductDetailPage() {
  const params = useParams();
  const id = params?.id && typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [product, setProduct] = useState<GenericProductResponse | null>(null);
  const [presentations, setPresentations] = useState<
    ProductPresentationResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const presentationColumns: Column<ProductPresentationItem>[] = [
    {
      key: 'name',
      label: 'Presentación',
      render: (item) => item.presentation.name,
    },
    {
      key: 'price',
      label: 'Precio',
      render: (item) => `$${item.price.toFixed(2)}`,
    },
    {
      key: 'promo',
      label: 'Promo',
      render: (item) => item.promo?.name,
    },
    {
      key: 'Cant',
      label: 'Cantidad',
      render: (item) => item.presentation.quantity,
    },
    {
      key: 'UM',
      label: 'Unidad de Medida',
      render: (item) => item.presentation.measurementUnit,
    },
  ];

  const handleEditPresentation = (item: ProductPresentationItem) => {
    router.push(`/products/${id}/presentations/${item.presentation.id}/edit`);
  };

  const handleView = (item: ProductPresentationItem) => {
    router.push(`/products/${id}/presentations/${item.presentation.id}`);
  };

  const handleAdd = () => {
    router.push(`/products/${id}/presentations/new`);
  };
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken')
    );
  };

  useEffect(() => {
    async function fetchProduct() {
      const token = getToken();
      if (!token || typeof id !== 'string') return;
      try {
        const data: GenericProductResponse =
          await api.genericProduct.getById(id);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Error fetching product details.');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    async function fetchPresentations() {
      const token = getToken();
      if (!token || typeof id !== 'string') return;
      try {
        const res = await api.productPresentation.getByProductId(id);
        setPresentations(res);
        setTotalItems(res.length);
      } catch (err) {
        console.error('Error fetching presentations:', err);
      }
    }
    if (id) fetchPresentations();
  }, [id]);

  const handleEdit = () => {
    if (id) router.push(`/products/${id}/edit`);
  };

  const handleDelete = async () => {
    const token = getToken();
    if (!token || typeof id !== 'string') {
      toast.error('Error: token el token es invalido');
      return;
    }
    try {
      await api.genericProduct.delete(id, token);
      toast.success('Producto eliminado exitosamente');
      setTimeout(() => {
        router.push('/products/');
      }, REDIRECTION_TIMEOUT);
    } catch (err) {
      console.error('Error al borrar el producto:', err);
      toast.error('Error al borrar el producto');
    }
  };

  const handleCancel = () => setShowModal(false);

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Productos', href: '/products/' },
    { label: product ? product.name : 'Producto', href: '' },
  ];

  if (loading) return <p className="p-4 text-lg">Loading...</p>;
  if (error || !product)
    return <p className="p-4 text-lg">{error || 'Product not found.'}</p>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
          <div className="mx-auto mb-4 max-w-[904px]">
            <Breadcrumb items={breadcrumbItems} />
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                {product.name}
              </h1>
              <div className="flex gap-6">
                <Button
                  color={Colors.secondaryWhite}
                  paddingX={4}
                  paddingY={4}
                  textSize="16"
                  width="173px"
                  height="48px"
                  onClick={() => setShowModal(true)}
                  className="border-red-600 hover:border-red-600 hover:bg-red-50"
                  textColor={Colors.semanticDanger}
                >
                  Eliminar Producto
                </Button>
                <Button
                  color={Colors.primary}
                  paddingX={4}
                  paddingY={4}
                  textSize="16"
                  width="177px"
                  height="48px"
                  onClick={handleEdit}
                  textColor={Colors.textWhite}
                >
                  Editar Producto
                </Button>
              </div>
            </div>
          </div>
          <ModalConfirm
            isOpen={showModal}
            onClose={handleCancel}
            onConfirm={handleDelete}
            title="Eliminar Producto"
            description="¿Estás seguro de que deseas eliminar este producto? Esta acción hará que el producto deje de estar activo en el sistema"
            cancelText="Cancelar"
            confirmText="Eliminar"
            width="512px"
            height="200px"
          />
          <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-[16px] font-medium text-gray-600">
                  Nombre genérico
                </label>
                <input
                  className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                  value={product.genericName}
                  readOnly
                />
              </div>

              <div className="w-1/2">
                <label className="block text-[16px] font-medium text-gray-600">
                  Fabricante
                </label>
                <input
                  className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                  value={product.manufacturer.name}
                  readOnly
                />
              </div>
            </div>
            <div className="mt-4 flex space-x-4">
              <div className="w-1/2">
                <label className="block text-[16px] font-medium text-gray-600">
                  Nombre
                </label>
                <input
                  className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                  value={product.name}
                  readOnly
                />
              </div>
              <div className="w-1/2">
                <label className="block text-[16px] font-medium text-gray-600">
                  Prioridad
                </label>
                <input
                  type="number"
                  className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                  placeholder="Priority"
                  value={product.priority}
                  readOnly
                />
              </div>
            </div>
            <div>
              <label className="block text-[16px] font-medium text-gray-600">
                Descripción
              </label>
              <textarea
                className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                value={product.description}
                readOnly
              />
            </div>
          </div>
          <div className="mx-auto my-8 mb-4 max-w-[904px]">
            <p className="text-[16px] font-normal leading-6 text-[#393938]">
              Categoría del producto
            </p>
          </div>
          <div className="mx-auto max-w-[904px] rounded-xl bg-white px-6 py-4 pb-12 shadow-md">
            <div className="w-full">
              <label className="block text-[16px] font-medium text-gray-600">
                Categoría
              </label>
              <input
                className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                value={product.categories[0]?.name}
                readOnly
              />
            </div>
          </div>

          <div className="mx-auto max-w-[904px] rounded-xl py-8">
            <TableContainer
              title="Presentaciones"
              tableData={presentations}
              tableColumns={presentationColumns}
              onEdit={handleEditPresentation}
              onView={handleView}
              onAddClick={handleAdd}
              onSearch={(query) =>
                console.log('Buscando presentacion...:', query)
              }
              addButtonText="Agregar Presentación"
              pagination={{
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage,
                onPageChange: (page) => setCurrentPage(page),
                onItemsPerPageChange: (val) => {
                  setItemsPerPage(val);
                  setCurrentPage(1);
                },
                itemsPerPageOptions: [5, 10, 15, 20],
              }}
            />
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
