'use client';

import React from 'react';

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
    <div className="w-full rounded-md bg-gray-50 p-2">
      <table className="w-full table-auto text-sm">
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} className="border-b last:border-0">
              {columns.map((col, colIdx) => (
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
