'use client'
import { useState } from 'react'
import { Header } from '@/components/layout/Header'

const suppliers = [
  {
    id: 1, name: 'Orman A.Ş.', country: 'Türkiye', product: 'Kağıt / Karton',
    risk: 'düşük', geoCoords: '40.1826, 29.0665', verified: true, lastCheck: '2026-06-01',
    ndvi: 0.72, ndviTrend: +0.03, forestCover: 88,
  },
  {
    id: 2, name: 'Brasil Wood Ltda.', country: 'Brezilya', product: 'Ahşap hammadde',
    risk: 'yüksek', geoCoords: '-3.1190, -60.0217', verified: false, lastCheck: '2026-05-15',
    ndvi: 0.41, ndviTrend: -0.18, forestCover: 54,
  },
  {
    id: 3, name: 'Kakao Coop', country: 'Fildişi Sahili', product: 'Kakao',
    risk: 'yüksek', geoCoords: '5.3600, -4.0083', verified: false, lastCheck: '2026-05-20',
    ndvi: 0.38, ndviTrend: -0.22, forestCover: 47,
  },
  {
    id: 4, name: 'Palm Oil Malaysia', country: 'Malezya', product: 'Palmiye yağı',
    risk: 'orta', geoCoords: '3.1390, 101.6869', verified: true, lastCheck: '2026-06-10',
    ndvi: 0.58, ndviTrend: -0.05, forestCover: 71,
  },
  {
    id: 5, name: 'Gıda Tedarikçisi A.Ş.', country: 'Türkiye', product: 'Soya unu',
    risk: 'düşük', geoCoords: '38.9637, 35.2433', verified: true, lastCheck: '2026-06-18',
    ndvi: 0.68, ndviTrend: +0.01, forestCover: 82,
  },
]

const riskStyle: Record<string, { bg: string; color: string }> = {
  'düşük': { bg: '#dcfce7', color: '#166534' },
  'orta':  { bg: '#fef9c3', color: '#854d0e' },
  'yüksek':{ bg: '#fee2e2', color: '#991b1b' },
}

const eudrProducts = ['Sığır eti', 'Kakao', 'Kahve', 'Palmiye yağı', 'Soya', 'Odun', 'Kağıt/Karton', 'Kauçuk']

function NdviBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = value >= 0.65 ? '#166534' : value >= 0.50 ? '#854d0e' : '#991b1b'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono font-bold" style={{ color }}>{value.toFixed(2)}</span>
    </div>
  )
}

function CertificateModal({ supplier, onClose }: { supplier: typeof suppliers[0]; onClose: () => void }) {
  const isCompliant = supplier.ndvi >= 0.55 && supplier.risk !== 'yüksek'
  const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="p-6 text-white" style={{ background: isCompliant ? '#166534' : '#991b1b' }}>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black">
              {isCompliant ? '🌳 EUDR Uyum Sertifikası' : '🚨 Uyumsuzluk Raporu'}
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl">✕</button>
          </div>
          <p className="text-sm mt-1 opacity-80">Tüzük (AB) 2023/1115 · ESA Sentinel-2 Uydu Doğrulaması</p>
        </div>
        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-xs text-slate-500">Tedarikçi</span><p className="font-bold">{supplier.name}</p></div>
            <div><span className="text-xs text-slate-500">Ürün</span><p className="font-bold">{supplier.product}</p></div>
            <div><span className="text-xs text-slate-500">Koordinatlar</span><p className="font-mono text-xs">{supplier.geoCoords}</p></div>
            <div><span className="text-xs text-slate-500">Ülke</span><p className="font-bold">{supplier.country}</p></div>
            <div><span className="text-xs text-slate-500">NDVI Skoru (2015-2026)</span><p className="font-bold">{supplier.ndvi.toFixed(2)}</p></div>
            <div><span className="text-xs text-slate-500">Orman Örtüsü</span><p className="font-bold">%{supplier.forestCover}</p></div>
            <div><span className="text-xs text-slate-500">10 Yıllık Değişim</span>
              <p className="font-bold" style={{ color: supplier.ndviTrend >= 0 ? '#166534' : '#991b1b' }}>
                {supplier.ndviTrend >= 0 ? '+' : ''}{(supplier.ndviTrend * 100).toFixed(1)}%
              </p>
            </div>
            <div><span className="text-xs text-slate-500">Analiz Tarihi</span><p className="font-bold">{today}</p></div>
          </div>

          <div
            className="rounded-xl p-4 text-sm"
            style={{ background: isCompliant ? '#dcfce7' : '#fee2e2', color: isCompliant ? '#166534' : '#991b1b' }}
          >
            {isCompliant
              ? '✅ Bu tedarikçinin hammadde kaynağında 31 Aralık 2020 sonrası ormansızlaşma tespit edilmemiştir. EUDR Madde 3 gereksinimlerini karşılamaktadır.'
              : '❌ Bu tedarikçide ormansızlaşma riski tespit edilmiştir. AB\'ye ihracat öncesinde bağımsız üçüncü taraf doğrulaması gereklidir.'}
          </div>

          <div className="text-xs text-slate-400 border-t pt-3">
            Veri Kaynağı: ESA Copernicus Land Service · NASA MODIS NDVI · SustainHub Satellite Intelligence
          </div>

          <button
            onClick={() => { alert('Sertifika PDF olarak indirildi (demo)'); onClose(); }}
            className="w-full py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: isCompliant ? '#166534' : '#991b1b' }}
          >
            {isCompliant ? '📄 Sertifikayı PDF İndir' : '📋 Uyumsuzluk Raporunu İndir'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EudrPage() {
  const [selectedSupplier, setSelectedSupplier] = useState<typeof suppliers[0] | null>(null)
  const [ndviView, setNdviView] = useState(false)

  return (
    <>
      <Header title="🌳 EUDR Tedarik Zinciri" subtitle="AB Ormansızlaşma Tüzüğü · Aralık 2026 zorunlu · ESA Sentinel-2 Uydu Analizi" />

      {selectedSupplier && (
        <CertificateModal supplier={selectedSupplier} onClose={() => setSelectedSupplier(null)} />
      )}

      <div className="p-6 flex-1 space-y-5">

        {/* Uyarı banner */}
        <div className="rounded-xl border p-4 flex items-start gap-3" style={{ background: '#fef9c3', borderColor: '#fde047' }}>
          <span className="text-xl mt-0.5">⚠️</span>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#713f12' }}>EUDR Uyum Tarihi: Aralık 2026</div>
            <div className="text-xs mt-0.5" style={{ color: '#854d0e' }}>
              Tüzük (AB) 2023/1115 kapsamında AB&apos;ye ihraç edilen 8 emtia grubunda coğrafi koordinat bazında
              ormansızlaşma doğrulaması zorunludur. ESA Sentinel-2 uydu görüntüleri NDVI analizi ile otomatik doğrulanır.
            </div>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Toplam Tedarikçi', value: '5', icon: '🏭', sub: '3 ülke' },
            { label: 'Yüksek Riskli', value: '2', icon: '🚨', sub: 'Uydu doğrulaması gerek' },
            { label: 'EUDR Hazır', value: '3/5', icon: '✅', sub: 'Sertifika verildi' },
            { label: 'Ort. NDVI Skoru', value: '0.55', icon: '🛰️', sub: 'Orman örtüsü indeksi' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className="text-xl font-bold" style={{ color: 'var(--green-800)' }}>{k.value}</div>
              <div className="text-xs font-semibold mt-0.5">{k.label}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Emtia grupları */}
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--green-800)' }}>EUDR Kapsamındaki Emtia Grupları</h2>
          <div className="flex flex-wrap gap-2">
            {eudrProducts.map(p => (
              <span key={p} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#dcfce7', color: '#166534' }}>{p}</span>
            ))}
          </div>
        </div>

        {/* Tedarikçi tablosu */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--green-800)' }}>Tedarik Zinciri · Uydu NDVI Analizi</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                ESA Copernicus · NASA MODIS · 2015-2026 Orman Örtüsü Değişimi
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setNdviView(v => !v)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold border transition-all"
                style={ndviView ? { background: '#166534', color: '#fff', borderColor: '#166534' } : { color: '#166534', borderColor: '#166534' }}
              >
                {ndviView ? '📋 Tablo Modu' : '🛰️ NDVI Modu'}
              </button>
              <button className="px-3 py-1.5 rounded-md text-xs font-semibold text-white" style={{ background: 'var(--green-700)' }}>
                + Tedarikçi Ekle
              </button>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-left" style={{ borderColor: 'var(--border)', background: '#f9fafb' }}>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Tedarikçi</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Ürün / Ülke</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Koordinatlar</th>
                {ndviView && <>
                  <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>NDVI (2026)</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>10Y Değişim</th>
                  <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Orman %</th>
                </>}
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Risk</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {suppliers.map(s => {
                const r = riskStyle[s.risk]
                return (
                  <tr key={s.id} className={s.risk === 'yüksek' ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3 text-xs font-semibold">{s.name}</td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-medium">{s.product}</div>
                      <div style={{ color: 'var(--muted-foreground)' }}>{s.country}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{s.geoCoords}</td>
                    {ndviView && <>
                      <td className="px-4 py-3 w-32"><NdviBar value={s.ndvi} /></td>
                      <td className="px-4 py-3 text-xs font-bold" style={{ color: s.ndviTrend >= 0 ? '#166534' : '#991b1b' }}>
                        {s.ndviTrend >= 0 ? '▲' : '▼'} {Math.abs(s.ndviTrend * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-xs font-bold">%{s.forestCover}</td>
                    </>}
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: r.bg, color: r.color }}>
                        {s.risk.charAt(0).toUpperCase() + s.risk.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedSupplier(s)}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all hover:shadow"
                        style={{ borderColor: '#166534', color: '#166534' }}
                      >
                        🛰️ Sertifika
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Due Diligence Checklist */}
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--green-800)' }}>EUDR Durum Tespiti Kontrol Listesi — Madde 8</h2>
          <div className="space-y-2">
            {[
              { text: 'Tedarikçi ülkesi ve koordinatları kayıt altına alındı', done: true },
              { text: 'Ürün EUDR Ek I kapsamında doğrulandı', done: true },
              { text: '31 Aralık 2020 sonrası ormansızlaşmaya yol açmadığı uydu ile doğrulandı', done: false },
              { text: 'İlgili ülke mevzuatına uygunluk sağlandı', done: true },
              { text: 'Coğrafi koordinat bazında parsel düzeyi belge mevcut', done: false },
              { text: 'AB EUDR kayıt sistemine bildirim yapıldı', done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className={`text-lg ${item.done ? 'text-green-600' : 'text-slate-300'}`}>
                  {item.done ? '✅' : '⬜'}
                </span>
                <span style={{ color: item.done ? '#166534' : '#6b7280' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
