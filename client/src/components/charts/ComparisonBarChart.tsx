import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface BarPoint {
  name: string;
  target?: number;
  actual?: number;
  capacity?: number;
}

interface ComparisonBarChartProps {
  data?: BarPoint[];
  height?: number;
  isDark?: boolean;
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  data,
  height = 240,
  isDark = false,
}) => {
  const chartData: BarPoint[] = data || [
    { name: 'Panaji Urban', target: 20, actual: 22.4 },
    { name: 'Miramar Feeder', target: 15, actual: 16.8 },
    { name: 'Margao South', target: 30, actual: 28.5 },
    { name: 'Mapusa North', target: 12, actual: 14.1 },
    { name: 'Vasco Port', target: 18, actual: 17.5 },
  ];

  const gridColor = isDark ? '#2D3640' : '#E3DED2';
  const textColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="name" stroke={textColor} tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis stroke={textColor} tick={{ fontSize: 11 }} tickLine={false} unit=" kW" />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#171D22' : '#FFFFFF',
              borderColor: isDark ? '#2D3640' : '#E3DED2',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="target" name="Target DR (kW)" fill="#7F9565" radius={[4, 4, 0, 0]} />
          <Bar dataKey="actual" name="Achieved DR (kW)" fill="#368F8A" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
