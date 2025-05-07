'use client';

import { FC } from 'react';
import Image from 'next/image';
import { OrderDetailResponse } from '@pharmatech/sdk';

type Props = {
  details: OrderDetailResponse[];
};

const OrderProductList: FC<Props> = ({ details }) => {
  const total = details.reduce((acc, detail) => {
    const price = detail.productPresentation.price || 0;
    return acc + price * detail.quantity;
  }, 0);

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
        <p className="text-lg font-semibold text-gray-800">
          Total: ${total.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default OrderProductList;
