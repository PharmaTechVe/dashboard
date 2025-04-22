'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import Input from '@/components/Input/Input';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast, ToastContainer } from 'react-toastify';
import { Presentation } from '@pharmatech/sdk';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { newPresentationSchema } from '@/lib/validations/newPresentationSchema';
import { useAuth } from '@/context/AuthContext';

const UNITS = [
  { label: 'mg', value: 'mg' },
  { label: 'ml', value: 'ml' },
  { label: 'g', value: 'g' },
  { label: 'caps', value: 'caps' },
  { label: 'tbl', value: 'tbl' },
];

export default function EditPresentationPage() {
  const params = useParams();
  const id = params?.id && typeof params.id === 'string' ? params.id : '';
  const router = useRouter();
  const { token } = useAuth();

  const [name, setName] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchPresentation = useCallback(async () => {
    if (!token || typeof id !== 'string') return;

    try {
      const data: Presentation = await api.presentation.getById(id, token);
      setName(data.name);
      setMeasurementUnit(data.measurementUnit);
      setQuantity(data.quantity.toString());
      setDescription(data.description || '');
    } catch (error) {
      console.error('Error fetching presentation:', error);
      toast.error('No se pudo cargar la presentación');
    }
  }, [id, token]);

  useEffect(() => {
    fetchPresentation();
  }, [fetchPresentation]);

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

    if (!token || typeof id !== 'string') {
      toast.error('Token o ID inválido');
      return;
    }

    const payload = {
      ...result.data,
      description: result.data.description || '',
    };

    try {
      await api.presentation.update(id, payload, token);
      toast.success('Presentación actualizada correctamente');
      setTimeout(() => {
        router.push('/presentations');
      }, REDIRECTION_TIMEOUT);
    } catch (error) {
      console.error('Error al actualizar presentación:', error);
      toast.error('No se pudo actualizar la presentación');
    }
  };

  const breadcrumbItems = [
    { label: 'Presentaciones', href: '/presentations' },
    { label: `Editar Presentación #${id?.toString().slice(0, 6)}`, href: '' },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
          <div className="mx-auto mb-4 max-w-[904px]">
            <Breadcrumb items={breadcrumbItems} />
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                Editar Presentación
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
                  Guardar Cambios
                </Button>
              </div>
            </div>
            <p className="text-[16px] font-normal leading-6 text-[#393938]">
              Modifica los datos de la presentación
            </p>
          </div>
          <div className="mx-auto max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
            <div>
              <Input
                label="Nombre"
                placeholder="Nombre de la presentación"
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
                  placeholder="Cantidad por unidad"
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
                placeholder="Descripción de la presentación"
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
      <ToastContainer />
    </div>
  );
}
