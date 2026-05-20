export default function DesteklerPage() {
  const subsidies = [
    {
      name: 'KOSGEB Yeşil Dönüşüm Desteği',
      amount: '₺5 milyon',
      type: 'Hibe',
      deadline: '31.12.2025',
      eligible: true,
      desc: 'KOBİ\'lere yönelik karbon azaltım projeleri için geri ödemesiz destek.',
    },
    {
      name: 'Enerji Verimliliği Yatırımları (YEGM)',
      amount: '₺20 milyon',
      type: 'Hibe + Kredi',
      deadline: 'Sürekli',
      eligible: true,
      desc: 'Sanayi tesislerinde enerji verimliliği projelerinde maliyet paylaşımı.',
    },
    {
      name: 'TÜBİTAK 1507 Yeşil Teknoloji',
      amount: '₺3 milyon',
      type: 'Hibe',
      deadline: '15.09.2025',
      eligible: true,
      desc: 'Sürdürülebilir teknoloji Ar-Ge projeleri için KOBİ desteği.',
    },
    {
      name: 'AB Horizon Europe — Green Deal',
      amount: '€2 milyon',
      type: 'Hibe',
      deadline: '14.05.2026',
      eligible: false,
      desc: 'Avrupa Birliği iklim araştırma fonu (AB ortaklığı gerekli).',
    },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>Yeşil Destekler & Hibeler</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Şirket profilinize göre uygun finansman ve hibe fırsatları
        </p>
      </div>

      <div className="space-y-4">
        {subsidies.map(s => (
          <div key={s.name} className="bg-white rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: s.eligible ? 'var(--green-100)' : '#F5F5F5' }}>
                {s.eligible ? '✅' : '🔒'}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <p className="font-bold text-sm" style={{ color: 'var(--green-900)' }}>{s.name}</p>
                  <span className="text-lg font-black flex-shrink-0" style={{ color: 'var(--green-700)' }}>
                    {s.amount}
                  </span>
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>{s.desc}</p>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: 'var(--green-100)', color: 'var(--green-800)' }}>
                    {s.type}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Son başvuru: {s.deadline}
                  </span>
                  {!s.eligible && (
                    <span className="text-xs" style={{ color: '#9E9E9E' }}>Şirket profiliniz uygun değil</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl p-5"
        style={{ background: 'var(--green-50)', border: '1px solid var(--green-200)' }}>
        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--green-800)' }}>
          AI Hibe Eşleştirme Hakkında
        </p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Emisyon profili ve sektörünüze göre otomatik hibe/teşvik eşleştirmesi Pro planda aktif.
          KOSGEB, YEGM, TÜBİTAK ve AB fonları anlık takip edilmektedir.
        </p>
      </div>
    </div>
  )
}
