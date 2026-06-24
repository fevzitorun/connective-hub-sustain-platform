import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface RadarData {
  metric: string;
  Sirket: number;
  Ortalama: number;
  EnIyi: number;
  tip: string;
}

interface BenchmarkRadarChartProps {
  data: RadarData[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-4 rounded-lg shadow-xl border border-slate-700 max-w-xs">
        <h4 className="font-semibold text-lg mb-2 text-blue-400">{data.metric}</h4>
        <div className="space-y-1 mb-3 text-sm">
          <p><span className="text-slate-400">Şirket:</span> {data.Sirket}</p>
          <p><span className="text-slate-400">Sektör Ortalaması:</span> {data.Ortalama}</p>
          <p><span className="text-slate-400">En İyi %10:</span> {data.EnIyi}</p>
        </div>
        <div className="bg-blue-900/50 p-2 rounded border border-blue-800/50">
          <p className="text-xs text-blue-200">
            <span className="font-bold text-yellow-400">💡 Hızlı Tavsiye: </span>
            {data.tip}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const BenchmarkRadarChart: React.FC<BenchmarkRadarChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[400px] bg-slate-950 rounded-xl p-4 border border-slate-800 shadow-2xl">
      <h3 className="text-white text-xl font-bold mb-4 text-center">Sektörel Benchmark Analizi</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          <Radar
            name="Sektör Ortalaması"
            dataKey="Ortalama"
            stroke="#64748b"
            fill="#64748b"
            fillOpacity={0.3}
          />
          <Radar
            name="En İyi %10"
            dataKey="EnIyi"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.1}
            strokeDasharray="3 3"
          />
          <Radar
            name="Şirket Skoru"
            dataKey="Sirket"
            stroke="#3b82f6"
            fill="#0F172A" /* Sustain Mavi */
            fillOpacity={0.8}
            strokeWidth={3}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BenchmarkRadarChart;
