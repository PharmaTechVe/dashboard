'use client';

import React, { useState } from 'react';
import CheckButton from '@/components/CheckButton';
import Input from '@/components/Input/Input';
import Button from '@/components/Button';
import { Colors } from '@/styles/styles';

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
  onConfirm,
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

  const headers = Object.keys(data[0] || {}).filter(
    (key) => key !== 'selected',
  );
  const hasSelected = rows.some((r) => r.selected);

  const hasInvalidStock = rows.some(
    (r) =>
      r.selected &&
      (!r[editableColumn] ||
        String(r[editableColumn]).trim() === '' ||
        Number(r[editableColumn]) === 0),
  );

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full table-auto border-collapse">
          <thead className="rounded-t-xl bg-[#00144F] text-sm text-white">
            <tr>
              <th className="w-[120px] p-3 text-left">¿Actualizar?</th>
              {headers.map((header) => (
                <th key={header} className="p-3 text-left capitalize">
                  {header === editableColumn ? 'Stock' : header}
                </th>
              ))}
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
                  <td className="p-3">
                    <CheckButton
                      checked={isSelected}
                      onChange={(val) => handleSelect(index, val)}
                      filled={Colors.primary}
                      strokeColor={Colors.primary}
                    />
                  </td>
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
            onConfirm(
              rows
                .filter((r) => r.selected)
                .map((row) => {
                  const { selected, ...rest } = row;
                  void selected;
                  return rest;
                }),
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
