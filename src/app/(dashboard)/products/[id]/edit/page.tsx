'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import Input from '@/components/Input/Input';
import ImageUpload from '@/components/Image/ImageUpload';
import { Colors } from '@/styles/styles';
import type {
  ManufacturerResponse,
  GenericProductResponse,
  CategoryResponse,
} from '@pharmatech/sdk';
import { newGenericProductSchema } from '@/lib/validations/newGenericProductSchema';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { useAuth } from '@/context/AuthContext';

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
  const { token } = useAuth();
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
  }, [token]);

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
      console.log(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Error fetching product details.');
    }
  }, [id, token]);

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
    const result = newGenericProductSchema.safeParse({
      name,
      genericName,
      description,
      priority,
      manufacturerId,
    });

    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
      setErrors({
        name: fieldErrors.name?.[0] || '',
        genericName: fieldErrors.genericName?.[0] || '',
        description: fieldErrors.description?.[0] || '',
        priority: fieldErrors.priority?.[0] || '',
        manufacturerId: fieldErrors.manufacturerId?.[0] || '',
      });
      return;
    }
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
      console.log('Category ID:', categoryId, categoryId);
      if (currentCategory) {
        await api.productCategory.delete(id, currentCategory.id);
      }
      await api.productCategory.create(id, categoryId);
      toast.success('Producto actualizado con exito');
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
      <div className="mx-auto mb-4 max-w-[904px]">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-[28px] font-normal leading-none text-[#393938]">
            Editar Producto
          </h1>
          <div className="flex space-x-4">
            <Button
              color={Colors.textWhite}
              paddingX={4}
              paddingY={4}
              textSize="16"
              width="auto"
              onClick={() => router.back()}
              textColor={Colors.textMain}
            >
              Cancelar
            </Button>
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
        </div>
        <p className="text-[16px] font-normal leading-6 text-[#393938]">
          Agrega la información básica del producto
        </p>
      </div>
      <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
        <div className="flex space-x-4">
          <div className="w-1/2">
            <Input
              label="Nombre Genérico"
              placeholder="Ingresa el nombre genérico"
              value={genericName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setGenericName(e.target.value)
              }
              helperText={errors.genericName}
              helperTextColor="#E10000"
              borderColor="#d1d5db"
            />
          </div>
          <div className="w-1/2">
            <Dropdown
              title="Fabricante"
              placeholder="Selecciona el fabricante"
              width="100%"
              items={manufacturers.map((m) => ({
                label: m.name,
                value: m.id,
              }))}
              selected={selectedManufacturer}
              onChange={setSelectedManufacturer}
            />
            {errors.manufacturerId && (
              <p className="text-sm text-red-500">{errors.manufacturerId}</p>
            )}
          </div>
        </div>
        <div className="mt-4 flex space-x-4">
          <div className="w-1/2">
            <Input
              label="Nombre"
              placeholder="Ingresa el nombre del producto"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              helperText={errors.name}
              helperTextColor="#E10000"
              borderColor="#d1d5db"
            />
          </div>
          <div className="w-1/2">
            <Input
              label="Prioridad"
              placeholder="Ingresa la prioridad"
              value={priority}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPriority(e.target.value)
              }
              helperText={errors.priority}
              helperTextColor="#E10000"
              borderColor="#d1d5db"
              type="number"
            />
          </div>
        </div>
        <div>
          <Input
            label="Descripción"
            placeholder="Ingresa la descripción del producto"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setDescription(e.target.value)
            }
            helperText={errors.description}
            helperTextColor="#E10000"
            borderColor="#d1d5db"
            type="text"
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
            <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
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
    </>
  );
}
