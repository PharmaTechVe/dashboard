'use client';

import { FC } from 'react';
import { BranchResponse, UserList } from '@pharmatech/sdk';

type Props = {
  branch?: BranchResponse;
  selectedDeliveryUserId: string | null;
  deliveryUsers: UserList[];
};

const OrderInfoPanel: FC<Props> = ({
  branch,
  selectedDeliveryUserId,
  deliveryUsers,
}) => {
  const selectedUser = deliveryUsers.find(
    (u) => u.id === selectedDeliveryUserId,
  );

  return (
    <div className="space-y-4 rounded-xl bg-white p-6 shadow-md">
      <h3 className="mb-2 font-semibold">Sucursal de origen</h3>
      <p className="text-sm text-gray-600">
        {branch?.name ?? 'Dirección no disponible'}
      </p>

      <h3 className="mb-2 font-semibold">Datos del Repartidor</h3>
      {selectedUser ? (
        <div>
          <p className="text-sm text-gray-600">
            <strong>Nombre:</strong> {selectedUser.firstName}{' '}
            {selectedUser.lastName}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Teléfono:</strong>{' '}
            {selectedUser.phoneNumber ?? 'No disponible'}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-600">No hay repartidor asignado.</p>
      )}
    </div>
  );
};

export default OrderInfoPanel;
