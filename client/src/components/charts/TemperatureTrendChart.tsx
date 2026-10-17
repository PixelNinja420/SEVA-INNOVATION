import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

interface TempPoint {
  time: string;
  oilTemp: number;
  windingTemp: number;
  ambientTemp: number;
}

interface TemperatureTrendChartProps {
  data?: TempPoint[];
  height?: number;
  isDark?: boolean;
}

export const TemperatureTrendChart: React.FC<TemperatureTrendChartProps> = ({
  data,
  height = 240,
  isDark = false,
}) => {
  const chartData: TempPoint[] =
    data || [
      { time: '14:00', oilTemp: 55, windingTemp: 60, ambientTemp: 34 },
      { time: '15:00', oilTemp: 58, windingTemp: 64, ambientTemp: 35 },
      { time: '16:00', oilTemp: 64, windingTemp: 71, ambientTemp: 34.5 },
      { time: '17:00', oilTemp: 72, windingTemp: 79, ambientTemp: 33.8 },
      { time: '17:30', oilTemp: 79, windingTemp: 86, ambientTemp: 33.5 },
      { time: '18:00', oilTemp: 84, windingTemp: 92, ambientTemp: 33.0 },
      { time: '18:30', oilTemp: 88.5, windingTemp: 96.2, ambientTemp: 32.8 },
      { time: '19:00', oilTemp: 85, windingTemp: 91, ambientTemp: 32.0 },
    ];

  const gridColor = isDark ? '#2D3640' : '#E3DED2';
  const textColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="oilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E56F59" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#E56F59" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="windingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D94F45" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#D94F45" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis dataKey="time" stroke={textColor} tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis stroke={textColor} tick={{ fontSize: 11 }} tickLine={false} unit="°C" domain={[20, 110]} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#171D22' : '#FFFFFF',
              borderColor: isDark ? '#2D3640' : '#E3DED2',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />

          {/* IEEE Warning & Critical Thermal Limits */}
          <ReferenceLine
            y={85}
            label={{ value: 'Warning: 85°C', fill: '#E5A23D', fontSize: 10, position: 'insideTopRight' }}
            stroke="#E5A23D"
            strokeDasharray="3 3"
          />
          <ReferenceLine
            y={95}
            label={{ value: 'Critical Trip: 95°C', fill: '#D94F45', fontSize: 10, position: 'insideTopRight' }}
            stroke="#D94F45"
            strokeDasharray="3 3"
          />

          <Area
            type="monotone"
            dataKey="windingTemp"
            name="Winding Temp (°C)"
            stroke="#D94F45"
            fillOpacity={1}
            fill="url(#windingGrad)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="oilTemp"
            name="Top-Oil Temp (°C)"
            stroke="#E56F59"
            fillOpacity={1}
            fill="url(#oilGrad)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
