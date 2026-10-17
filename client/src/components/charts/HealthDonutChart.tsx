import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface HealthSlice {
  name: string;
  value: number;
  color: string;
}

interface HealthDonutChartProps {
  data?: HealthSlice[];
  height?: number;
}

export const HealthDonutChart: React.FC<HealthDonutChartProps> = ({ data, height = 220 }) => {
  const chartData: HealthSlice[] = data || [
    { name: 'Normal', value: 24, color: '#24845B' },
    { name: 'Watch', value: 12, color: '#368F8A' },
    { name: 'Warning', value: 8, color: '#E5A23D' },
    { name: 'Critical', value: 3, color: '#D94F45' },
    { name: 'Offline', value: 1, color: '#9CA3AF' },
  ];

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any) => [`${value} Transformers`, 'Count']}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E3DED2',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
