'use client';

import React, { useState } from 'react';
import CheckButton from '@/components/CheckButton';
import Input from '@/components/Input/Input';
import Button from '@/components/Button';
import { Colors } from '@/styles/styles';
import { api } from '@/lib/sdkConfig';
import { toast } from 'react-toastify';
import { REDIRECTION_TIMEOUT } from '@/lib/utils/contants';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

type CSVRow = Record<string, string | number | boolean>;
type CSVRowWithSelection = CSVRow & { selected: boolean };

type Props = {
  data: CSVRow[];
  editableColumn: string;
  onConfirm: (selectedRows: CSVRow[]) => void;
  onCancel?: () => void;
};

const InventoryTable: React.FC<Props> = ({
  data,
  editableColumn,
  onCancel,
}) => {
  const [rows, setRows] = useState<CSVRowWithSelection[]>(
    data.map((row) => ({
      ...row,
      [editableColumn]: row[editableColumn] ?? '',
      selected: false,
    })),
  );

  const handleEdit = (index: number, value: string) => {
    if (/^\d*$/.test(value)) {
      const newRows = [...rows];
      newRows[index][editableColumn] = value;
      setRows(newRows);
    }
  };

  const handleSelect = (index: number, isSelected: boolean) => {
    const newRows = [...rows];
    newRows[index].selected = isSelected;
    setRows(newRows);
  };
  interface UpdateStockRow {
    uuid: string;
    expirationDate: string;
    stock: number;
  }
  const columnOrder = [
    'uuid',
    'productName',
    'presentationName',
    'expirationDate',
    'stock',
  ];
  const { token } = useAuth();
  const router = useRouter();
  const handleConfirm = async (rows: UpdateStockRow[]): Promise<void> => {
    try {
      const payload: {
        inventories: {
          productPresentationId: string;
          quantity: number;
          expirationDate: Date;
        }[];
      } = {
        inventories: rows.map((row) => ({
          productPresentationId: row.uuid,
          quantity: row.stock,
          expirationDate: new Date(row.expirationDate),
        })),
      };
      await api.inventory.bulkUpdate(payload, token!);

      toast.success('Inventario actualizado');
      clearTable();
      setTimeout(() => {
        router.push('/products');
      }, REDIRECTION_TIMEOUT);
    } catch (error) {
      console.error('Error actualizando inventario:', error);
      toast.error('Error actualizando inventario');
    }
  };

  const headers = columnOrder.filter((key) => key in (data[0] || {}));
  const hasSelected = rows.some((r) => r.selected);

  const hasInvalidStock = rows.some(
    (r) =>
      r.selected &&
      (!r[editableColumn] ||
        String(r[editableColumn]).trim() === '' ||
        Number(r[editableColumn]) === 0),
  );
  const clearTable = () => {
    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        selected: false,
        [editableColumn]: '',
      })),
    );
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full table-auto border-collapse">
          <thead className="rounded-t-xl bg-[#00144F] text-sm text-white">
            <tr>
              {headers.map((header) => (
                <th key={header} className="p-3 text-left capitalize">
                  {header === editableColumn ? 'Stock' : header}
                </th>
              ))}
              <th className="w-[120px] p-3 text-left">¿Actualizar?</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const isSelected = row.selected;
              const isInvalid =
                isSelected &&
                (!row[editableColumn] ||
                  String(row[editableColumn]).trim() === '' ||
                  Number(row[editableColumn]) === 0);

              return (
                <tr key={index} className="border-b text-sm">
                  {headers.map((key) => (
                    <td key={key} className="p-3">
                      {key === editableColumn ? (
                        <div style={{ width: '140px', height: '32px' }}>
                          <Input
                            type="text"
                            value={String(row[key])}
                            onChange={(e) => handleEdit(index, e.target.value)}
                            borderSize="1px"
                            borderColor={isInvalid ? '#DC2626' : '#D1D5DB'}
                            helperText={
                              isInvalid ? 'Stock requerido (> 0)' : ''
                            }
                            helperTextColor="#DC2626"
                          />
                        </div>
                      ) : (
                        <span>{String(row[key])}</span>
                      )}
                    </td>
                  ))}
                  <td className="p-3">
                    <CheckButton
                      checked={isSelected}
                      onChange={(val) => handleSelect(index, val)}
                      filled={Colors.primary}
                      strokeColor={Colors.primary}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Button
          onClick={onCancel}
          variant="white"
          width="140px"
          height="40px"
          textColor={Colors.textMain}
        >
          Cancelar
        </Button>
        <Button
          onClick={() =>
            handleConfirm(
              rows
                .filter((row) => row.selected)
                .map((row) => ({
                  uuid: String(row.uuid),
                  expirationDate: String(row.expirationDate),
                  stock: Number(row[editableColumn]),
                })),
            )
          }
          variant="submit"
          width="160px"
          height="40px"
          disabled={!hasSelected || hasInvalidStock}
        >
          Confirmar carga
        </Button>
      </div>
    </div>
  );
};

export default InventoryTable;
