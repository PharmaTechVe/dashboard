import { useState } from 'react';
import {
  Bars3Icon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  CubeIcon,
  ChartBarIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image'; // Importar Image

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('Productos');

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { name: 'Dashboard', icon: <HomeIcon className="h-6 w-6" /> },
    {
      name: 'Inventario',
      icon: <CubeIcon className="h-6 w-6" />,
      subItems: ['Productos', 'Categorías', 'Presentaciones'],
    },
    {
      name: 'Órdenes',
      icon: <ChartBarIcon className="h-6 w-6" />,
      subItems: ['Listado', 'Reembolsos', 'Asignación'],
    },
    { name: 'Promos y cupones', icon: <CubeIcon className="h-6 w-6" /> },
    { name: 'Usuarios', icon: <CubeIcon className="h-6 w-6" /> },
    { name: 'Reportes', icon: <ChartBarIcon className="h-6 w-6" /> },
  ];

  return (
    <div
      className={`h-screen bg-[#1C2143] p-4 transition-all ${isOpen ? 'w-64' : 'w-16'}`}
    >
      {/* Logo y botón de menú */}
      <div className="mb-6 flex items-center justify-between">
        {isOpen && (
          <Image
            src="/images/logo-horizontal.svg"
            alt="PharmaTech Logo"
            width={128} // Ajusta el ancho según tus necesidades
            height={32} // Ajusta el alto según tus necesidades
            className="h-auto"
          />
        )}
        <button onClick={toggleSidebar} className="text-2xl text-white">
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Menú */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <div key={item.name}>
            <div
              className={`flex cursor-pointer items-center gap-3 rounded-md p-2 transition-all ${
                activeItem === item.name
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:bg-gray-600 hover:text-white'
              }`}
              onClick={() => setActiveItem(item.name)}
            >
              {item.icon}
              <span className={`${isOpen ? 'block' : 'hidden'}`}>
                {item.name}
              </span>
              {item.subItems && isOpen && (
                <ChevronDownIcon className="ml-auto h-5 w-5" />
              )}
            </div>
            {item.subItems && activeItem === item.name && isOpen && (
              <div className="ml-6 flex flex-col">
                {item.subItems.map((sub) => (
                  <span
                    key={sub}
                    className={`cursor-pointer rounded-md p-2 transition-all ${
                      activeItem === sub
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:bg-gray-600 hover:text-white'
                    }`}
                    onClick={() => setActiveItem(sub)}
                  >
                    {sub}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Configuración y cerrar sesión */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <div className="flex cursor-pointer items-center gap-3 rounded-md p-2 text-gray-400 hover:bg-gray-600 hover:text-white">
          <Cog6ToothIcon className="h-6 w-6" />
          <span className={`${isOpen ? 'block' : 'hidden'}`}>
            Configuración
          </span>
        </div>
        <div className="flex cursor-pointer items-center gap-3 rounded-md p-2 text-red-400 hover:bg-red-600 hover:text-white">
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
          <span className={`${isOpen ? 'block' : 'hidden'}`}>
            Cerrar sesión
          </span>
        </div>
      </div>
    </div>
  );
};
export default Sidebar;
