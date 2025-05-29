'use client';

import { FC } from 'react';
import Image from 'next/image';
import { OrderDetailResponse } from '@pharmatech/sdk';
import { formatPrice } from '@/lib/utils/priceFormatter';

type Props = {
  details: OrderDetailResponse[];
  total: number;
};

const OrderProductList: FC<Props> = ({ details, total }) => {
  const subtotal = details.reduce(
    (acc, detail) => acc + detail.quantity * detail.price,
    0,
  );
  const discount = subtotal - total;

  return (
    <div className="w-full space-y-4 rounded-xl bg-white p-6 shadow-md lg:w-1/3">
      <h3 className="mb-2 font-semibold">Productos</h3>
      <div className="space-y-2">
        {details.map((detail, idx) => (
          <div
            key={idx}
            className="flex items-center space-x-4 rounded border p-2"
          >
            <Image
              src={detail.productPresentation.product.images?.[0]?.url}
              alt="Producto"
              className="h-16 w-16 rounded object-cover"
              width={64}
              height={64}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {detail.productPresentation.product.name}
              </p>
              <p className="text-xs text-gray-500">
                {detail.productPresentation.presentation.name}
              </p>
            </div>
            <span className="font-semibold text-gray-700">
              x{detail.quantity}
            </span>
          </div>
        ))}
        <p className="text-md text-gray-800">
          Subtotal: ${formatPrice(subtotal)}
        </p>
        <p className="text-md text-[#2ECC71]">
          Descuento: ${formatPrice(discount)}
        </p>
        <p className="text-md font-semibold text-gray-800">
          Total: ${formatPrice(total)}
        </p>
      </div>
    </div>
  );
};

export default OrderProductList;
