'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { Report } from '@/types'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  completed:  { label: 'Tamamlandı',    color: 'var(--green-800)', bg: 'var(--green-100)' },
  generating: { label: 'Oluşturuluyor', color: '#E65100',          bg: '#FFF3E0' },
  failed:     { label: 'Başarısız',     color: '#B71C1C',          bg: '#FFEBEE' },
  pending:    { label: 'Onay Bekliyor', color: '#5D4037',          bg: '#FFF8E1' },
  approved:   { label: 'Onaylandı',     color: '#1B5E20',          bg: '#E8F5E9' },
  rejected:   { label: 'Reddedildi',    color: '#B71C1C',          bg: '#FFEBEE' },
}

export default function RaporlarPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingReports, setPendingReports] = useState<Report[]>([])
  const [userRole, setUserRole] = useState('')
  const [submitting, setSubmitting] = useState<string | null>(null)

  async function loadAll() {
    try {
      const [data, me] = await Promise.all([api.reports.list(), api.auth.me()])
      setReports(data)
      setUserRole(me.role)
      if (me.role === 'admin' || me.role === 'editor') {
        const pending = await api.reports.pending()
        setPendingReports(pending)
      }
    } catch {
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  async function handleSubmit(reportId: string, e: React.MouseEvent) {
    e.stopPropagation()
    setSubmitting(reportId)
    try {
      await api.reports.submit(reportId)
      toast.success('Rapor onaya gönderildi')
      loadAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gönderilemedi')
    } finally {
      setSubmitting(null)
    }
  }

  async function handleApprove(reportId: string) {
    try {
      await api.reports.approve(reportId)
      toast.success('Rapor onaylandı')
      loadAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Onaylanamadı')
    }
  }

  async function handleReject(reportId: string) {
    const reason = prompt('Red nedeni (isteğe bağlı):')
    if (reason === null) return
    try {
      await api.reports.reject(reportId, reason || undefined)
      toast.success('Rapor reddedildi')
      loadAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reddedilemedi')
    }
  }

  const isApprover = userRole === 'admin' || userRole === 'editor'

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

      {/* Pending approvals — admin/editor only */}
      {isApprover && pendingReports.length > 0 && (
        <div className="mb-5 rounded-2xl border overflow-hidden" style={{ borderColor: '#FFB300' }}>
          <div className="px-5 py-3 flex items-center gap-2" style={{ background: '#FFF8E1' }}>
            <span>🔔</span>
            <span className="text-sm font-bold" style={{ color: '#5D4037' }}>
              Onay Bekleyen Raporlar ({pendingReports.length})
            </span>
          </div>
          {pendingReports.map(r => (
            <div key={r.id}
              className="bg-white px-5 py-3 flex items-center gap-4"
              style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--green-900)' }}>
                  TSRS 1 & 2 Sürdürülebilirlik Raporu
                  {r.version_number && r.version_number > 1 && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded"
                      style={{ background: '#E3F2FD', color: '#1565C0' }}>
                      v{r.version_number}
                    </span>
                  )}
                </p>
                {r.submitted_at && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    Gönderildi: {new Date(r.submitted_at).toLocaleString('tr-TR')}
                  </p>
                )}
              </div>
              {r.compliance_grade && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                  style={{ background: 'var(--green-700)', color: 'white' }}>
                  {r.compliance_grade}
                </div>
              )}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleApprove(r.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                  style={{ background: 'var(--green-700)' }}>
                  ✓ Onayla
                </button>
                <button
                  onClick={() => handleReject(r.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border"
                  style={{ borderColor: '#FFCDD2', color: '#B71C1C', background: '#FFEBEE' }}>
                  ✕ Reddet
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
                    {r.version_number && r.version_number > 1 && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded"
                        style={{ background: '#E3F2FD', color: '#1565C0' }}>
                        v{r.version_number}
                      </span>
                    )}
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
                {r.status === 'completed' && (
                  <button
                    onClick={(e) => handleSubmit(r.id, e)}
                    disabled={submitting === r.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0 disabled:opacity-50"
                    style={{ background: '#1565C0' }}>
                    {submitting === r.id ? '⏳' : '↑ Onaya Gönder'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
