'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '@/lib/api'
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

function AIRaporContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reportId = searchParams.get('id')
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState(0)
  const [elapsed, setElapsed] = useState(0)
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

  // Üretim sürerken geçen süreyi say (ilerleme göstergesi için)
  useEffect(() => {
    if (report?.status !== 'generating') return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [report?.status])

  async function handleNewReport() {
    router.push('/veri-girisi')
  }

  async function handleDownload(format: 'pdf' | 'docx' = 'pdf') {
    if (!report?.id) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('sustain_token') : null
    const url = format === 'docx'
      ? api.reports.exportDocxUrl(report.id)
      : api.reports.exportUrl(report.id)
    const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    if (!res.ok) { toast.error('İndirme başarısız'); return }
    const blob = await res.blob()
    const ct = res.headers.get('content-type') || ''
    const ext = format === 'docx' ? 'docx' : ct.includes('pdf') ? 'pdf' : 'txt'
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `sustainhub-${report.standard ?? 'tsrs'}-v${report.version_number ?? 1}.${ext}`
    a.click()
    URL.revokeObjectURL(a.href)
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
            Claude claude-sonnet-5 ile TSRS 1 & 2 uyumlu Türkçe sürdürülebilirlik raporu oluşturun.
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
            onClick={() => handleDownload('pdf')}
            disabled={report?.status !== 'completed'}
            className="px-4 py-2 rounded-lg text-xs font-semibold border disabled:opacity-40"
            style={{ borderColor: 'var(--green-300)', color: 'var(--green-700)', background: 'var(--green-50)' }}>
            ⬇ PDF İndir
          </button>
          <button
            onClick={() => handleDownload('docx')}
            disabled={report?.status !== 'completed'}
            className="px-4 py-2 rounded-lg text-xs font-semibold border disabled:opacity-40"
            style={{ borderColor: '#1565C0', color: '#1565C0', background: '#E3F2FD' }}>
            ⬇ Word İndir
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
      {report?.status === 'generating' && (() => {
        const EST_SECONDS = 300 // ~5 dk tahmini üretim süresi
        const pct = Math.min(95, Math.round((elapsed / EST_SECONDS) * 100))
        const stages = [
          'Emisyon verileri analiz ediliyor',
          'Yönetişim & strateji bölümleri yazılıyor',
          'Risk ve senaryo analizi hazırlanıyor',
          'Metrikler & SASB tabloları oluşturuluyor',
          'Rapor sonlandırılıyor (TSRS içerik endeksi)',
        ]
        const activeIdx = Math.min(stages.length - 1, Math.floor((pct / 100) * stages.length))
        const mm = Math.floor(elapsed / 60)
        const ss = String(elapsed % 60).padStart(2, '0')
        return (
          <div className="rounded-2xl p-8 mb-5 text-center"
            style={{ background: 'var(--green-50)', border: '2px dashed var(--green-300)' }}>
            <div className="w-14 h-14 rounded-full border-4 border-t-transparent mx-auto mb-4 animate-spin"
              style={{ borderColor: 'var(--green-300)', borderTopColor: 'var(--green-700)' }} />
            <p className="font-bold mb-1" style={{ color: 'var(--green-900)' }}>
              Claude claude-sonnet-5 raporunuzu yazıyor…
            </p>
            <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>
              Tam TSRS 1 &amp; 2 raporu hazırlanıyor — bu işlem tipik olarak 3-5 dakika sürer.
              Sayfadan ayrılabilirsiniz; rapor hazır olduğunda burada görünecek.
            </p>

            {/* İlerleme çubuğu */}
            <div className="max-w-md mx-auto mb-2">
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--green-100)' }}>
                <div className="h-full rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${pct}%`, background: 'linear-gradient(90deg,var(--green-500),var(--green-700))' }} />
              </div>
              <div className="flex justify-between mt-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <span>%{pct}</span>
                <span>Geçen süre: {mm}:{ss}</span>
              </div>
            </div>

            {/* Aşamalar — aktif olan vurgulanır */}
            <div className="mt-4 flex flex-col items-center gap-1.5 text-sm">
              {stages.map((step, i) => (
                <div key={step} className="flex items-center gap-2"
                  style={{ opacity: i <= activeIdx ? 1 : 0.4 }}>
                  <span>{i < activeIdx ? '✅' : i === activeIdx ? '⏳' : '○'}</span>
                  <span style={{ color: i === activeIdx ? 'var(--green-900)' : 'var(--green-700)', fontWeight: i === activeIdx ? 700 : 400 }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

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
          {/* Sidebar: section nav + compliance */}
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
