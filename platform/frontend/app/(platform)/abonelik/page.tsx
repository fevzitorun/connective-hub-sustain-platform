'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

type Plan = {
  id: string
  name: string
  name_tr: string
  price_monthly: number
  price_yearly: number
  currency: string
  features: string[]
  limits: { users: number; reports_per_month: number; api_req_per_min: number }
  badge: string | null
}

const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  'Popüler':       { bg: 'var(--green-700)', text: 'white' },
  'En İyi Değer':  { bg: '#1565C0', text: 'white' },
}

function PlanCard({
  plan,
  billing,
  current,
  onSelect,
  loading,
}: {
  plan: Plan
  billing: 'monthly' | 'yearly'
  current: boolean
  onSelect: (planId: string) => void
  loading: boolean
}) {
  const price = billing === 'yearly' ? plan.price_yearly : plan.price_monthly
  const perMonth = billing === 'yearly' && plan.price_yearly > 0
    ? (plan.price_yearly / 12).toFixed(0)
    : null
  const badge = plan.badge ? BADGE_COLORS[plan.badge] : null

  return (
    <div
      className="relative rounded-2xl border p-6 flex flex-col transition-all"
      style={{
        borderColor: current ? 'var(--green-700)' : plan.badge === 'Popüler' ? 'var(--green-400)' : 'var(--border)',
        background: current ? 'var(--green-50)' : 'white',
        boxShadow: plan.badge === 'Popüler' ? '0 4px 24px rgba(27,94,32,0.12)' : undefined,
      }}
    >
      {plan.badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold"
          style={{ background: badge?.bg, color: badge?.text }}
        >
          {plan.badge}
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-black" style={{ color: 'var(--green-900)' }}>{plan.name_tr}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          {price === 0 ? (
            <span className="text-3xl font-black" style={{ color: 'var(--green-800)' }}>Ücretsiz</span>
          ) : (
            <>
              <span className="text-3xl font-black" style={{ color: 'var(--green-800)' }}>
                ${billing === 'yearly' ? perMonth : price}
              </span>
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>/ay</span>
            </>
          )}
        </div>
        {billing === 'yearly' && price > 0 && (
          <p className="text-xs mt-1" style={{ color: 'var(--green-600)' }}>
            Yıllık ${plan.price_yearly} — 2 ay ücretsiz
          </p>
        )}
      </div>

      <ul className="space-y-2 flex-1 mb-6">
        {plan.features.map(f => (
          <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--foreground)' }}>
            <span className="text-green-600 mt-0.5 shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>

      {current ? (
        <div className="text-center py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
          Mevcut Plan
        </div>
      ) : (
        <button
          onClick={() => onSelect(plan.id)}
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
          style={{ background: plan.badge === 'Popüler' ? 'var(--green-700)' : '#1565C0' }}>
          {loading ? 'Yönlendiriliyor…' : price === 0 ? 'Başla' : `${plan.name_tr}'e Geç`}
        </button>
      )}
    </div>
  )
}

export default function AbonelikPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    Promise.all([api.payments.plans(), api.payments.subscription()])
      .then(([plansData, subData]) => {
        setPlans(plansData.plans as Plan[])
        setCurrentPlan((subData as { plan: Plan }).plan.id)
      })
      .catch(() => toast.error('Plan bilgileri alınamadı'))
      .finally(() => setFetching(false))
  }, [])

  async function handleSelect(planId: string) {
    if (planId === 'free') { toast.info('Ücretsiz plan zaten aktif'); return }
    setLoading(true)
    try {
      const res = await api.payments.createCheckout({ plan_id: planId, billing })
      if ((res as { checkout_url: string }).checkout_url) {
        window.location.href = (res as { checkout_url: string }).checkout_url
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Ödeme başlatılamadı')
    } finally {
      setLoading(false)
    }
  }

  async function handlePortal() {
    try {
      const res = await api.payments.portal()
      if ((res as { portal_url: string }).portal_url) {
        window.location.href = (res as { portal_url: string }).portal_url
      }
    } catch {
      toast.error('Portal açılamadı')
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--green-900)' }}>
          Abonelik Planları
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
          Sürdürülebilirlik raporlama ihtiyacınıza uygun planı seçin
        </p>

        {/* Billing toggle */}
        <div className="inline-flex rounded-xl border p-1 gap-1" style={{ borderColor: 'var(--border)', background: 'var(--green-50)' }}>
          <button
            onClick={() => setBilling('monthly')}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={billing === 'monthly'
              ? { background: 'var(--green-700)', color: 'white' }
              : { color: 'var(--muted-foreground)' }}>
            Aylık
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
            style={billing === 'yearly'
              ? { background: 'var(--green-700)', color: 'white' }
              : { color: 'var(--muted-foreground)' }}>
            Yıllık
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: '#E8F5E9', color: 'var(--green-700)' }}>
              −17%
            </span>
          </button>
        </div>
      </div>

      {fetching ? (
        <div className="grid grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border p-6 h-96 animate-pulse bg-gray-50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billing={billing}
              current={plan.id === currentPlan}
              onSelect={handleSelect}
              loading={loading}
            />
          ))}
        </div>
      )}

      {/* Manage subscription */}
      {currentPlan !== 'free' && (
        <div className="mt-8 text-center">
          <button
            onClick={handlePortal}
            className="text-sm font-medium underline"
            style={{ color: 'var(--muted-foreground)' }}>
            Aboneliği yönet (fatura, iptal)
          </button>
        </div>
      )}

      {/* Features comparison */}
      <div className="mt-10 rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <div className="px-6 py-3 text-xs font-semibold uppercase tracking-wider"
          style={{ background: 'var(--green-50)', color: 'var(--green-900)', borderBottom: '1px solid var(--border)' }}>
          Detaylı Özellik Karşılaştırması
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left py-3 px-6 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Özellik</th>
              {['Ücretsiz', 'Profesyonel', 'Kurumsal'].map(n => (
                <th key={n} className="text-center py-3 px-4 font-bold" style={{ color: 'var(--green-900)' }}>{n}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Kullanıcı sayısı', '1', '10', 'Sınırsız'],
              ['Rapor/ay', '3', 'Sınırsız', 'Sınırsız'],
              ['TSRS 1 & 2', '✓', '✓', '✓'],
              ['CBAM & EUDR', '—', '✓', '✓'],
              ['CSRD & GRI', '—', '✓', '✓'],
              ['PDF & Word Export', '—', '✓', '✓'],
              ['Benchmark & EEA', '—', '✓', '✓'],
              ['White-Label', '—', '—', '✓'],
              ['Uydu / NASA verisi', '—', '—', '✓'],
              ['API Limit (req/dk)', '50', '200', '1000'],
              ['SLA Desteği', '—', '—', '✓'],
            ].map(([feature, ...vals]) => (
              <tr key={feature as string} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="py-3 px-6" style={{ color: 'var(--foreground)' }}>{feature}</td>
                {(vals as string[]).map((v, i) => (
                  <td key={i} className="text-center py-3 px-4"
                    style={{ color: v === '—' ? 'var(--muted-foreground)' : 'var(--green-700)', fontWeight: v === '✓' ? 700 : 400 }}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
