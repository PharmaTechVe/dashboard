'use client';

import React from 'react';
import { Colors } from '@/styles/styles';

export interface RowColumn<T> {
  key: string;
  render: (item: T) => React.ReactNode;
}

interface RowTableProps<T> {
  data: T[];
  columns: RowColumn<T>[];
}

const RowTable = <T,>({ data, columns }: RowTableProps<T>) => {
  return (
    <div
      className="w-full rounded-md p-2"
      style={{ backgroundColor: Colors.primary50 }}
    >
      <table className="w-full table-auto text-sm">
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} className="border-b last:border-0">
              {columns.map((col: RowColumn<T>, colIdx: number) => (
                <td key={col.key + colIdx} className="px-2 py-2 align-top">
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RowTable;
