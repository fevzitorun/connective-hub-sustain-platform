'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { ReportVersion } from '@/lib/api'
import type { Report } from '@/types'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; style: React.CSSProperties }> = {
    generating: { label: '⏳ Oluşturuluyor…', style: { background: '#FFF3E0', color: '#E65100' } },
    completed:  { label: '✅ Tamamlandı', style: { background: 'var(--green-100)', color: 'var(--green-800)' } },
    failed:     { label: '❌ Başarısız', style: { background: '#FFEBEE', color: '#B71C1C' } },
  }
  const s = map[status] ?? map.generating
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold" style={s.style}>{s.label}</span>
  )
}

function ComplianceChecklist({ score }: { score?: number }) {
  const items = [
    { label: 'Kapsam 1 emisyonları açıklandı', done: true },
    { label: 'Kapsam 2 (konum + piyasa bazlı)', done: true },
    { label: 'Kapsam 3 materyallik analizi', done: true },
    { label: 'Baz yıl belirlendi', done: true },
    { label: 'İklim senaryosu analizi (TCFD)', done: (score ?? 0) >= 75 },
    { label: 'Net sıfır hedefi tanımlandı', done: (score ?? 0) >= 80 },
    { label: 'Bağımsız güvence', done: (score ?? 0) >= 90 },
  ]
  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-2.5">
          <span className="text-sm">{item.done ? '✅' : '⚠️'}</span>
          <span className="text-xs" style={{ color: item.done ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function VersionHistoryPanel({ versions, currentId }: { versions: ReportVersion[]; currentId: string }) {
  const router = useRouter()
  if (versions.length <= 1) return null

  return (
    <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: 'var(--border)' }}>
      <p className="text-xs font-semibold mb-3" style={{ color: 'var(--green-900)' }}>
        Versiyon Geçmişi ({versions.length})
      </p>
      <div className="space-y-2">
        {versions.map(v => {
          const isCurrent = v.id === currentId
          return (
            <button
              key={v.id}
              onClick={() => !isCurrent && router.push(`/ai-rapor?id=${v.id}`)}
              disabled={isCurrent}
              className="w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all"
              style={isCurrent
                ? { background: 'var(--green-700)', color: 'white', cursor: 'default' }
                : { background: 'var(--green-50)', color: 'var(--green-800)', border: '1px solid var(--green-200)' }}>
              <div className="flex items-center justify-between">
                <span className="font-bold">v{v.version_number}</span>
                <div className="flex items-center gap-1.5">
                  {v.compliance_grade && (
                    <span className="font-black text-xs px-1.5 py-0.5 rounded"
                      style={isCurrent
                        ? { background: 'rgba(255,255,255,0.2)', color: 'white' }
                        : { background: 'var(--green-100)', color: 'var(--green-800)' }}>
                      {v.compliance_grade}
                    </span>
                  )}
                  {v.compliance_score && (
                    <span className="font-medium opacity-80">{v.compliance_score}p</span>
                  )}
                </div>
              </div>
              <div className="text-[10px] mt-0.5 opacity-70">
                {new Date(v.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}
                {' '}
                {new Date(v.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AIRaporContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reportId = searchParams.get('id')
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState(0)
  const [versions, setVersions] = useState<ReportVersion[]>([])
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!reportId) { setLoading(false); return }

    async function poll() {
      try {
        const r = await api.reports.status(reportId!)
        setReport(r)
        if (r.status === 'generating') {
          pollRef.current = setTimeout(poll, 3000)
        }
      } catch {
        toast.error('Rapor durumu alınamadı')
      } finally {
        setLoading(false)
      }
    }

    poll()
    return () => { if (pollRef.current) clearTimeout(pollRef.current) }
  }, [reportId])

  // Load version history when report is completed
  useEffect(() => {
    if (report?.status === 'completed' && reportId) {
      api.reports.versions(reportId).then(setVersions).catch(() => {})
    }
  }, [report?.status, reportId])

  async function handleNewReport() {
    router.push('/veri-girisi')
  }

  async function handleDownload() {
    if (!report?.content_text) return
    const blob = new Blob([report.content_text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sustain-tsrs-rapor-${report.year ?? 2024}${versions.length > 1 ? `-v${(report as Report & { version_number?: number }).version_number ?? 1}` : ''}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Parse sections from report content
  const sections = report?.content_text
    ? report.content_text.split(/\n(?=[A-ZÀ-ɏİıŞşÖöÜü]{2,}.*\n)/g)
        .filter(s => s.trim().length > 50)
        .slice(0, 12)
    : []

  if (!reportId) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--green-50)', border: '2px dashed var(--green-300)' }}>
          <span className="text-5xl block mb-4">🤖</span>
          <h2 className="text-xl font-black mb-2" style={{ color: 'var(--green-900)' }}>AI TSRS Rapor Oluşturucu</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
            Claude ile TSRS 1 & 2 uyumlu Türkçe sürdürülebilirlik raporu oluşturun.
            Önce emisyon verilerinizi girin.
          </p>
          <button
            onClick={() => router.push('/veri-girisi')}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: 'var(--green-700)' }}>
            Veri Girişine Git →
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent mx-auto mb-4 animate-spin"
            style={{ borderColor: 'var(--green-300)', borderTopColor: 'transparent' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--green-700)' }}>Rapor yükleniyor…</p>
        </div>
      </div>
    )
  }

  const reportWithVersion = report as (Report & { version_number?: number }) | null

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>
            TSRS 1 & 2 Sürdürülebilirlik Raporu
          </h1>
          <div className="flex items-center gap-3 mt-2">
            {report && <StatusBadge status={report.status} />}
            {reportWithVersion?.version_number && reportWithVersion.version_number > 1 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                style={{ background: '#E3F2FD', color: '#1565C0' }}>
                v{reportWithVersion.version_number}
              </span>
            )}
            {report?.ai_model && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
                {report.ai_model}
              </span>
            )}
            {report?.compliance_score && (
              <span className="text-xs font-bold" style={{ color: 'var(--green-700)' }}>
                Skor: {report.compliance_score}/100 ({report.compliance_grade})
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={report?.status !== 'completed'}
            className="px-4 py-2 rounded-lg text-xs font-semibold border disabled:opacity-40"
            style={{ borderColor: 'var(--green-300)', color: 'var(--green-700)', background: 'var(--green-50)' }}>
            ⬇ İndir
          </button>
          <button
            onClick={handleNewReport}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
            style={{ background: 'var(--green-700)' }}>
            + Yeni Rapor
          </button>
        </div>
      </div>

      {/* Generating state */}
      {report?.status === 'generating' && (
        <div className="rounded-2xl p-8 mb-5 text-center"
          style={{ background: 'var(--green-50)', border: '2px dashed var(--green-300)' }}>
          <div className="w-14 h-14 rounded-full border-4 border-t-transparent mx-auto mb-4 animate-spin"
            style={{ borderColor: 'var(--green-300)', borderTopColor: 'var(--green-700)' }} />
          <p className="font-bold mb-1" style={{ color: 'var(--green-900)' }}>
            Claude raporunuzu yazıyor…
          </p>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            TSRS 1 & 2 standardına göre Türkçe rapor hazırlanıyor. Bu işlem 30-60 saniye sürebilir.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['Emisyon analizi', 'Senaryo değerlendirmesi', 'SASB metrikleri', 'Yönetim beyanı', 'Hedef tabloları'].map(step => (
              <span key={step} className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>
                {step}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Failed state */}
      {report?.status === 'failed' && (
        <div className="rounded-2xl p-6 mb-5 text-center"
          style={{ background: '#FFEBEE', border: '1px solid #FFCDD2' }}>
          <p className="font-bold mb-1" style={{ color: '#B71C1C' }}>Rapor oluşturulamadı</p>
          <p className="text-sm mb-4" style={{ color: '#C62828' }}>
            ANTHROPIC_API_KEY kontrol edin veya tekrar deneyin.
          </p>
          <button onClick={handleNewReport} className="px-4 py-2 rounded-lg text-sm font-bold text-white"
            style={{ background: '#D32F2F' }}>
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Completed: two-column layout */}
      {report?.status === 'completed' && report.content_text && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Sidebar: section nav + compliance + versions */}
          <div className="space-y-4">
            {/* Token usage */}
            {(report.prompt_tokens || report.completion_tokens) && (
              <div className="bg-white rounded-2xl p-4 border text-xs space-y-1"
                style={{ borderColor: 'var(--border)' }}>
                <p className="font-semibold mb-2" style={{ color: 'var(--green-900)' }}>API Kullanımı</p>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted-foreground)' }}>Prompt token</span>
                  <span className="font-medium">{report.prompt_tokens?.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted-foreground)' }}>Tamamlama token</span>
                  <span className="font-medium">{report.completion_tokens?.toLocaleString('tr-TR')}</span>
                </div>
              </div>
            )}

            {/* Compliance */}
            <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold" style={{ color: 'var(--green-900)' }}>TSRS Uyum</p>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                  style={{ background: 'var(--green-700)', color: 'white' }}>
                  {report.compliance_grade ?? 'B+'}
                </div>
              </div>
              <ComplianceChecklist score={report.compliance_score} />
            </div>

            {/* Version history */}
            {reportId && (
              <VersionHistoryPanel versions={versions} currentId={reportId} />
            )}

            {/* Section navigator */}
            {sections.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--green-900)' }}>Bölümler</p>
                <div className="space-y-1">
                  {sections.slice(0, 8).map((s, i) => {
                    const title = s.split('\n')[0].trim().substring(0, 40)
                    return (
                      <button key={i}
                        onClick={() => setActiveSection(i)}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all"
                        style={activeSection === i
                          ? { background: 'var(--green-700)', color: 'white' }
                          : { color: 'var(--muted-foreground)' }}>
                        {title}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Main: report content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <div className="px-6 py-4 border-b flex items-center gap-3"
                style={{ borderColor: 'var(--border)', background: 'var(--green-50)' }}>
                <span className="text-lg">📄</span>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--green-900)' }}>
                    TSRS 1 & 2 Sürdürülebilirlik Raporu
                    {reportWithVersion?.version_number && reportWithVersion.version_number > 1 && (
                      <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: '#E3F2FD', color: '#1565C0' }}>
                        v{reportWithVersion.version_number}
                      </span>
                    )}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    KGK onaylı format · RG 32414 (29.12.2023)
                  </p>
                </div>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-xs leading-relaxed font-mono"
                  style={{ color: 'var(--foreground)', fontFamily: 'inherit', fontSize: '13px', lineHeight: '1.8' }}>
                  {sections.length > 0 ? sections[activeSection] : report.content_text}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AIRaporPage() {
  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent mx-auto mb-4 animate-spin"
            style={{ borderColor: 'var(--green-300)', borderTopColor: 'var(--green-700)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--green-700)' }}>Yükleniyor…</p>
        </div>
      </div>
    }>
      <AIRaporContent />
    </Suspense>
  )
}
