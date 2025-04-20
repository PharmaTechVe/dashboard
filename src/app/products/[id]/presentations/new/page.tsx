'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import { Colors } from '@/styles/styles';
import type { PresentationResponse, PromoResponse } from '@pharmatech/sdk';
import { api } from '@/lib/sdkConfig';
import { toast, ToastContainer } from 'react-toastify';

export default function AddProductPresentationPage() {
  const params = useParams();
  const productId =
    params?.id && typeof params.id === 'string' ? params.id : '';
  const router = useRouter();

  const [presentations, setPresentations] = useState<PresentationResponse[]>(
    [],
  );
  const [promos, setPromos] = useState<PromoResponse[]>([]);
  const [selectedPresentation, setSelectedPresentation] = useState('');
  const [selectedPromo, setSelectedPromo] = useState('');
  const [presentationId, setPresentationId] = useState('');
  const [promoId, setPromoId] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return (
      sessionStorage.getItem('pharmatechToken') ||
      localStorage.getItem('pharmatechToken')
    );
  }, []);

  useEffect(() => {
    async function fetchData() {
      const token = getToken();
      if (!token) return;

      try {
        const presResp = await api.presentation.findAll({ page: 1, limit: 50 });
        const promoResp = await api.promo.findAll(
          { page: 1, limit: 50 },
          token,
        );

        setPresentations(presResp.results);
        setPromos(promoResp.results);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, [getToken]);

  useEffect(() => {
    const selected = presentations.find(
      (p) =>
        `${p.name} | ${p.quantity} ${p.measurementUnit}` ===
        selectedPresentation,
    );
    setPresentationId(selected ? selected.id : '');
  }, [selectedPresentation, presentations]);

  useEffect(() => {
    const selected = promos.find((p) => p.name === selectedPromo);
    setPromoId(selected ? selected.id : '');
  }, [selectedPromo, promos]);

  const handleSubmit = async () => {
    if (!selectedPresentation || !price) {
      setErrors({
        presentation: !selectedPresentation ? 'Presentación requerida' : '',
        price: !price ? 'Precio requerido' : '',
      });
      return;
    }

    const token = getToken();
    if (!token || typeof productId !== 'string') {
      toast.error('Token o ID inválido');
      return;
    }

    const payload = {
      presentationId,
      price: parseFloat(price),
      promoId: promoId || undefined,
    };

    try {
      console.log('Payload:', payload);
      await api.productPresentation.create(productId, payload);
      toast.success('Presentación añadida al producto');
      setTimeout(() => {
        router.push(`/products/${productId}`);
      }, 1500);
    } catch (err) {
      console.error('Error creando relación:', err);
      toast.error('No se pudo añadir la presentación');
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
                  { label: `#${productId}`, href: `/products/${productId}` },
                  { label: 'Añadir presentación', href: '' },
                ]}
              />
            </div>

            <div className="mx-auto max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-[28px] font-normal leading-none text-[#393938]">
                  Añadir presentación a producto
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
                  Añadir presentación
                </Button>
              </div>
              <p className="text-[16px] font-normal leading-6 text-[#393938]">
                Selecciona la presentación y la promo que deseas agregar
              </p>
              <div>
                <Dropdown
                  title="Presentación"
                  placeholder="Selecciona una presentación para el producto"
                  width={'100%'}
                  items={presentations.map((p) => ({
                    label: `${p.name} | ${p.quantity} ${p.measurementUnit}`,
                    value: p.id,
                  }))}
                  selected={selectedPresentation}
                  onChange={setSelectedPresentation}
                />
                {errors.presentation && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.presentation}
                  </p>
                )}
              </div>

              <div>
                <Dropdown
                  title="Promoción"
                  placeholder="Selecciona una promoción para la presentación"
                  width={'100%'}
                  items={promos.map((promo) => ({
                    label: promo.name,
                    value: promo.id,
                  }))}
                  selected={selectedPromo}
                  onChange={setSelectedPromo}
                />
              </div>

              <div>
                <label className="block text-[16px] font-medium text-gray-600">
                  Precio
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="mt-1 w-full rounded-md border border-gray-300 p-2 text-[16px] focus:border-gray-400 focus:outline-none focus:ring-0"
                  placeholder="Agrega el precio de esta presentación"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price}</p>
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
