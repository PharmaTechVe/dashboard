'use client';
import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import Input from '@/components/Input/Input';
import { Colors } from '@/styles/styles';
import { newGenericProductSchema } from '@/lib/validations/newGenericProductSchema';
import type { ManufacturerResponse } from '@pharmatech/sdk';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
export default function NewGenericProductPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [manufacturerId, setManufacturerId] = useState('');
  const [manufacturers, setManufacturers] = useState<ManufacturerResponse[]>(
    [],
  );
  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
          <div className="flex space-x-4">
            <Button
              color={Colors.textWhite}
              paddingX={4}
              paddingY={4}
              textSize="16"
              width="196px"
              height="44px"
              onClick={() => router.back()} // Navega hacia atrás
              textColor={Colors.textMain}
            >
              Volver
            </Button>
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
        </div>
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
          </div>
        </div>
        <div className="flex space-x-4">
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
    </>
  );
}
