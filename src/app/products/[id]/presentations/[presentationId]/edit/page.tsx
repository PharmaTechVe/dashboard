'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/SideBar';
import Navbar from '@/components/Navbar';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import { Colors } from '@/styles/styles';
import type {
  PromoResponse,
  ProductPresentationResponse,
} from '@pharmatech/sdk';
import { api } from '@/lib/sdkConfig';
import { toast, ToastContainer } from 'react-toastify';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';

export default function EditProductPresentationPage() {
  const params = useParams();
  const productId =
    params?.id && typeof params.id === 'string' ? params.id : '';
  const presentationId =
    params?.presentationId &&
    typeof params.presentationId === 'string' &&
    params.presentationId !== 'undefined'
      ? params.presentationId
      : '';
  const router = useRouter();

  const [presentationData, setPresentationData] =
    useState<ProductPresentationResponse | null>(null);
  const [promos, setPromos] = useState<PromoResponse[]>([]);
  const [promoId, setPromoId] = useState<string>('');
  const [selectedPromo, setSelectedPromo] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      if (
        !token ||
        typeof productId !== 'string' ||
        typeof presentationId !== 'string'
      )
        return;
      try {
        const [presData, promoResp] = await Promise.all([
          api.productPresentation.getByPresentationId(
            productId,
            presentationId,
          ),
          api.promo.findAll({ page: 1, limit: 50 }, token),
        ]);
        setPresentationData(presData);
        setPromos(promoResp.results);
        setPrice(presData.price.toString());
        setSelectedPromo(presData.promo?.name || '');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error cargando los datos de la presentación.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [productId, presentationId, getToken]);

  useEffect(() => {
    const selected = promos.find((promo) => promo.name === selectedPromo);
    setPromoId(selected ? selected.id : '');
  }, [selectedPromo, promos]);

  const handleSubmit = async () => {
    if (!price) {
      setErrors({ price: 'Precio requerido' });
      return;
    }

    const token = getToken();
    if (
      !token ||
      typeof productId !== 'string' ||
      typeof presentationId !== 'string'
    ) {
      toast.error('Token o ID inválido');
      return;
    }

    const payload = {
      price: parseFloat(price),
      promoId,
    };

    try {
      await api.productPresentation.update(productId, presentationId, payload);
      toast.success('Presentación actualizada exitosamente');
      setTimeout(() => {
        router.push(`/products/${productId}`);
      }, REDIRECTION_TIMEOUT);
    } catch (err) {
      console.error('Error actualizando presentación:', err);
      toast.error('No se pudo actualizar la presentación');
    }
  };

  const breadcrumbItems = [
    { label: 'Productos', href: '/products' },
    { label: `#${productId}`, href: `/products/${productId}` },
    { label: 'Editar presentación', href: '' },
  ];

  if (loading) return <p className="p-4 text-lg">Cargando presentación...</p>;
  if (error || !presentationData)
    return (
      <p className="p-4 text-lg">{error || 'Presentación no encontrada.'}</p>
    );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-[#F1F5FD] p-6 text-[#393938]">
          <div className="mx-auto mb-4 max-w-[904px]">
            <Breadcrumb items={breadcrumbItems} />
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-[28px] font-normal">Editar presentación</h1>
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

          <div className="mx-auto max-w-[904px] space-y-4 rounded-xl bg-white p-6 shadow-md">
            <div>
              <label className="block text-[16px] font-medium text-gray-600">
                Presentación
              </label>
              <input
                className="mt-1 w-full cursor-default select-none rounded-md bg-gray-200 p-2 text-[16px]"
                value={`${presentationData.presentation.name} | ${presentationData.presentation.quantity} ${presentationData.presentation.measurementUnit}`}
                readOnly
              />
            </div>
            <div>
              <Dropdown
                title="Promoción"
                placeholder="Selecciona una promoción"
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
                <p className="text-sm text-red-500">{errors.price}</p>
              )}
            </div>
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
