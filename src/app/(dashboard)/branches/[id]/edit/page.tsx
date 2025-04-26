'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { newBranchSchema } from '@/lib/validations/newBranchSchema';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { useAuth } from '@/context/AuthContext';
import { StateResponse, CityResponse, BranchResponse } from '@pharmatech/sdk';

/// This is a constant that represents the ID of Venezuela.
const COUNTRY_ID = '1238bc2a-45a5-47e4-9cc1-68d573089ca1';

export default function EditBranchPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id ?? '');
  const { token } = useAuth();
  const router = useRouter();

  const [branch, setBranch] = useState<BranchResponse | null>(null);
  const [states, setStates] = useState<StateResponse[]>([]);
  const [cities, setCities] = useState<CityResponse[]>([]);

  const [selectedStateName, setSelectedStateName] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchStates = useCallback(async () => {
    if (!token || typeof id !== 'string') {
      toast.error('Error');
      return;
    }

    const response = await api.state.findAll({
      page: 1,
      limit: 24,
      countryId: COUNTRY_ID,
    });
    setStates(response.results);
  }, [token, id]);

  const fetchCities = useCallback(
    async (stateId: string) => {
      if (!token || typeof id !== 'string') {
        toast.error('Error');
        return;
      }
      const response = await api.city.findAll({
        page: 1,
        limit: 50,
        stateId,
      });
      setCities(response.results);
    },
    [token, id],
  );

  const fetchBranch = useCallback(async () => {
    if (!token || typeof id !== 'string') {
      toast.error('Error');
      return;
    }

    try {
      const fetchedBranch = await api.branch.getById(id, token);
      setBranch(fetchedBranch);
      setSelectedStateName(fetchedBranch.city.state.name);
      setSelectedCityName(fetchedBranch.city.name);
    } catch (error) {
      console.error('Error al cargar la sucursal:', error);
    }
  }, [id, token]);

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
    if (!branch) return;

    const result = newBranchSchema.safeParse({
      name: branch.name,
      address: branch.address,
      latitude: branch.latitude,
      longitude: branch.longitude,
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
      if (!token || typeof id !== 'string') {
        toast.error('Error');
        return;
      }
      const payload = {
        name: branch.name,
        address: branch.address,
        latitude: parseFloat(String(branch.latitude)),
        longitude: parseFloat(String(branch.longitude)),
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

  const handleChange = (
    field: keyof BranchResponse,
    value: string | number,
  ) => {
    setBranch((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  return (
    <>
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
      {/* revisar width y height */}

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
            value={branch?.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
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
            value={branch?.address}
            onChange={(e) => handleChange('address', e.target.value)}
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
              value={branch?.latitude}
              onChange={(e) => handleChange('latitude', e.target.value)}
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
              value={branch?.longitude || ''}
              onChange={(e) => handleChange('longitude', e.target.value)}
            />
            {errors.longitude && (
              <p className="text-sm text-red-500">{errors.longitude}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
