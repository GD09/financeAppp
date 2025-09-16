import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../index';

// FIX: Added an index signature to the ChartData interface to satisfy the type
// requirements of the 'recharts' Pie component data prop. This resolves a
// TypeScript error about a missing index signature.
interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface CategoryChartProps {
  data: ChartData[];
  formatCurrency: (amount: number) => string;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', 
  '#FF1970', '#19D4FF', '#FFD419', '#19FFAF', '#7019FF'
];

const CategoryChart: React.FC<CategoryChartProps> = ({ data, formatCurrency }) => {
  const { theme } = useTheme();

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: theme === 'light' ? '#ffffff' : '#2D2D2D',
              borderColor: theme === 'light' ? '#e5e7eb' : '#3D3D3D',
              color: theme === 'light' ? '#111827' : '#f9fafb',
              borderRadius: '0.5rem',
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend wrapperStyle={{ color: theme === 'light' ? '#374151' : '#d1d5db', fontSize: '14px' }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;