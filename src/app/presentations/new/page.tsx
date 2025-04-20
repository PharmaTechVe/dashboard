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

const UNITS = [
  { label: 'mg', value: 'mg' },
  { label: 'ml', value: 'ml' },
  { label: 'g', value: 'g' },
  { label: 'caps', value: 'caps' },
  { label: 'tbl', value: 'tbl' },
];

export default function NewPresentationPage() {
  const [name, setName] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    if (!name || !measurementUnit || !quantity) {
      setErrors({
        name: !name ? 'El nombre es requerido' : '',
        measurementUnit: !measurementUnit ? 'La unidad es requerida' : '',
        quantity: !quantity ? 'La cantidad es requerida' : '',
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
        name,
        measurementUnit,
        quantity: parseFloat(quantity),
        description,
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
              <p className="text-[16px] font-normal leading-6 text-[#393938]">
                Agrega la información de la presentación
              </p>
              <div>
                <label className="block text-[16px] font-medium text-gray-600">
                  Nombre
                </label>
                <input
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                  placeholder="Agrega el nombre de la presentación"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
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
                  <label className="block text-[16px] font-medium text-gray-600">
                    Cantidad del producto
                  </label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                    placeholder="Agrega la cantidad de producto por unidad"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.quantity}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[16px] font-medium text-gray-600">
                  Descripción
                </label>
                <textarea
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                  placeholder="Agrega la descripción de la presentación"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
