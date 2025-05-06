'use client';

import React from 'react';
import { Colors } from '@/styles/styles';

interface StatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  prefix?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  previousValue,
  prefix,
}) => {
  const diff = previousValue !== undefined ? value - previousValue : null;
  const diffText =
    diff !== null
      ? `${diff > 0 ? '+' : ''}${diff} respecto al periodo anterior`
      : null;

  const diffColor =
    diff !== null
      ? diff > 0
        ? Colors.semanticSuccess
        : Colors.semanticDanger
      : Colors.textMain;

  return (
    <div className="w-full rounded-xl bg-white p-6 shadow-md">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="mt-2 text-2xl font-bold" style={{ color: Colors.primary }}>
        {prefix} {value}
      </h2>
      {diffText && (
        <p className="mt-1 text-sm" style={{ color: diffColor }}>
          {diffText}
        </p>
      )}
    </div>
  );
};

export default StatCard;
