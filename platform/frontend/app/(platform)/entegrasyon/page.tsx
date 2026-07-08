'use client'
import { Header } from '@/components/layout/Header'

const integrations = [
  {
    id: 'sap',
    name: 'SAP S/4HANA',
    category: 'ERP',
    description: 'SAP sustainability module ile emisyon verilerini otomatik çek',
    status: 'mevcut',
    icon: '🔵',
    docs: 'SAP BTP API',
  },
  {
    id: 'logo',
    name: 'Logo Tiger 3',
    category: 'ERP',
    description: 'Logo muhasebe sistemi üzerinden fatura bazlı emisyon hesapla',
    status: 'mevcut',
    icon: '🟠',
    docs: 'Logo REST API',
  },
  {
    id: 'eta',
    name: 'ETA Muhasebe',
    category: 'ERP',
    description: 'ETA entegrasyonu ile satın alma verilerinden Kapsam 3 hesapla',
    status: 'yakında',
    icon: '🟣',
    docs: 'ETA API',
  },
  {
    id: 'mikro',
    name: 'Mikro ERP',
    category: 'ERP',
    description: 'Mikro enerji tüketim verileri senkronizasyonu',
    status: 'yakında',
    icon: '🔴',
    docs: 'Mikro API',
  },
  {
    id: 'tedas',
    name: 'TEDAŞ e-Sayaç',
    category: 'Enerji',
    description: 'Elektrik tüketim verilerini otomatik çek (aylık)',
    status: 'mevcut',
    icon: '⚡',
    docs: 'TEDAŞ API',
  },
  {
    id: 'igdas',
    name: 'İGDAŞ / GAZDAŞ',
    category: 'Enerji',
    description: 'Doğal gaz tüketim verileri otomatik entegrasyonu',
    status: 'yakında',
    icon: '🔥',
    docs: 'Doğalgaz API',
  },
  {
    id: 'bddk',
    name: 'BDDK Raporlama',
    category: 'Finans',
    description: 'GAR hesabını BDDK formatında otomatik gönder',
    status: 'mevcut',
    icon: '🏦',
    docs: 'BDDK API',
  },
  {
    id: 'kgk',
    name: 'KGK e-Rapor',
    category: 'Düzenleyici',
    description: 'TSRS raporunu KGK portalına dijital imzalı gönder',
    status: 'yakında',
    icon: '📋',
    docs: 'KGK API',
  },
  {
    id: 'nasa',
    name: 'NASA Earthdata',
    category: 'Uydu',
    description: 'MODIS/VIIRS uydu verileri ile fiziksel risk güncellemesi',
    status: 'mevcut',
    icon: '🛰️',
    docs: 'NASA EarthData',
  },
]

const categories = ['Tümü', 'ERP', 'Enerji', 'Finans', 'Düzenleyici', 'Uydu']

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  mevcut: { bg: '#dcfce7', color: '#166534', label: 'Aktif' },
  yakında: { bg: '#fef9c3', color: '#854d0e', label: 'Yakında' },
  beta: { bg: '#dbeafe', color: '#1e40af', label: 'Beta' },
}

export default function EntegrasyonPage() {
  return (
    <>
      <Header title="🔗 Entegrasyon Marketplace" subtitle="ERP · Enerji · Finans · Uydu · Düzenleyici" />
      <div className="p-6 flex-1 space-y-5">

        {/* Özet */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Aktif Entegrasyon', value: '5', icon: '✅', sub: 'Bağlı sistem' },
            { label: 'Otomatik Veri', value: '3', icon: '🔄', sub: 'Aylık sync' },
            { label: 'Son Sync', value: '2 saat önce', icon: '⏱️', sub: 'TEDAŞ e-Sayaç' },
            { label: 'Yakında', value: '4', icon: '🚀', sub: 'Entegrasyon' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className="text-xl font-bold" style={{ color: 'var(--green-800)' }}>{k.value}</div>
              <div className="text-xs font-semibold mt-0.5">{k.label}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Kategori filtre */}
        <div className="flex gap-2">
          {categories.map((c) => (
            <button
              key={c}
              className="px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors"
              style={{
                borderColor: c === 'Tümü' ? 'var(--green-700)' : 'var(--border)',
                background: c === 'Tümü' ? 'var(--green-700)' : 'white',
                color: c === 'Tümü' ? 'white' : 'inherit',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Entegrasyon kartları */}
        <div className="grid grid-cols-3 gap-4">
          {integrations.map((intg) => {
            const s = statusStyle[intg.status]
            return (
              <div key={intg.id} className="bg-white rounded-xl border p-5 flex flex-col" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{intg.icon}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </div>
                <div className="font-semibold text-sm mb-0.5">{intg.name}</div>
                <div
                  className="text-xs px-2 py-0.5 rounded-full inline-block mb-2 w-fit"
                  style={{ background: '#f3f4f6', color: '#374151' }}
                >
                  {intg.category}
                </div>
                <p className="text-xs flex-1" style={{ color: 'var(--muted-foreground)' }}>{intg.description}</p>
                <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{intg.docs}</span>
                  {intg.status === 'mevcut' ? (
                    <button
                      className="px-3 py-1.5 rounded-md text-xs font-semibold"
                      style={{ background: '#dcfce7', color: '#166534' }}
                    >
                      Yapılandır
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1.5 rounded-md text-xs font-semibold"
                      style={{ background: '#f3f4f6', color: '#6b7280' }}
                    >
                      Bildir
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </>
  )
}
