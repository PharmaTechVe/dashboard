'use client';

import { useState } from 'react';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast, ToastContainer } from 'react-toastify';
import Input from '@/components/Input/Input';
import { newPresentationSchema } from '@/lib/validations/newPresentationSchema';
import { useRouter } from 'next/navigation';

const UNITS = [
  { label: 'mg', value: 'mg' },
  { label: 'ml', value: 'ml' },
  { label: 'g', value: 'g' },
  { label: 'caps', value: 'caps' },
  { label: 'tbl', value: 'tbl' },
];

export default function NewPresentationPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const result = newPresentationSchema.safeParse({
      name,
      measurementUnit,
      quantity,
      description,
    });

    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
      setErrors({
        name: fieldErrors.name?.[0] || '',
        measurementUnit: fieldErrors.measurementUnit?.[0] || '',
        quantity: fieldErrors.quantity?.[0] || '',
        description: fieldErrors.description?.[0] || '',
      });
      return;
    }
    try {
      const token =
        sessionStorage.getItem('pharmatechToken') ||
        localStorage.getItem('pharmatechToken');
      if (!token) {
        toast.error('Token de autenticación no encontrado');
        return;
      }

      const payload = {
        ...result.data,
        description: result.data.description || '',
      };

      await api.presentation.create(payload, token);
      toast.success('Presentación creada exitosamente');

      setName('');
      setMeasurementUnit('');
      setQuantity('');
      setDescription('');
      setErrors({});
    } catch (err) {
      console.error('Error al crear la presentación:', err);
      toast.error('Ocurrió un error al crear la presentación');
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
                  { label: 'Presentaciones', href: '/presentations' },
                  { label: 'Crear Presentación', href: '' },
                ]}
              />
            </div>
            <div className="mx-auto max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                  Nueva presentación
                </h1>
                <div className="flex space-x-4">
                  <Button
                    color={Colors.textWhite}
                    paddingX={4}
                    paddingY={4}
                    textSize="16"
                    width="196px"
                    height="44px"
                    onClick={() => router.back()} // Botón para volver
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
                    Crear Presentación
                  </Button>
                </div>
              </div>
              <p className="text-[16px] font-normal leading-6 text-[#393938]">
                Agrega la información de la presentación
              </p>
              <div>
                <Input
                  label="Nombre"
                  placeholder="Agrega el nombre de la presentación"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  helperText={errors.name}
                  helperTextColor="#E10000"
                  borderColor="#d1d5db"
                />
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <Dropdown
                    title="Unidad de medida"
                    width="100%"
                    height="42px"
                    placeholder="Selecciona la unidad de medida"
                    items={UNITS}
                    selected={measurementUnit}
                    onChange={setMeasurementUnit}
                  />
                  {errors.measurementUnit && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.measurementUnit}
                    </p>
                  )}
                </div>
                <div className="w-1/2">
                  <Input
                    label="Cantidad del producto"
                    placeholder="Agrega la cantidad de producto por unidad"
                    value={quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setQuantity(e.target.value)
                    }
                    helperText={errors.quantity}
                    helperTextColor="#E10000"
                    borderColor="#d1d5db"
                    type="number"
                  />
                </div>
              </div>
              <div>
                <Input
                  label="Descripción"
                  placeholder="Agrega la descripción de la presentación"
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
          </main>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
