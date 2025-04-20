'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import ImageUpload from '@/components/Image/ImageUpload';
import { Colors } from '@/styles/styles';
import type {
  ManufacturerResponse,
  GenericProductResponse,
  CategoryResponse,
} from '@pharmatech/sdk';
import { api } from '@/lib/sdkConfig';
import { toast, ToastContainer } from 'react-toastify';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id && typeof params.id === 'string' ? params.id : '';
  const router = useRouter();

  const [genericName, setGenericName] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [manufacturers, setManufacturers] = useState<ManufacturerResponse[]>(
    [],
  );
  const [manufacturerId, setManufacturerId] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryBeforeEdit, setSelectedCategoryBeforeEdit] =
    useState('');
  const currentCategory = categories.find(
    (c) => c.name === selectedCategoryBeforeEdit,
  );
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken')
    );
  }, []);

  const handleUploadedImagesChange = useCallback((urls: string[]) => {
    setImageUrls(urls);
  }, []);

  useEffect(() => {
    async function fetchManufacturers() {
      try {
        const token =
          sessionStorage.getItem('pharmatechToken') ||
          localStorage.getItem('pharmatechToken');
        if (!token) return;
        const response = await api.manufacturer.findAll({ page: 1, limit: 50 });
        setManufacturers(response.results);
      } catch (error) {
        console.error('Error fetching manufacturers:', error);
      }
    }
    fetchManufacturers();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await api.category.findAll({ page: 1, limit: 50 });
        setCategories(response.results);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  const fetchProduct = useCallback(async () => {
    const token = getToken();
    if (!token || typeof id !== 'string') return;
    try {
      const product: GenericProductResponse =
        await api.genericProduct.getById(id);
      setGenericName(product.genericName);
      setName(product.name);
      setDescription(product.description || '');
      setPriority(product.priority.toString());
      setSelectedManufacturer(product.manufacturer.name);
      setSelectedCategory(product?.categories[0]?.name);
      setSelectedCategoryBeforeEdit(product?.categories[0]?.name);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Error fetching product details.');
    }
  }, [id, getToken]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    const selected = manufacturers.find((m) => m.name === selectedManufacturer);
    setManufacturerId(selected ? selected.id : '');
  }, [selectedManufacturer, manufacturers]);

  useEffect(() => {
    const selected = categories.find((c) => c.name === selectedCategory);
    setCategoryId(selected ? selected.id : '');
  }, [selectedCategory, categories]);

  const handleSubmit = async () => {
    if (!genericName || !name) {
      setErrors({
        genericName: !genericName ? 'Required' : '',
        name: !name ? 'Required' : '',
      });
      return;
    }

    const token = getToken();
    if (!token || typeof id !== 'string') {
      toast.error('Token or ID invalid');
      return;
    }

    const payload = {
      genericName,
      name,
      description,
      priority: parseInt(priority),
      manufacturerId,
    };

    try {
      await api.genericProduct.update(id, payload, token);
      for (const url of imageUrls) {
        await api.productImage.create(id, { url });
      }
      toast.success('Producto actualizado con exito');
      if (currentCategory && currentCategory.id !== categoryId) {
        await api.productCategory.delete(id, currentCategory.id);
        await api.productCategory.create(id, categoryId);
      }
      setTimeout(() => {
        router.push('/products');
      }, REDIRECTION_TIMEOUT);
    } catch (error) {
      console.error('Ocurrió un error al actualizar el producto:', error);
      toast.error('Ocurrió un error al actualizar el producto');
    }
  };

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Productos', href: '/products' },
    { label: `Editar Producto #${id?.slice(0, 6)}`, href: '' },
  ];

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
            <div className="mx-auto mb-4 max-w-[904px]">
              <Breadcrumb items={breadcrumbItems} />
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                  Editar Producto
                </h1>
                <Button
                  color={Colors.primary}
                  paddingX={4}
                  paddingY={4}
                  textSize="16"
                  width="auto"
                  onClick={handleSubmit}
                  textColor={Colors.textWhite}
                >
                  Guardar Cambios
                </Button>
              </div>
              <p className="text-[16px] font-normal leading-6 text-[#393938]">
                Agrega la información básica del producto
              </p>
            </div>
            <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-[16px] font-medium text-gray-600">
                    Nombre genérico
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                    placeholder="Generic Name"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                  />
                  {errors.genericName && (
                    <p className="text-sm text-red-500">{errors.genericName}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <Dropdown
                    title="Fabricante"
                    width="100%"
                    height="42px"
                    placeholder="Selecciona el fabricante"
                    items={manufacturers.map((m) => ({
                      label: m.name,
                      value: m.id,
                    }))}
                    selected={selectedManufacturer}
                    onChange={setSelectedManufacturer}
                  />
                  {errors.manufacturerId && (
                    <p className="text-sm text-red-500">
                      {errors.manufacturerId}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex space-x-4">
                <div className="w-1/2">
                  <label className="block text-[16px] font-medium text-gray-600">
                    Nombre
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                    placeholder="Product Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="block text-[16px] font-medium text-gray-600">
                    Prioridad
                  </label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                    placeholder="Priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[16px] font-medium text-gray-600">
                  Descripción
                </label>
                <textarea
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                  placeholder="Product Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="mx-auto my-8 mb-4 max-w-[904px]">
              <p className="text-[16px] font-normal leading-6 text-[#393938]">
                Agrega la información básica del producto
              </p>
            </div>
            <div className="mx-auto mb-8 max-w-[904px] rounded-xl bg-white px-6 py-4 pb-12 shadow-md">
              <div className="w-full">
                <Dropdown
                  title="Categoría"
                  width="100%"
                  height="42px"
                  placeholder="Selecciona la categoría"
                  items={categories.map((c) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                  selected={selectedCategory}
                  onChange={setSelectedCategory}
                />
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.categoryId}
                  </p>
                )}
              </div>
            </div>
            <div className="mx-auto max-w-[904px] rounded-xl bg-white px-6 py-4 pb-12 shadow-md">
              <div className="my-8">
                <h2 className="my-4 text-lg font-medium text-[#393938]">
                  Imágenes del producto
                </h2>
                <ImageUpload
                  productId={id}
                  onUploadedImagesChange={handleUploadedImagesChange}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
