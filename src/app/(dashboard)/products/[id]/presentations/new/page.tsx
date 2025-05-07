'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import Input from '@/components/Input/Input';
import { Colors } from '@/styles/styles';
import type { PresentationResponse, PromoResponse } from '@pharmatech/sdk';
import { newProductPresentationSchema } from '@/lib/validations/newProductPresentationSchema';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
export default function AddProductPresentationPage() {
  const params = useParams();
  const productId =
    params?.id && typeof params.id === 'string' ? params.id : '';
  const router = useRouter();

  const [presentations, setPresentations] = useState<PresentationResponse[]>(
    [],
  );

  const { token } = useAuth();
  const [promos, setPromos] = useState<PromoResponse[]>([]);
  const [presentationId, setPresentationId] = useState('');
  const [promoId, setPromoId] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchData() {
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
  }, [token]);

  const handleSubmit = async () => {
    const result = newProductPresentationSchema.safeParse({
      presentationId,
      price: parseFloat(price),
      promoId: promoId || undefined,
    });

    if (!result.success) {
      const { fieldErrors } = result.error.flatten();
      setErrors({
        presentation: fieldErrors.presentationId?.[0] || '',
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
          <h1
            className="text-[28px] font-normal leading-none"
            style={{ color: Colors.textMain }}
          >
            Añadir presentación a producto
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
              Añadir presentación
            </Button>
          </div>
        </div>
        <p
          className="text-[16px] font-normal leading-6"
          style={{ color: Colors.textMain }}
        >
          Selecciona la presentación y la promo que deseas agregar
        </p>
        <div>
          <Dropdown
            title="Presentación"
            placeholder="Selecciona una presentación para el producto"
            width="100%"
            items={presentations.map((p) => ({
              label: `${p.name} | ${p.quantity} ${p.measurementUnit}`,
              value: p.id,
            }))}
            selected={presentationId}
            onChange={(value) => setPresentationId(value)}
          />
          {errors.presentation && (
            <p className="mt-1 text-sm text-red-500">{errors.presentation}</p>
          )}
        </div>

        <div>
          <Dropdown
            title="Promoción"
            placeholder="Selecciona una promoción para la presentación"
            width="100%"
            items={promos.map((promo) => ({
              label: promo.name,
              value: promo.id,
            }))}
            selected={promoId}
            onChange={(value) => setPromoId(value)}
          />
        </div>
        <div>
          <Input
            label="Precio"
            placeholder="Agrega el precio de esta presentación"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            helperText={errors.price}
            helperTextColor={Colors.semanticDanger}
            borderColor="#d1d5db"
            type="number"
            borderSize="1px"
          />
        </div>
      </div>
    </>
  );
}
