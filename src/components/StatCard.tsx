'use client';

import React from 'react';
import { Colors } from '@/styles/styles';

interface StatCardProps {
  title: string;
  value: number | string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="w-full rounded-xl bg-white p-6 shadow-md">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="mt-2 text-2xl font-bold" style={{ color: Colors.primary }}>
        {value}
      </h2>
    </div>
  );
};

export default StatCard;
