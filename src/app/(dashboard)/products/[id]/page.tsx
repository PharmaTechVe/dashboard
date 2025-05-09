'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import ModalConfirm from '@/components/ModalConfirm';
import UploadedImage from '@/components/Image/UploadedImage';
import { Colors } from '@/styles/styles';
import type {
  GenericProductResponse,
  ProductPresentationResponse,
} from '@pharmatech/sdk';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { Column } from '@/components/Table';
import TableContainer from '@/components/TableContainer';
import { useAuth } from '@/context/AuthContext';
import Loading from '../../loading';
import Input from '@/components/Input/Input';

type ProductPresentationItem = ProductPresentationResponse;
export default function GenericProductDetailPage() {
  const params = useParams();
  const id = params?.id && typeof params.id === 'string' ? params.id : '';
  const { token } = useAuth();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [product, setProduct] = useState<GenericProductResponse | null>(null);
  const [presentations, setPresentations] = useState<
    ProductPresentationResponse[]
  >([]);
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

  useEffect(() => {
    async function fetchProduct() {
      if (!token || typeof id !== 'string') return;
      try {
        const data: GenericProductResponse =
          await api.genericProduct.getById(id);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Error fetching product details.');
      }
    }
    if (id) fetchProduct();
  }, [id, token]);

  useEffect(() => {
    async function fetchPresentations() {
      if (!token || typeof id !== 'string') return;
      try {
        const res = await api.productPresentation.getByProductId(id);
        setPresentations(res.filter((item) => item.presentation !== null));
        setTotalItems(res.length);
      } catch (err) {
        console.error('Error fetching presentations:', err);
      }
    }
    if (id) fetchPresentations();
  }, [id, token]);

  const handleEdit = () => {
    if (id) router.push(`/products/${id}/edit`);
  };

  const handleDelete = async () => {
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

  if (error || !product) return <Loading />;

  return (
    <>
      <div className="mx-auto mb-4 max-w-[904px]">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mb-6 flex items-center justify-between">
          <h1
            className="text-[28px] font-normal leading-none"
            style={{ color: Colors.textMain }}
          >
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
            <Input
              label="Nombre genérico"
              value={product.genericName}
              readViewOnly
            />
          </div>

          <div className="w-1/2">
            <Input
              label="Fabricante"
              value={product.manufacturer.name}
              readViewOnly
            />
          </div>
        </div>
        <div className="mt-4 flex space-x-4">
          <div className="w-1/2">
            <Input label="Nombre" value={product.name} readViewOnly />
          </div>
          <div className="w-1/2">
            <Input
              label="Prioridad"
              placeholder="Priority"
              value={String(product.priority)}
              readViewOnly
            />
          </div>
        </div>
        <div>
          <Input
            label="Descripción"
            placeholder="Sin descripción"
            value={product.description}
            readViewOnly
            isTextArea
            rows={5}
          />
        </div>
      </div>
      <div className="mx-auto my-8 mb-4 max-w-[904px]">
        <p
          className="text-[16px] font-normal leading-6"
          style={{ color: Colors.textMain }}
        >
          Categoría del producto
        </p>
      </div>
      <div className="mx-auto max-w-[904px] rounded-xl bg-white px-6 py-4 pb-12 shadow-md">
        <div className="w-full">
          <Input
            label="Categoría"
            value={product.categories[0]?.name || '-'}
            readViewOnly
          />
        </div>
      </div>

      <div className="mx-auto my-8 max-w-[904px]">
        <UploadedImage productId={id} />
      </div>
      <div className="mx-auto max-w-[904px] rounded-xl py-8">
        <TableContainer
          title="Presentaciones"
          tableData={presentations}
          tableColumns={presentationColumns}
          onEdit={handleEditPresentation}
          onView={handleView}
          onAddClick={handleAdd}
          onSearch={(query) => console.log('Buscando presentacion...:', query)}
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
    </>
  );
}
