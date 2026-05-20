export function SatelliteWidget() {
  const risks = [
    { icon: '🌊', name: 'SEL RİSKİ', level: 'Orta', color: '#F57F17' },
    { icon: '🏔️', name: 'DEPREM', level: '1. Bölge', color: '#C62828' },
    { icon: '☀️', name: 'KURAKLIK', level: 'Düşük', color: '#388E3C' },
  ]

  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <div className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>
        Uydu Fiziksel Risk
      </div>
      <div className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
        İstanbul, Ataşehir · 41.0°N 29.1°E
      </div>
      <div
        className="relative rounded-lg overflow-hidden flex items-center justify-center h-36 mb-3"
        style={{ background: 'linear-gradient(135deg, #1a2a1a 0%, #2d4a2d 40%, #1f3d2f 100%)' }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,255,100,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,100,.3) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
        <div className="w-4 h-4 rounded-full border-2 border-white z-10 relative"
          style={{ background: '#ff4444', boxShadow: '0 0 0 8px rgba(255,68,68,0.25)' }} />
        <div className="absolute bottom-2 left-3 text-xs rounded px-2 py-0.5"
          style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.8)' }}>
          NASA/AFAD · Mayıs 2026
        </div>
        <div className="absolute top-2 right-3 text-xs font-mono"
          style={{ color: 'rgba(100,255,150,0.8)' }}>
          41.0082° N<br />29.1042° E
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {risks.map(({ icon, name, level, color }) => (
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
