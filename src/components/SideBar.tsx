'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Bars3BottomLeftIcon,
  Bars3BottomRightIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SquaresPlusIcon,
  Square3Stack3DIcon,
  ChartBarIcon,
  ChevronDownIcon,
  TagIcon,
  UsersIcon,
  PresentationChartBarIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { usePathname, useRouter } from 'next/navigation';
import '@/styles/globals.css';
import theme from '@/styles/styles';
import Avatar from '@/components/Avatar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/sdkConfig';

interface SubMenuItem {
  name: string;
  route: string;
}

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  route: string;
  subItems?: SubMenuItem[];
  color?: string;
}

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | undefined>();

  const router = useRouter();
  const pathname = usePathname();
  const { user, token } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isOpen) setOpenSubmenu(null);
  };

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!token || !user?.sub) return;

      try {
        const profile = await api.user.getProfile(user.sub, token);
        setProfilePicture(profile.profile?.profilePicture || '');
      } catch (err) {
        console.error('Error al obtener la imagen de perfil:', err);
      }
    };

    fetchProfilePicture();
  }, [token, user]);

  const generalMenuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      icon: <SquaresPlusIcon className="h-6 w-6" />,
      route: '/dashboard',
    },
    {
      name: 'Inventario',
      icon: <Square3Stack3DIcon className="h-6 w-6" />,
      route: '/inventory',
      subItems: [
        { name: 'Productos', route: '/products' },
        { name: 'Categorías', route: '/categories' },
      ],
    },
    {
      name: 'Órdenes',
      icon: <ChartBarIcon className="h-6 w-6" />,
      route: '/orders',
      subItems: [
        { name: 'Listado', route: '/orders/list' },
        { name: 'Reembolsos', route: '/orders/refunds' },
        { name: 'Asignación', route: '/orders/assign' },
      ],
    },
    {
      name: 'Promos y cupones',
      icon: <TagIcon className="h-6 w-6" />,
      route: '/promos',
    },
    {
      name: 'Sucursales',
      icon: <BuildingStorefrontIcon className="h-6 w-6" />,
      route: '/branches',
    },
    {
      name: 'Usuarios',
      icon: <UsersIcon className="h-6 w-6" />,
      route: '/users',
    },
  ];

  const reportMenuItems: MenuItem[] = [
    {
      name: 'Reportes',
      icon: <PresentationChartBarIcon className="h-6 w-6" />,
      route: '/reports',
      color: 'text-gray-400 hover:bg-[#5E6780] hover:text-white',
    },
  ];

  const otherMenuItems: MenuItem[] = [
    {
      name: 'Configuración',
      icon: <Cog6ToothIcon className="h-6 w-6" />,
      route: '/settings',
      color: 'text-gray-400 hover:bg-[#5E6780] hover:text-white',
    },
    {
      name: 'Cerrar sesión',
      icon: <ArrowRightOnRectangleIcon className="h-6 w-6" />,
      route: '/logout',
      color: 'text-red-400 hover:bg-[#5E6780] hover:text-white',
    },
  ];

  const handleNavigation = (route: string) => {
    router.push(route);
    setOpenSubmenu(null);
  };

  return (
    <div
      className={`flex h-auto flex-col overflow-hidden transition-all duration-500 ease-out ${isOpen ? 'w-[300px]' : 'w-[85px]'}`}
      style={{ backgroundColor: theme.Colors.primary }}
    >
      {/* Header: Logo and toggle button */}
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
          className={`absolute top-4 text-white transition-all duration-300 ease-out ${isOpen ? 'right-4' : 'left-1/2 -translate-x-1/2'}`}
        >
          {isOpen ? (
            <Bars3BottomLeftIcon className="h-6 w-6" />
          ) : (
            <Bars3BottomRightIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto transition-all duration-300 ease-out">
        <div className={`my-4 px-4 ${!isOpen ? 'mt-20' : ''}`}>
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

          <nav className="mt-4 flex flex-col gap-2 transition-all duration-300 ease-out">
            {generalMenuItems.map((item) => {
              const isActive =
                (item.subItems &&
                  item.subItems.some((sub) => pathname === sub.route)) ||
                (!item.subItems && pathname === item.route);
              return (
                <div key={item.name}>
                  {isOpen ? (
                    <div
                      className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-2 transition-all duration-300 ease-out ${
                        isActive
                          ? 'bg-[#5E6780] text-white'
                          : 'text-gray-400 hover:bg-[#5E6780] hover:text-white'
                      }`}
                      onClick={() =>
                        item.subItems
                          ? setOpenSubmenu(
                              openSubmenu === item.name ? null : item.name,
                            )
                          : handleNavigation(item.route)
                      }
                    >
                      {item.icon}
                      <span>{item.name}</span>
                      {item.subItems && (
                        <ChevronDownIcon className="ml-auto h-5 w-5 transition-all duration-300 ease-out" />
                      )}
                    </div>
                  ) : (
                    <div
                      className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-md transition-all duration-300 ease-out ${
                        isActive
                          ? 'bg-[#5E6780] text-white'
                          : 'text-gray-400 hover:bg-[#5E6780] hover:text-white'
                      }`}
                      onClick={() =>
                        item.subItems
                          ? setOpenSubmenu(
                              openSubmenu === item.name ? null : item.name,
                            )
                          : handleNavigation(item.route)
                      }
                    >
                      {item.icon}
                    </div>
                  )}

                  {isOpen && item.subItems && openSubmenu === item.name && (
                    <div className="ml-6 flex flex-col gap-2 transition-all duration-300 ease-out">
                      {item.subItems.map((sub, index) => {
                        const isSubActive = pathname === sub.route;
                        return (
                          <div
                            key={`${sub.name}-${index}`}
                            className={`cursor-pointer rounded-md px-4 py-2 transition-all duration-300 ease-out ${
                              isSubActive
                                ? 'bg-[#5E6780] text-white'
                                : 'text-gray-400 hover:bg-[#5E6780] hover:text-white'
                            }`}
                            onClick={() => handleNavigation(sub.route)}
                          >
                            {sub.name}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Reportes */}
        {isOpen && (
          <h2
            className="px-4 transition-all duration-300 ease-out"
            style={{
              fontSize: `${theme.FontSizes.b1.size}px`,
              lineHeight: `${theme.FontSizes.b1.lineHeight}px`,
              color: theme.Colors.menuWhite,
            }}
          >
            Reportes y estadísticas
          </h2>
        )}
        <nav className="my-4 flex flex-col gap-2 px-4 transition-all duration-300 ease-out">
          {reportMenuItems.map((item) => {
            const isActive = pathname === item.route;
            return (
              <div
                key={item.name}
                className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-2 transition-all duration-300 ease-out ${item.color} ${
                  isActive ? 'bg-[#5E6780] text-white' : ''
                }`}
                onClick={() => handleNavigation(item.route)}
              >
                {item.icon}
                {isOpen && <span>{item.name}</span>}
              </div>
            );
          })}
        </nav>

        {/* Otros */}
        {isOpen && (
          <h2
            className="px-4 transition-all duration-300 ease-out"
            style={{
              fontSize: `${theme.FontSizes.b1.size}px`,
              lineHeight: `${theme.FontSizes.b1.lineHeight}px`,
              color: theme.Colors.menuWhite,
            }}
          >
            Otros
          </h2>
        )}
        <nav className="mt-4 flex flex-col gap-2 px-4 transition-all duration-300 ease-out">
          {otherMenuItems.map((item) => {
            const isActive = pathname === item.route;
            return (
              <div
                key={item.name}
                className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-2 transition-all duration-300 ease-out ${item.color} ${
                  isActive ? 'bg-[#5E6780] text-white' : ''
                }`}
                onClick={() => handleNavigation(item.route)}
              >
                {item.icon}
                {isOpen && <span>{item.name}</span>}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Avatar */}
      <div className="mt-auto p-4 transition-all duration-300 ease-out">
        {isOpen && user && (
          <div className="flex items-center gap-3">
            <Avatar
              name={user.name}
              imageUrl={profilePicture}
              size={48}
              withDropdown={true}
              dropdownOptions={[{ label: 'Perfil', route: '/admin/profile' }]}
            />
            <div className="text-sm text-white">
              <p className="font-bold">{user.name}</p>
              <p>{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
