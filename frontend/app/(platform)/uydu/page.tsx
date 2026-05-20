export default function UyduPage() {
  const risks = [
    { icon: '🌊', label: 'Sel Riski', value: 'Orta', score: 55, color: '#FF9800' },
    { icon: '🏔️', label: 'Deprem Bölgesi', value: '1. Bölge', score: 80, color: '#F44336' },
    { icon: '🌵', label: 'Kuraklık Riski', value: 'Düşük', score: 20, color: '#4CAF50' },
    { icon: '🌿', label: 'NDVI Skoru', value: '0.42', score: 42, color: '#2E7D32' },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>Uydu & İklim Riski</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          TCFD fiziksel risk analizi — uydu görüntüleri + küresel iklim modelleri
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {risks.map(r => (
          <div key={r.label} className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{r.icon}</span>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{r.label}</p>
                <p className="text-lg font-black" style={{ color: 'var(--green-900)' }}>{r.value}</p>
              </div>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: 'var(--green-100)' }}>
              <div className="h-2 rounded-full" style={{ width: `${r.score}%`, background: r.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
        <div className="px-5 py-3 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--border)', background: 'var(--green-50)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--green-900)' }}>Tesis Konumu</p>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>Demo</span>
        </div>
        <div className="h-64 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, var(--green-100) 0%, var(--green-50) 100%)' }}>
          <div className="text-center">
            <span className="text-4xl block mb-2">🛰️</span>
            <p className="text-sm font-medium" style={{ color: 'var(--green-700)' }}>
              Uydu haritası entegrasyonu
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Mapbox / Google Maps API bağlanacak
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
