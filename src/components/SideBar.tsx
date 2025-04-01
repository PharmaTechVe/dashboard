'use client';
import { useState } from 'react';
import {
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  SquaresPlusIcon,
  Square3Stack3DIcon,
  ChartBarIcon,
  ChevronDownIcon,
  TagIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import '@/styles/globals.css';
import Image from 'next/image';
import theme from '@/styles/styles';
import Avatar from '@/components/Avatar';
import Link from 'next/link';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('Productos');
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleMenu = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
    setActiveItem(menuName);
  };

  // Menú "General"
  const generalMenuItems = [
    {
      name: 'Dashboard',
      icon: <SquaresPlusIcon className="h-6 w-6" />,
      href: '/home',
    },
    {
      name: 'Inventario',
      icon: <Square3Stack3DIcon className="h-6 w-6" />,
      subItems: [
        { name: 'Productos', href: '/products' },
        { name: 'Categorías', href: '/categories' },
      ],
    },
    {
      name: 'Órdenes',
      icon: <ChartBarIcon className="h-6 w-6" />,
      subItems: [
        { name: 'Listado', href: '/orders' },
        { name: 'Reembolsos', href: '/refunds' },
        { name: 'Asignación', href: '/assignments' },
      ],
    },
    {
      name: 'Promos y cupones',
      icon: <TagIcon className="h-6 w-6" />,
      href: '/promotions',
    },
    {
      name: 'Usuarios',
      icon: <UsersIcon className="h-6 w-6" />,
      href: '/users',
    },
  ];

  /*const reportMenuItems = [
    {
      name: 'Reportes',
      icon: <PresentationChartBarIcon className="h-6 w-6" />,
      color: 'text-gray-400 hover:bg-[#5E6780] hover:text-white',
      href: '/reports',
    },
  ];*/

  // Menú "Otros"
  /*const otherMenuItems = [
    {
      name: 'Configuración',
      icon: <Cog6ToothIcon className="h-6 w-6" />,
      color: 'text-gray-400 hover:bg-[#5E6780] hover:text-white',
      href: '/settings',
    },
    {
      name: 'Cerrar sesión',
      icon: <ArrowRightOnRectangleIcon className="h-6 w-6" />,
      color: 'text-red-400 hover:bg-[#5E6780] hover:text-white',
      onClick: () => console.log('Cerrar sesión'),
    },
  ];*/

  return (
    <div
      className={`flex h-auto flex-col overflow-hidden transition-all duration-500 ease-out ${isOpen ? 'w-[300px]' : 'w-[85px]'} `}
      style={{ backgroundColor: theme.Colors.primary }}
    >
      {}
      <div className="relative p-4">
        {isOpen && (
          <div className="flex justify-center">
            <Image
              src="/images/logo-horizontal.svg"
              alt="PharmaTech Logo"
              width={180}
              height={72}
              className="h-auto"
            />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={`absolute top-4 text-white transition-all duration-300 ease-out ${
            isOpen ? 'right-4' : 'left-1/2 mb-8 -translate-x-1/2'
          }`}
        >
          {isOpen ? (
            <Bars3BottomLeftIcon className="h-6 w-6" />
          ) : (
            <Bars3BottomRightIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      {}
      <div className="flex-1 overflow-y-auto transition-all duration-300 ease-out">
        <div className={`my-4 px-4 ${!isOpen ? 'mt-20' : ''}`}>
          {}
          {isOpen && (
            <h2
              className="px-4 transition-all duration-300 ease-out"
              style={{
                fontSize: `${theme.FontSizes.b1.size}px`,
                lineHeight: `${theme.FontSizes.b1.lineHeight}px`,
                color: theme.Colors.menuWhite,
              }}
            >
              General
            </h2>
          )}

          {/* Menú "General" */}
          <nav className="mt-4 flex flex-col gap-2 transition-all duration-300 ease-out">
            {generalMenuItems.map((item) => (
              <div key={item.name}>
                {item.href ? (
                  <Link href={item.href}>
                    <div
                      className={`flex items-center gap-3 rounded-md px-4 py-2 transition-all duration-300 ease-out ${
                        activeItem === item.name
                          ? 'bg-[#5E6780] text-white'
                          : 'text-gray-400 hover:bg-[#5E6780] hover:text-white'
                      }`}
                      onClick={() => setActiveItem(item.name)}
                    >
                      {item.icon}
                      {isOpen && <span>{item.name}</span>}
                    </div>
                  </Link>
                ) : (
                  <>
                    <div
                      className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-2 transition-all duration-300 ease-out ${
                        activeItem === item.name
                          ? 'bg-[#5E6780] text-white'
                          : 'text-gray-400 hover:bg-[#5E6780] hover:text-white'
                      }`}
                      onClick={() => toggleMenu(item.name)}
                    >
                      {item.icon}
                      {isOpen && (
                        <>
                          <span>{item.name}</span>
                          <ChevronDownIcon
                            className={`ml-auto h-5 w-5 transition-transform duration-300 ${
                              expandedMenu === item.name ? 'rotate-180' : ''
                            }`}
                          />
                        </>
                      )}
                    </div>

                    {isOpen && expandedMenu === item.name && item.subItems && (
                      <div className="ml-6 flex flex-col gap-2 transition-all duration-300 ease-out">
                        {item.subItems.map((subItem) => (
                          <Link href={subItem.href} key={subItem.name}>
                            <div
                              className={`cursor-pointer rounded-md px-4 py-2 transition-all duration-300 ease-out ${
                                activeItem === subItem.name
                                  ? 'bg-[#5E6780] text-white'
                                  : 'text-gray-400 hover:bg-[#5E6780] hover:text-white'
                              }`}
                              onClick={() => setActiveItem(subItem.name)}
                            >
                              {subItem.name}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </nav>
        </div>

        {}
        {}
      </div>

      {}
      <div className="mt-auto p-4 transition-all duration-300 ease-out">
        {isOpen && (
          <div className="flex items-center gap-3">
            <Avatar name="John Doe" size={48} withDropdown={false} />
            <div
              className="text-sm transition-all duration-300 ease-out"
              style={{
                color: theme.Colors.stroke,
                fontSize: `${theme.FontSizes.b3.size}px`,
                lineHeight: `${theme.FontSizes.b3.lineHeight}px`,
              }}
            >
              <p className="font-bold">John Doe</p>
              <p>user@pharmatech.com</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
