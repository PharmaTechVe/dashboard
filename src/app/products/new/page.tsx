'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import { Colors } from '@/styles/styles';
import { newGenericProductSchema } from '@/lib/validations/newGenericProductSchema';
import { api } from '@/lib/sdkConfig';
import { toast, ToastContainer } from 'react-toastify';

interface Manufacturer {
  id: string;
  name: string;
  description: string;
  country: { name: string };
}

export default function NewGenericProductPage() {
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [manufacturerId, setManufacturerId] = useState('');
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchManufacturers() {
      try {
        const token =
          sessionStorage.getItem('pharmatechToken') ||
          localStorage.getItem('pharmatechToken');
        if (!token) return;
        const response = await api.manufacturer.findAll(
          { page: 1, limit: 50 },
          token,
        );
        setManufacturers(response.results);
      } catch (error) {
        console.error('Error fetching manufacturers:', error);
      }
    }
    fetchManufacturers();
  }, []);

  useEffect(() => {
    const selected = manufacturers.find((m) => m.name === selectedManufacturer);
    setManufacturerId(selected ? selected.id : '');
  }, [selectedManufacturer, manufacturers]);

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

    try {
      const token =
        sessionStorage.getItem('pharmatechToken') ||
        localStorage.getItem('pharmatechToken');
      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }

      const payload = {
        name,
        genericName,
        description,
        priority: parseInt(priority),
        manufacturerId,
      };

      await api.genericProduct.create(payload, token);
      toast.success('Producto creado exitosamente');

      setName('');
      setGenericName('');
      setDescription('');
      setPriority('');
      setManufacturerId('');
      setSelectedManufacturer('');
      setErrors({});
    } catch (error) {
      console.error('Error al crear el producto:', error);
      toast.error('Ocurrió un error al crear el producto');
    }
  };

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
            <div className="mx-auto mb-4 max-w-[904px]">
              <Breadcrumb
                items={[
                  { label: 'Productos', href: '/products' },
                  { label: 'Crear Producto', href: '' },
                ]}
              />
            </div>
            <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                  Nuevo Producto
                </h1>
                <Button
                  color={Colors.primary}
                  paddingX={4}
                  paddingY={4}
                  textSize="16"
                  width="196px"
                  height="44px"
                  onClick={handleSubmit}
                  textColor={Colors.textWhite}
                >
                  Agregar Producto
                </Button>
              </div>
              <div>
                <label className="block text-[16px] font-medium text-gray-600">
                  Nombre
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                  placeholder="Ingresa el nombre del producto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-[16px] font-medium text-gray-600">
                  Nombre Genérico
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                  placeholder="Ingresa el nombre genérico"
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                />
                {errors.genericName && (
                  <p className="text-sm text-red-500">{errors.genericName}</p>
                )}
              </div>
              <div>
                <label className="block text-[16px] font-medium text-gray-600">
                  Descripción
                </label>
                <textarea
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                  placeholder="Ingresa la descripción del producto"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>
              <div>
                <label className="block text-[16px] font-medium text-gray-600">
                  Prioridad
                </label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                  placeholder="Ingresa la prioridad"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
                {errors.priority && (
                  <p className="text-sm text-red-500">{errors.priority}</p>
                )}
              </div>
              <div>
                <Dropdown
                  title="Fabricante"
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
          </main>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
