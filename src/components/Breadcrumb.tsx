'use client';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

//estilo base (en revision respecto a manejar las rutas)
type BreadcrumbItem = {
  label: string;
  href: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  color?: string;
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className="py-3">
      <ol className="flex items-center space-x-2 text-gray-600">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <Link href={item.href} className="hover:text-main-500">
              {item.label}
            </Link>
            {index < items.length - 1 && (
              <ChevronRightIcon className="text-main-400 mx-2 h-4 w-4" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
