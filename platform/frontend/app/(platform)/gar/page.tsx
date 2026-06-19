export default function GarPage() {
  const garPct = 34.2
  const items = [
    { label: 'Yenilenebilir Enerji Kredileri', tl: '2.4 milyar', eligible: true },
    { label: 'Yeşil Bina Finansmanı', tl: '890 milyon', eligible: true },
    { label: 'Elektrikli Araç Kredileri', tl: '340 milyon', eligible: true },
    { label: 'Çevre Dostu Tarım', tl: '210 milyon', eligible: true },
    { label: 'Standart Konut Kredileri', tl: '5.1 milyar', eligible: false },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>BDDK GAR Analizi</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Yeşil Varlık Oranı — AB Taksonomisi uyumlu varlıkların portföy içindeki payı
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border col-span-1" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Mevcut GAR</p>
          <p className="text-4xl font-black" style={{ color: 'var(--green-700)' }}>{garPct}%</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Hedef: 40% (2026)</p>
          <div className="mt-3 w-full rounded-full h-3" style={{ background: 'var(--green-100)' }}>
            <div className="h-3 rounded-full" style={{ width: `${garPct}%`, background: 'var(--green-600)' }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Yeşil Varlıklar</p>
          <p className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>3,84 milyar TL</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>AB Taksonomisi uyumlu</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Toplam Varlıklar</p>
          <p className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>11,23 milyar TL</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Tüm portföy</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)', background: 'var(--green-50)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--green-900)' }}>Varlık Dökümü</p>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {items.map(item => (
            <div key={item.label} className="px-5 py-3.5 flex items-center gap-4">
              <span className="text-base">{item.eligible ? '✅' : '⬜'}</span>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{item.label}</p>
              </div>
              <p className="text-sm font-bold" style={{ color: item.eligible ? 'var(--green-700)' : 'var(--muted-foreground)' }}>
                {item.tl}
              </p>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={item.eligible
                  ? { background: 'var(--green-100)', color: 'var(--green-800)' }
                  : { background: '#F5F5F5', color: '#757575' }}>
                {item.eligible ? 'Uyumlu' : 'Uyumsuz'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
