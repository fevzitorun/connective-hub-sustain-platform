'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

const STANDARD_LABELS: Record<string, string> = {
  tsrs: 'TSRS 1 & 2', gri: 'GRI Universal', tcfd: 'TCFD', integrated: 'Entegre Rapor', uk_srs: 'UK SRS',
}
const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Taslak', cls: 'bg-amber-100 text-amber-800' },
  generating: { label: 'Oluşturuluyor', cls: 'bg-amber-100 text-amber-800' },
  completed: { label: 'Tamamlandı', cls: 'bg-green-100 text-green-800' },
  failed: { label: 'Başarısız', cls: 'bg-red-100 text-red-800' },
  pending: { label: 'Onay Bekliyor', cls: 'bg-amber-100 text-amber-800' },
  approved: { label: 'Onaylandı', cls: 'bg-green-100 text-green-800' },
  rejected: { label: 'Reddedildi', cls: 'bg-red-100 text-red-800' },
  published: { label: 'Yayında', cls: 'bg-green-100 text-green-800' },
}

export function RecentReports() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof api.dashboard.summary>> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard.summary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false))
  }, [])

  const reports = summary?.reports.recent ?? []
  const companyName = summary?.company.name ?? 'Şirketiniz'

  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Son Raporlar</div>
        <Link
          href="/raporlar"
          className="text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors"
          style={{ borderColor: 'var(--green-700)', color: 'var(--green-700)' }}
        >
          Tümünü Gör
        </Link>
      </div>
      {loading ? (
        <div className="h-32 animate-pulse bg-gray-50 rounded" />
      ) : reports.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">Henüz rapor oluşturulmadı.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                {['Rapor Adı', 'Standart', 'Dil', 'Uyum Skoru', 'Durum', 'Tarih', ''].map(h => (
                  <th key={h} className="pb-2 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--muted-foreground)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map(r => {
                const status = STATUS_LABELS[r.status] ?? { label: r.status, cls: 'bg-slate-100 text-slate-600' }
                return (
                  <tr key={r.id} className="border-b hover:bg-green-50/50 transition-colors"
                    style={{ borderColor: 'var(--border)' }}>
                    <td className="py-3 font-semibold pr-4">
                      {companyName} — v{r.version_number} {STANDARD_LABELS[r.standard ?? ''] ?? r.standard}
                    </td>
                    <td className="py-3 pr-4 text-xs">{STANDARD_LABELS[r.standard ?? ''] ?? r.standard ?? '—'}</td>
                    <td className="py-3 pr-4 text-xs uppercase">{r.language ?? '—'}</td>
                    <td className="py-3 pr-4 text-xs font-bold">
                      {r.compliance_score != null ? `${r.compliance_score}/100 · ${r.compliance_grade ?? ''}` : 'Hesaplanıyor…'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {r.created_at ? new Date(r.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3">
                      <Link
                        href="/raporlar"
                        className="text-xs font-semibold px-2 py-1 rounded-md border transition-colors inline-block"
                        style={{ borderColor: 'var(--green-700)', color: 'var(--green-700)' }}
                      >
                        Görüntüle
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
