export default function EsgPage() {
  const pillars = [
    {
      key: 'E', label: 'Çevre', icon: '🌿', score: 78,
      items: ['Karbon emisyonları: 16.920 ton CO₂e', 'Su tüketimi: 45.200 m³', 'Atık geri dönüşüm: %67', 'Yenilenebilir enerji: %34'],
    },
    {
      key: 'S', label: 'Sosyal', icon: '👥', score: 82,
      items: ['Toplam çalışan: 1.240', 'Kadın yönetici: %38', 'Eğitim saati/kişi: 42 saat', 'İş kazası sıklık hızı: 1.2'],
    },
    {
      key: 'G', label: 'Yönetim', icon: '🏛️', score: 71,
      items: ['Bağımsız üye: %45', 'Sürd. komitesi: Var', 'ESG hedefleri yönetici KPI\'sında: Hayır', 'TSRS denetimi: Sınırlı güvence'],
    },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>ESG Performans Panosu</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Çevre · Sosyal · Yönetim — GRI Universal Standards 2021
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {pillars.map(p => (
          <div key={p.key} className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <div className="px-5 py-4" style={{ background: 'var(--green-900)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{p.icon}</span>
                <span className="text-2xl font-black text-white">{p.score}</span>
              </div>
              <p className="text-white font-bold">{p.label}</p>
              <div className="mt-2 w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <div className="h-1.5 rounded-full bg-white" style={{ width: `${p.score}%` }} />
              </div>
            </div>
            <div className="p-4 space-y-2">
              {p.items.map(item => (
                <p key={item} className="text-xs" style={{ color: 'var(--muted-foreground)' }}>• {item}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
