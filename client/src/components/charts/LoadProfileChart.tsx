import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

interface DataPoint {
  time: string;
  loadKW: number;
  capacityKW: number;
  solarKW?: number;
  forecastKW?: number;
}

interface LoadProfileChartProps {
  data?: DataPoint[];
  capacityKW?: number;
  showSolar?: boolean;
  showForecast?: boolean;
  height?: number;
  isDark?: boolean;
}

export const LoadProfileChart: React.FC<LoadProfileChartProps> = ({
  data,
  capacityKW = 100,
  showSolar = true,
  showForecast = true,
  height = 280,
  isDark = false,
}) => {
  // Generate realistic 24h curve if data not provided
  const chartData: DataPoint[] =
    data ||
    [
      { time: '14:00', loadKW: 52, capacityKW, solarKW: 45 },
      { time: '15:00', loadKW: 56, capacityKW, solarKW: 42 },
      { time: '16:00', loadKW: 64, capacityKW, solarKW: 35 },
      { time: '17:00', loadKW: 75, capacityKW, solarKW: 20 },
      { time: '17:30', loadKW: 84, capacityKW, solarKW: 10 },
      { time: '18:00', loadKW: 92, capacityKW, solarKW: 4 },
      { time: '18:15', loadKW: 96, capacityKW, solarKW: 2 },
      { time: '18:30', loadKW: 98.4, capacityKW, solarKW: 0, forecastKW: 108.5 },
      { time: '18:45', loadKW: 95, capacityKW, solarKW: 0, forecastKW: 104 },
      { time: '19:00', loadKW: 91, capacityKW, solarKW: 0, forecastKW: 99 },
      { time: '19:30', loadKW: 82, capacityKW, solarKW: 0, forecastKW: 88 },
      { time: '20:00', loadKW: 74, capacityKW, solarKW: 0, forecastKW: 79 },
    ];

  const gridColor = isDark ? '#2D3640' : '#E3DED2';
  const textColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="time"
            stroke={textColor}
            tick={{ fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            stroke={textColor}
            tick={{ fontSize: 11 }}
            tickLine={false}
            unit=" kW"
            domain={[0, Math.ceil(capacityKW * 1.25)]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#171D22' : '#FFFFFF',
              borderColor: isDark ? '#2D3640' : '#E3DED2',
              borderRadius: '8px',
              color: isDark ? '#FFFFFF' : '#191919',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px' }}
          />

          {/* Rated Capacity Threshold */}
          <ReferenceLine
            y={capacityKW}
            label={{
              value: `Rated: ${capacityKW} kW`,
              fill: '#D94F45',
              fontSize: 11,
              position: 'insideTopRight',
            }}
            stroke="#D94F45"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />

          {/* Actual Load Curve */}
          <Line
            type="monotone"
            dataKey="loadKW"
            name="Actual Load"
            stroke="#7F9565"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#7F9565' }}
            activeDot={{ r: 5 }}
          />

          {/* Rooftop Solar Duck Curve */}
          {showSolar && (
            <Line
              type="monotone"
              dataKey="solarKW"
              name="Rooftop Solar"
              stroke="#E5A23D"
              strokeWidth={2}
              strokeDasharray="2 2"
              dot={false}
            />
          )}

          {/* AI LightGBM Forecast Line */}
          {showForecast && (
            <Line
              type="monotone"
              dataKey="forecastKW"
              name="AI 15m Forecast"
              stroke="#E56F59"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#E56F59' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
