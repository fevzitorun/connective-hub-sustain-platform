'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { Report } from '@/types'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  completed:  { label: 'Tamamlandı', color: 'var(--green-800)', bg: 'var(--green-100)' },
  generating: { label: 'Oluşturuluyor', color: '#E65100', bg: '#FFF3E0' },
  failed:     { label: 'Başarısız', color: '#B71C1C', bg: '#FFEBEE' },
}

export default function RaporlarPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.reports.list()
      .then(setReports)
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>Raporlar</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Oluşturulan tüm TSRS 1 & 2 raporları
          </p>
        </div>
        <button
          onClick={() => router.push('/veri-girisi')}
          className="px-4 py-2 rounded-lg text-sm font-bold text-white"
          style={{ background: 'var(--green-700)' }}>
          + Yeni Rapor
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl p-10 text-center bg-white border" style={{ borderColor: 'var(--border)' }}>
          <p style={{ color: 'var(--muted-foreground)' }}>Yükleniyor…</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl p-10 text-center"
          style={{ background: 'var(--green-50)', border: '2px dashed var(--green-300)' }}>
          <span className="text-4xl block mb-3">📄</span>
          <p className="font-bold mb-1" style={{ color: 'var(--green-900)' }}>Henüz rapor yok</p>
          <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Emisyon verisi girerek ilk TSRS raporunuzu oluşturun.
          </p>
          <button onClick={() => router.push('/veri-girisi')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'var(--green-700)' }}>
            Veri Girişine Git →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => {
            const st = STATUS_LABELS[r.status] ?? STATUS_LABELS.completed
            return (
              <div key={r.id}
                className="bg-white rounded-2xl p-5 border flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                style={{ borderColor: 'var(--border)' }}
                onClick={() => router.push(`/ai-rapor?id=${r.id}`)}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: 'var(--green-100)' }}>
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--green-900)' }}>
                    TSRS 1 & 2 Sürdürülebilirlik Raporu {r.year}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {r.ai_model} · {new Date(r.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                {r.compliance_grade && (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: 'var(--green-700)', color: 'white' }}>
                    {r.compliance_grade}
                  </div>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                  style={{ background: st.bg, color: st.color }}>
                  {st.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
