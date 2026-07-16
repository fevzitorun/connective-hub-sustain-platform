'use client'
import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { api } from '@/lib/api'

type Maturity = 'available' | 'beta' | 'planned'
interface Provider {
  provider: string
  display_name: string
  maturity: Maturity
  description: string
  required_config: string[]
}

// Backend erişilemezse (canlı backend bağlı değilse) gösterilecek dürüst yedek liste
const FALLBACK: Provider[] = [
  { provider: 'efatura', display_name: 'e-Fatura (GİB)', maturity: 'beta', description: 'Elektrik/doğalgaz/yakıt faturalarından otomatik tüketim verisi (Scope 1 & 2).', required_config: ['integrator', 'username', 'password', 'vkn'] },
  { provider: 'logo', display_name: 'Logo (Tiger / Netsis / Go)', maturity: 'beta', description: "Muhasebe fişlerinden enerji/yakıt tüketimi — Türkiye'nin en yaygın ERP'si.", required_config: ['base_url', 'api_key', 'firm_number', 'period'] },
  { provider: 'mikro', display_name: 'Mikro', maturity: 'planned', description: 'Mikro muhasebe — enerji/yakıt alımları.', required_config: ['connection_string', 'company_code'] },
  { provider: 'sap', display_name: 'SAP S/4HANA', maturity: 'planned', description: 'SAP OData / BAPI üzerinden tüketim verisi.', required_config: ['odata_url', 'client', 'username', 'password'] },
  { provider: 'oracle', display_name: 'Oracle ERP Cloud', maturity: 'planned', description: 'Oracle ERP Cloud REST API üzerinden veri.', required_config: ['rest_url', 'username', 'password'] },
]

const ICONS: Record<string, string> = {
  efatura: '🧾', logo: '🟠', mikro: '🔴', sap: '🔵', oracle: '🔺',
}

const MATURITY: Record<Maturity, { bg: string; color: string; label: string }> = {
  available: { bg: '#dcfce7', color: '#166534', label: 'Aktif' },
  beta: { bg: '#dbeafe', color: '#1e40af', label: 'Beta · mimari hazır' },
  planned: { bg: '#f3f4f6', color: '#6b7280', label: 'Planlanan' },
}

export default function EntegrasyonPage() {
  const [providers, setProviders] = useState<Provider[]>(FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.integration.providers()
      .then(r => { if (r?.providers?.length) setProviders(r.providers as Provider[]) })
      .catch(() => { /* backend erişilemezse yedek liste kalır */ })
      .finally(() => setLoading(false))
  }, [])

  const betaCount = providers.filter(p => p.maturity === 'beta').length
  const plannedCount = providers.filter(p => p.maturity === 'planned').length
  const activeCount = providers.filter(p => p.maturity === 'available').length

  return (
    <>
      <Header title="🔗 Entegrasyon Marketplace" subtitle="ERP · Muhasebe · e-Fatura — kaynaktan otomatik veri" />
      <div className="p-6 flex-1 space-y-5">

        {/* Dürüst özet */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Aktif Bağlantı', value: String(activeCount), icon: '✅', sub: 'Canlı senkron' },
            { label: 'Beta (mimari hazır)', value: String(betaCount), icon: '🧩', sub: 'Kimlik ile devreye alınır' },
            { label: 'Planlanan', value: String(plannedCount), icon: '🗺️', sub: 'Müşteri talebiyle' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className="text-xl font-bold" style={{ color: 'var(--green-800)' }}>{k.value}</div>
              <div className="text-xs font-semibold mt-0.5">{k.label}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Adaptör mimarisi hazır; her kaynak bağlandığında veriyi aynı standart yapıya (kWh, m³, litre)
          normalize eder. Bağlantılar pilot müşterinin sistemine göre kimlik bilgisiyle devreye alınır.
          {loading && ' · yükleniyor…'}
        </p>

        {/* Sağlayıcı kartları */}
        <div className="grid grid-cols-3 gap-4">
          {providers.map((p) => {
            const s = MATURITY[p.maturity]
            return (
              <div key={p.provider} className="bg-white rounded-xl border p-5 flex flex-col" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{ICONS[p.provider] ?? '🔌'}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </div>
                <div className="font-semibold text-sm mb-2">{p.display_name}</div>
                <p className="text-xs flex-1" style={{ color: 'var(--muted-foreground)' }}>{p.description}</p>
                <div className="mt-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Gerekli: {p.required_config.join(', ')}
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-end" style={{ borderColor: 'var(--border)' }}>
                  <button
                    className="px-3 py-1.5 rounded-md text-xs font-semibold"
                    style={p.maturity === 'planned'
                      ? { background: '#f3f4f6', color: '#6b7280' }
                      : { background: '#dbeafe', color: '#1e40af' }}
                  >
                    {p.maturity === 'planned' ? 'Talep Et' : 'Yapılandır'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </>
  )
}
