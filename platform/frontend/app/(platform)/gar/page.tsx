"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import BankGradeCard from '@/components/dashboard/BankGradeCard';

const garData = [
  { name: 'Ticari Kredi 1', klasik: 400000, yesil: 600000 },
  { name: 'Ticari Kredi 2', klasik: 2100000, yesil: 400000 },
  { name: 'Proje Finansmanı', klasik: 500000, yesil: 4500000 },
  { name: 'Leasing', klasik: 600000, yesil: 200000 }
];

export default function GARPage() {
  const [score] = useState(76);
  const [grade] = useState('A');

  const toplamKlasik = garData.reduce((acc, curr) => acc + curr.klasik, 0);
  const toplamYesil = garData.reduce((acc, curr) => acc + curr.yesil, 0);
  const toplamBorc = toplamKlasik + toplamYesil;
  const garOrani = ((toplamYesil / toplamBorc) * 100).toFixed(1);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Yeşil Varlık Oranı (GAR) Raporu</h1>
        <p className="text-slate-400">Bankalar ve finansal kuruluşlar için AB Taksonomisi uyumlu finansal görünümünüz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <BankGradeCard score={score} grade={grade} />
        </div>
        
        <div className="col-span-1 md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex items-center justify-around">
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-1">Toplam Finansal Borç</p>
            <p className="text-3xl font-bold text-white">₺ {(toplamBorc / 1000000).toFixed(1)}M</p>
          </div>
          <div className="w-px h-16 bg-slate-800"></div>
          <div className="text-center">
            <p className="text-green-400/80 text-sm mb-1">Yeşil Finansman Payı</p>
            <p className="text-3xl font-bold text-green-400">₺ {(toplamYesil / 1000000).toFixed(1)}M</p>
          </div>
          <div className="w-px h-16 bg-slate-800"></div>
          <div className="text-center">
            <p className="text-blue-400/80 text-sm mb-1">GAR (Green Asset Ratio)</p>
            <p className="text-4xl font-bold text-blue-400">%{garOrani}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl h-[450px]">
        <h3 className="text-lg font-semibold text-white mb-6">Finansman Kalemleri Yeşil Pay Analizi</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={garData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" tickFormatter={(value) => `₺${value/1000000}M`} />
            <Tooltip 
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
              formatter={(value) => [`₺ ${(value as number).toLocaleString()}`, undefined]}
            />
            <Legend />
            <Bar name="Klasik Finansman" dataKey="klasik" stackId="a" fill="#475569" radius={[0, 0, 4, 4]} />
            <Bar name="Yeşil Finansman (Taxonomy Aligned)" dataKey="yesil" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
