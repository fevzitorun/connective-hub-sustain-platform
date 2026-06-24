'use client'
import { Header } from '@/components/layout/Header'

const suppliers = [
  { id: 1, name: 'Orman A.Ş.', country: 'Türkiye', product: 'Kağıt / Karton', risk: 'düşük', geoCoords: '40.1826, 29.0665', verified: true, lastCheck: '2026-06-01' },
  { id: 2, name: 'Brasil Wood Ltda.', country: 'Brezilya', product: 'Ahşap hammadde', risk: 'yüksek', geoCoords: '-3.1190, -60.0217', verified: false, lastCheck: '2026-05-15' },
  { id: 3, name: 'Kakao Coop', country: 'Fildişi Sahili', product: 'Kakao', risk: 'yüksek', geoCoords: '5.3600, -4.0083', verified: false, lastCheck: '2026-05-20' },
  { id: 4, name: 'Palm Oil Malaysia', country: 'Malezya', product: 'Palmiye yağı', risk: 'orta', geoCoords: '3.1390, 101.6869', verified: true, lastCheck: '2026-06-10' },
  { id: 5, name: 'Gıda Tedarikçisi A.Ş.', country: 'Türkiye', product: 'Soya unu', risk: 'düşük', geoCoords: '38.9637, 35.2433', verified: true, lastCheck: '2026-06-18' },
]

const riskStyle: Record<string, { bg: string; color: string }> = {
  düşük: { bg: '#dcfce7', color: '#166534' },
  orta: { bg: '#fef9c3', color: '#854d0e' },
  yüksek: { bg: '#fee2e2', color: '#991b1b' },
}

const eudrProducts = ['Sığır eti', 'Kakao', 'Kahve', 'Palmiye yağı', 'Soya', 'Odun', 'Kağıt/Karton', 'Kauçuk']

export default function EudrPage() {
  return (
    <>
      <Header title="🌳 EUDR Tedarik Zinciri" subtitle="AB Ormansızlaşma Tüzüğü · Aralık 2026 zorunlu" />
      <div className="p-6 flex-1 space-y-5">

        {/* Uyarı banner */}
        <div
          className="rounded-xl border p-4 flex items-start gap-3"
          style={{ background: '#fef9c3', borderColor: '#fde047' }}
        >
          <span className="text-xl mt-0.5">⚠️</span>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#713f12' }}>EUDR Uyum Tarihi: Aralık 2026</div>
            <div className="text-xs mt-0.5" style={{ color: '#854d0e' }}>
              Tüzük (AB) 2023/1115 kapsamında AB&apos;ye ihraç edilen 8 emtia grubunda (sığır eti, kakao, kahve, palmiye yağı,
              soya, odun, kağıt/karton, kauçuk) tedarik zincirinin ormansızlaşmaya yol açmadığı
              coğrafi koordinat bazında doğrulanmalıdır.
            </div>
          </div>
        </div>

        {/* Özet KPI */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Toplam Tedarikçi', value: '5', icon: '🏭', sub: '8 ülke' },
            { label: 'Yüksek Riskli', value: '2', icon: '🚨', sub: 'Doğrulama gerekli' },
            { label: 'Doğrulanmış', value: '3/5', icon: '✅', sub: 'Coğrafi veri mevcut' },
            { label: 'EUDR Kapsamı', value: '6/8', icon: '📋', sub: 'Emtia grubu' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className="text-xl font-bold" style={{ color: 'var(--green-800)' }}>{k.value}</div>
              <div className="text-xs font-semibold mt-0.5">{k.label}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Kapsam ürünler */}
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--green-800)' }}>EUDR Kapsamındaki Emtia Grupları</h2>
          <div className="flex flex-wrap gap-2">
            {eudrProducts.map((p) => (
              <span
                key={p}
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: '#dcfce7', color: '#166534' }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Tedarikçi haritası / tablosu */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--green-800)' }}>Tedarik Zinciri Haritalama</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                Coğrafi koordinat doğrulaması · ESA Sentinel-2 uydu verisi
              </p>
            </div>
            <button
              className="px-3 py-1.5 rounded-md text-xs font-semibold text-white"
              style={{ background: 'var(--green-700)' }}
            >
              + Tedarikçi Ekle
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-left" style={{ borderColor: 'var(--border)', background: '#f9fafb' }}>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Tedarikçi</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Ülke</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Ürün</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Koordinatlar</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Son Kontrol</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Risk</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {suppliers.map((s) => {
                const r = riskStyle[s.risk]
                return (
                  <tr key={s.id} className={s.risk === 'yüksek' ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3 text-xs font-semibold">{s.name}</td>
                    <td className="px-4 py-3 text-xs">{s.country}</td>
                    <td className="px-4 py-3 text-xs">{s.product}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
                      {s.geoCoords}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.lastCheck}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: r.bg, color: r.color }}>
                        {s.risk.charAt(0).toUpperCase() + s.risk.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {s.verified ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">✓ Doğrulandı</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">Doğrulama Gerek</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </div>
    </>
  )
}
