'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import Input from '@/components/Input/Input';
import { Colors } from '@/styles/styles';
import type {
  PromoResponse,
  ProductPresentationResponse,
} from '@pharmatech/sdk';
import { newProductPresentationSchema } from '@/lib/validations/newProductPresentationSchema';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { useAuth } from '@/context/AuthContext';

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
  const { token } = useAuth();

  const [presentationData, setPresentationData] =
    useState<ProductPresentationResponse | null>(null);
  const [promos, setPromos] = useState<PromoResponse[]>([]);
  const [promoId, setPromoId] = useState<string>('');
  const [selectedPromo, setSelectedPromo] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
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
  }, [productId, presentationId, token]);

  useEffect(() => {
    const selected = promos.find((promo) => promo.name === selectedPromo);
    setPromoId(selected ? selected.id : '');
  }, [selectedPromo, promos]);

  const handleSubmit = async () => {
    const result = newProductPresentationSchema.safeParse({
      presentationId,
      price: parseFloat(price),
      promoId: promoId || undefined,
    });

    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
      setErrors({
        presentationId: fieldErrors.presentationId?.[0] || '',
        price: fieldErrors.price?.[0] || '',
        promo: fieldErrors.promoId?.[0] || '',
      });
      return;
    }

    if (!token || typeof productId !== 'string') {
      toast.error('Token o ID inválido');
      return;
    }

    const payload = result.data;

    try {
      console.log('Payload:', payload);
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
    <>
      <div className="mx-auto mb-4 max-w-[904px]">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[28px] font-normal">Editar presentación</h1>
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
              Guardar Cambios
            </Button>
          </div>
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
          <Input
            label="Precio"
            placeholder="Agrega el precio de esta presentación"
            value={price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPrice(e.target.value)
            }
            helperText={errors.price}
            helperTextColor="#E10000"
            borderColor="#d1d5db"
            type="number"
          />
        </div>
      </div>
    </>
  );
}
