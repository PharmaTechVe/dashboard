import React from 'react';

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  description?: string;
  customColors?: {
    headerBg?: string;
    headerText?: string;
    rowBorder?: string;
  };
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
}

const Table = <T,>({
  data,
  columns,
  title,
  description,
  customColors,
  onEdit,
  onView,
}: TableProps<T>) => {
  return (
    <div className="w-full overflow-hidden rounded-lg shadow-lg">
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      {description && <p className="text-sm text-gray-600">{description}</p>}
      <table className="w-full border-collapse">
        <thead
          className={`${customColors?.headerBg || 'bg-gray-200'} ${customColors?.headerText || 'text-black'}`}
        >
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className="border px-4 py-2">
                {column.label}
              </th>
            ))}
            {onEdit || onView ? (
              <th className="border px-4 py-2">Acciones</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className={`${customColors?.rowBorder || 'border-gray-200'} border-b`}
            >
              {columns.map((column) => (
                <td key={String(column.key)} className="border px-4 py-2">
                  {column.render
                    ? column.render(item)
                    : String(item[column.key])}
                </td>
              ))}
              {(onEdit || onView) && (
                <td className="border px-4 py-2">
                  {onView && (
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => onView(item)}
                    >
                      Ver
                    </button>
                  )}
                  {onEdit && (
                    <button
                      className="ml-2 text-green-600 hover:underline"
                      onClick={() => onEdit(item)}
                    >
                      Editar
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
