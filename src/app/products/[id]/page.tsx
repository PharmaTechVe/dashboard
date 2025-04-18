'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import ModalConfirm from '@/components/ModalConfirm';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast, ToastContainer } from 'react-toastify';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';

interface Manufacturer {
  id: string;
  name: string;
  description: string;
  country: { name: string };
}

interface GenericProduct {
  id: string;
  name: string;
  genericName: string;
  description?: string;
  priority: number;
  manufacturer: Manufacturer;
}

export default function GenericProductDetailPage() {
  const params = useParams();
  const id = params?.id && typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const [product, setProduct] = useState<GenericProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

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
        const data: GenericProduct = await api.genericProduct.getById(id);
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

            <div>
              <label className="block text-[16px] font-medium text-gray-600">
                Nombre
              </label>
              <input
                className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                value={product.name}
                readOnly
              />
            </div>

            <div>
              <label className="block text-[16px] font-medium text-gray-600">
                Fabricante
              </label>
              <input
                className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                value={product.manufacturer.name}
                readOnly
              />
            </div>

            <div>
              <label className="block text-[16px] font-medium text-gray-600">
                Nombre genérico
              </label>
              <input
                className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px] focus:border-gray-200 focus:outline-none focus:ring-0"
                value={product.genericName}
                readOnly
              />
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
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
