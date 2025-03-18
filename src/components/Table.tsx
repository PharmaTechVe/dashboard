import React from 'react';

const AdminProductsTable = () => {
  return (
    <div className="rounded-md bg-white p-6 shadow-md">
      {/* Encabezado: Título, Categoría y Búsqueda */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Productos</h2>
        <div className="flex items-center gap-4">
          {/* Categorías */}
          <div className="flex flex-col">
            <label htmlFor="categorias" className="text-sm text-gray-600">
              Categorías
            </label>
            <select
              id="categorias"
              className="w-40 rounded-md border border-gray-300 p-2 text-sm text-gray-700 focus:outline-none"
            >
              <option value="Medicamentos">Medicamentos</option>
              <option value="Vitaminas">Vitaminas</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          {/* Búsqueda */}
          <div className="flex flex-col">
            <label htmlFor="buscar" className="text-sm text-gray-600">
              Buscar
            </label>
            <div className="relative">
              <input
                id="buscar"
                type="text"
                placeholder="Buscar..."
                className="w-48 rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none"
              />
              <span className="absolute right-2 top-2 text-gray-400">🔍</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse overflow-hidden rounded-md">
          <thead className="bg-[#1C2143] text-white">
            <tr>
              <th className="px-4 py-3 text-left">
                <input type="checkbox" />
              </th>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-left">Precio</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* Ejemplo de filas (repetir según tus datos) */}
            {[...Array(6)].map((_, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="px-4 py-3">
                  <input type="checkbox" />
                </td>
                <td className="px-4 py-3">001</td>
                <td className="px-4 py-3">Acetaminofén de 500mg x 10...</td>
                <td className="px-4 py-3">Medicamentos</td>
                <td className="px-4 py-3">$5.00</td>
                <td className="px-4 py-3">125</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Disponible
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="mr-2 text-gray-600">Editar</button>
                  <button className="text-gray-600">Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer: Paginación */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <p>Se muestran de 1 a 20 de 200 resultados</p>
        <div className="flex items-center gap-2">
          <span>Página</span>
          <select className="rounded border border-gray-300 p-1 text-sm">
            <option>1</option>
            <option>2</option>
            <option>3</option>
          </select>
          <button className="px-2 py-1 text-gray-600 hover:text-gray-800">
            &lt;
          </button>
          <button className="px-2 py-1 text-gray-600 hover:text-gray-800">
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsTable;
