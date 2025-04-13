//Editar una sucursal por id
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { newBranchSchema } from '@/lib/validations/newBranchSchema';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';

interface StateItem {
  id: string;
  name: string;
}

interface CityItem {
  id: string;
  name: string;
}

export default function EditBranchPage() {
  const { id } = useParams();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);

  const [selectedStateName, setSelectedStateName] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');

  const router = useRouter();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const getToken = useCallback(
    () =>
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken'),
    [],
  );

  const fetchStates = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const response = await api.state.findAll({
      page: 1,
      limit: 24,
      countryId: '1238bc2a-45a5-47e4-9cc1-68d573089ca1',
    });
    setStates(response.results);
  }, [getToken]);

  const fetchCities = useCallback(
    async (stateId: string) => {
      const token = getToken();
      if (!token) return;

      const response = await api.city.findAll({
        page: 1,
        limit: 50,
        stateId,
      });
      setCities(response.results);
    },
    [getToken],
  );

  const fetchBranch = useCallback(async () => {
    const token = getToken();
    if (!token || typeof id !== 'string') return;

    try {
      const branch = await api.branch.getById(id, token);
      setName(branch.name);
      setAddress(branch.address);
      setLatitude(String(branch.latitude));
      setLongitude(String(branch.longitude));

      setSelectedStateName(branch.city.state.name);
      setSelectedCityName(branch.city.name);
    } catch (error) {
      console.error('Error al cargar la sucursal:', error);
    }
  }, [id, getToken]);

  useEffect(() => {
    fetchStates();
    fetchBranch();
  }, [fetchStates, fetchBranch]);

  useEffect(() => {
    const selectedState = states.find((s) => s.name === selectedStateName);
    if (selectedState) {
      setStateId(selectedState.id);
      fetchCities(selectedState.id);
    }
  }, [selectedStateName, states, fetchCities]);

  useEffect(() => {
    const selectedCity = cities.find((c) => c.name === selectedCityName);
    if (selectedCity) {
      setCityId(selectedCity.id);
    }
  }, [selectedCityName, cities]);

  const handleSubmit = async () => {
    const result = newBranchSchema.safeParse({
      name,
      address,
      latitude,
      longitude,
      stateId,
      cityId,
    });

    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
      setErrors({
        name: fieldErrors.name?.[0] ?? '',
        address: fieldErrors.address?.[0] ?? '',
        latitude: fieldErrors.latitude?.[0] ?? '',
        longitude: fieldErrors.longitude?.[0] ?? '',
        stateId: fieldErrors.stateId?.[0] ?? '',
        cityId: fieldErrors.cityId?.[0] ?? '',
      });
      return;
    }

    try {
      const token = getToken();
      if (!token || typeof id !== 'string') {
        toast.error('Token o ID inválido');
        return;
      }

      const payload = {
        name,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        cityId,
      };

      await api.branch.update(id, payload, token);
      toast.success('Sucursal actualizada exitosamente');
      setTimeout(() => {
        router.push('/branches');
      }, REDIRECTION_TIMEOUT);
    } catch (error) {
      console.error('Error al actualizar la sucursal:', error);
      toast.error('Ocurrió un error al actualizar la sucursal');
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
                  { label: 'Sucursales', href: '/branches' },
                  {
                    label: `Editar Sucursal #${id?.toString().slice(0, 3)}`,
                    href: '',
                  },
                ]}
              />
            </div>

            <div className="mx-auto max-h-[687px] max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                  Editar Sucursal
                </h1>
                <Button
                  color={Colors.primary}
                  paddingX={4}
                  paddingY={4}
                  textSize="16"
                  width="196x"
                  height="44px"
                  onClick={handleSubmit}
                  textColor={Colors.textWhite}
                >
                  Guardar Cambios
                </Button>
              </div>

              <div>
                <label className="block text-[16px] font-medium text-gray-600">
                  Nombre
                </label>
                <input
                  className="mt-1 w-[808px] rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                  placeholder="Nombre de la sucursal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Dropdown
                    selected={selectedStateName}
                    title="Estado"
                    placeholder="Selecciona el Estado"
                    items={states.map((s) => ({ label: s.name, value: s.id }))}
                    onChange={setSelectedStateName}
                  />
                  {errors.stateId && (
                    <p className="text-sm text-red-500">{errors.stateId}</p>
                  )}
                </div>
                <div>
                  <Dropdown
                    selected={selectedCityName}
                    title="Ciudad"
                    placeholder="Selecciona la Ciudad"
                    items={cities.map((c) => ({ label: c.name, value: c.id }))}
                    onChange={setSelectedCityName}
                  />
                  {errors.cityId && (
                    <p className="text-sm text-red-500">{errors.cityId}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[16px] font-medium text-gray-600">
                  Dirección
                </label>
                <input
                  className="mt-1 w-[808px] rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                  placeholder="Dirección"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Latitud
                  </label>
                  <input
                    className="mt-1 w-[249px] rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                    placeholder="Latitud"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                  {errors.latitude && (
                    <p className="text-sm text-red-500">{errors.latitude}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[16px] font-medium text-gray-600">
                    Longitud
                  </label>
                  <input
                    className="mt-1 w-[249px] rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                    placeholder="Longitud"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                  {errors.longitude && (
                    <p className="text-sm text-red-500">{errors.longitude}</p>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
