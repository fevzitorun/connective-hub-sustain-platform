'use client'
import { useState } from 'react'

export function SatelliteWidget() {
  const [location, setLocation] = useState<'zurich' | 'kocaeli'>('zurich')

  const data = {
    zurich: {
      title: 'Switzerland, Zurich · Headquarters',
      lat: '47.3769° N',
      lng: '8.5417° E',
      risks: [
        { icon: '🌊', name: 'SEL RİSKİ', level: 'Düşük', color: '#388E3C' },
        { icon: '🏔️', name: 'DEPREM', level: '4. Bölge', color: '#388E3C' },
        { icon: '☀️', name: 'KURAKLIK', level: 'Düşük', color: '#388E3C' },
      ],
      dotColor: '#44ff44',
      gradient: 'linear-gradient(135deg, #1a2a1a 0%, #2d4a2d 40%, #1f3d2f 100%)'
    },
    kocaeli: {
      title: 'Türkiye, Kocaeli · Factory',
      lat: '40.7654° N',
      lng: '29.9408° E',
      risks: [
        { icon: '🌊', name: 'SEL RİSKİ', level: 'Orta', color: '#F57F17' },
        { icon: '🏔️', name: 'DEPREM', level: '1. Bölge', color: '#C62828' },
        { icon: '☀️', name: 'KURAKLIK', level: 'Düşük', color: '#388E3C' },
      ],
      dotColor: '#ff4444',
      gradient: 'linear-gradient(135deg, #2a1a1a 0%, #4a2d2d 40%, #3d1f1f 100%)'
    }
  }

  const current = data[location]

  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <div className="flex justify-between items-center mb-1">
        <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
          Uydu Fiziksel Risk
        </div>
        <select 
          value={location} 
          onChange={(e) => setLocation(e.target.value as 'zurich' | 'kocaeli')}
          className="text-xs border rounded px-1 py-0.5"
        >
          <option value="zurich">Zurich HQ</option>
          <option value="kocaeli">Kocaeli Factory</option>
        </select>
      </div>
      <div className="text-xs mb-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>
        {current.title}
      </div>
      <div
        className="relative rounded-lg overflow-hidden flex items-center justify-center h-36 mb-3 transition-all"
        style={{ background: current.gradient }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,255,100,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,100,.3) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="w-4 h-4 rounded-full border-2 border-white z-10 relative transition-colors"
          style={{ background: current.dotColor, boxShadow: `0 0 0 8px ${current.dotColor}40` }} />
        <div className="absolute bottom-2 left-3 text-xs rounded px-2 py-0.5"
          style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.8)' }}>
          NASA/ESA · May 2026
        </div>
        <div className="absolute top-2 right-3 text-xs font-mono"
          style={{ color: 'rgba(100,255,150,0.8)' }}>
          {current.lat}<br />{current.lng}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {current.risks.map(({ icon, name, level, color }) => (
          <div key={name} className="rounded-lg p-2.5 text-center"
            style={{ background: 'var(--muted)' }}>
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', fontSize: '9px' }}>
              {name}
            </div>
            <div className="text-xs font-bold mt-0.5" style={{ color }}>{level}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
