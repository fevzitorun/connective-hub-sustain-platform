'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { Report } from '@/types'
import { Download, History, X } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  completed:  { label: 'Tamamlandı', color: 'var(--green-800)', bg: 'var(--green-100)' },
  generating: { label: 'Oluşturuluyor', color: '#E65100', bg: '#FFF3E0' },
  failed:     { label: 'Başarısız', color: '#B71C1C', bg: '#FFEBEE' },
}

export default function RaporlarPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [historyLogs, setHistoryLogs] = useState<any[]>([])
  
  // iXBRL validation modal states
  const [valModalOpen, setValModalOpen] = useState(false)
  const [valResult, setValResult] = useState<any>(null)
  const [valLoading, setValLoading] = useState(false)

  useEffect(() => {
    api.reports.list()
      .then(setReports)
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDownloadPDF = async (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation()
    try {
      // API call to download PDF using the backend motor
      const url = `http://localhost:8000/reports/${reportId}/export`
      window.open(url, '_blank')
    } catch (error) {
      console.error("PDF download failed", error)
    }
  }

  // Demo fonksiyonu - Veri giriş alanının yanındaki history (saat) ikonuna tıklanınca çalışır
  const handleShowHistory = async (e: React.MouseEvent, emissionId: string) => {
    e.stopPropagation()
    try {
      // In a real scenario, we fetch this from GET /emissions/{id}/history
      // Mock for demonstration in the report page list
      setHistoryLogs([
        {
          action: "Güncelleme",
          user_email: "ceo@sustainhub.online",
          timestamp: new Date().toISOString(),
          old_value: '{"scope1_co2e": "1250"}',
          new_value: '{"scope1_co2e": "1200"}',
          entity_desc: "Kapsam 1 Doğalgaz Tüketimi Güncellendi"
        },
        {
          action: "Giriş",
          user_email: "muhendis@sustainhub.online",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          old_value: null,
          new_value: '{"scope1_co2e": "1250"}',
          entity_desc: "Yeni emisyon verisi eklendi"
        }
      ])
      setHistoryModalOpen(true)
    } catch (error) {
      console.error("Failed to load history", error)
    }
  }

  const handleValidateiXBRL = async (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation()
    setValLoading(true)
    setValResult(null)
    setValModalOpen(true)
    try {
      const res = await api.reports.validateiXBRL(reportId)
      setValResult(res)
    } catch (err) {
      console.error(err)
      alert("iXBRL doğrulama hatası!")
      setValModalOpen(false)
    } finally {
      setValLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>Raporlar & Denetim</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Oluşturulan tüm TSRS raporları ve resmi onaylı çıktılar
          </p>
        </div>
        <button
          onClick={() => router.push('/veri-girisi')}
          className="px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
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
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-transform hover:scale-105"
            style={{ background: 'var(--green-700)' }}>
            Veri Girişine Git →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(r => {
            const st = STATUS_LABELS[r.status] ?? STATUS_LABELS.completed
            return (
              <div key={r.id}
                className="bg-white rounded-2xl p-5 border flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all"
                style={{ borderColor: 'var(--border)' }}
                onClick={() => router.push(`/ai-rapor?id=${r.id}`)}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'var(--green-50)', color: 'var(--green-700)' }}>
                  📄
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base truncate" style={{ color: 'var(--green-950)' }}>
                    {r.standard?.toUpperCase() || 'TSRS'} Sürdürülebilirlik Raporu {r.year || 2024}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      v{r.version_number || 1} · {new Date(r.created_at).toLocaleDateString('tr-TR')}
                    </p>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                      style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                </div>

                {r.compliance_grade && (
                  <div className="hidden sm:flex flex-col items-center justify-center border-l pl-4 pr-2" style={{ borderColor: 'var(--border)' }}>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Skor</span>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                      style={{ background: 'var(--green-700)', color: 'white' }}>
                      {r.compliance_grade}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 border-l pl-4" style={{ borderColor: 'var(--border)' }}>
                  <button 
                    onClick={(e) => handleShowHistory(e, r.emission_id || "demo")}
                    className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors tooltip"
                    title="Denetim İzi (Audit Log)">
                    <History size={18} />
                  </button>
                  <button 
                    onClick={(e) => handleValidateiXBRL(e, r.id)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                    title="iXBRL & KGK Doğrulaması">
                    🔍 iXBRL Doğrula
                  </button>
                  <button 
                    onClick={(e) => handleDownloadPDF(e, r.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white shadow transition-transform hover:scale-105"
                    style={{ background: '#0F172A' }}>
                    <Download size={16} />
                    PDF İndir
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* History (Audit Log) Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <History size={20} className="text-blue-600" />
                  Denetim İzi (Audit Trail)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">TSRS 1 Madde 9 uyumlu veri değişim geçmişi</p>
              </div>
              <button onClick={() => setHistoryModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto bg-slate-50 flex-1">
              <div className="space-y-4">
                {historyLogs.map((log, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative ml-3">
                    <div className="absolute left-[-21px] top-5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${log.action === 'Güncelleme' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {log.action}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">{log.entity_desc}</p>
                    <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                      Kullanıcı: <span className="font-mono bg-slate-100 px-1 rounded">{log.user_email}</span>
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-slate-50 border border-slate-200 rounded p-2 overflow-x-auto">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Eski Değer</p>
                        <pre className="text-[10px] text-rose-600">{log.old_value || 'NULL'}</pre>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded p-2 overflow-x-auto">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Yeni Değer</p>
                        <pre className="text-[10px] text-emerald-600">{log.new_value || 'NULL'}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iXBRL & KGK Validation Modal */}
      {valModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-900 text-white">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  🔍 iXBRL & KGK Ulusal Taksonomi Uyum Doğrulaması
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">XHTML + inline XBRL Uyum Raporu · v1.1</p>
              </div>
              <button onClick={() => setValModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-300 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50 flex-1 space-y-5">
              {valLoading ? (
                <div className="py-12 text-center space-y-3 bg-white border border-slate-200 rounded-xl">
                  <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-slate-600">iXBRL şemaları ve etiketler çözümleniyor…</p>
                </div>
              ) : valResult && (
                <>
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                    valResult.valid 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <span className="text-2xl">{valResult.valid ? '✅' : '❌'}</span>
                    <div>
                      <div className="font-bold text-sm">
                        {valResult.valid ? 'KGK Ulusal Taksonomisiyle Tam Uyumlu' : 'KGK Şema Uyum Hatası'}
                      </div>
                      <div className="text-xs mt-0.5 opacity-90">
                        {valResult.valid 
                          ? 'Tüm zorunlu sürdürülebilirlik etiketleri şemaya uygun formatta tespit edilmiştir.' 
                          : 'Rapor içerisinde zorunlu olan bazı XBRL etiketleri eksik veya geçersiz.'}
                      </div>
                    </div>
                  </div>

                  {/* Digital Signature Panel */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Kurumsal Elektronik İmza (e-Seal) Durumu</h4>
                    {valResult.digital_signature.signed ? (
                      <div className="flex gap-4 items-start bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 text-slate-700 text-xs">
                        <span className="text-lg">🔏</span>
                        <div className="space-y-1">
                          <div className="font-bold text-emerald-800">Dijital İmza / Mühür Doğrulandı</div>
                          <div>İmzalayan: <strong>{valResult.digital_signature.signer_name}</strong> ({valResult.digital_signature.signer_title})</div>
                          <div>Zaman Damgası: {new Date(valResult.digital_signature.signed_at).toLocaleString('tr-TR')}</div>
                          <div>Sağlayıcı: <span className="font-mono text-[10px] bg-white border px-1 rounded">{valResult.digital_signature.certificate_authority}</span></div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-4 items-start bg-amber-50 p-3 rounded-lg border border-amber-100 text-slate-700 text-xs">
                        <span className="text-lg">⚠️</span>
                        <div className="space-y-1">
                          <div className="font-bold text-amber-800">İmza Eksik</div>
                          <p className="text-[11px] text-amber-700">Rapor henüz onaylanmamış. Resmi KGK portalına gönderim öncesi e-imza / e-mühür atılması zorunludur.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Warnings or Errors lists */}
                  {valResult.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <h4 className="text-xs font-bold uppercase text-red-700 mb-2">Şema Hataları ({valResult.errors.length})</h4>
                      <ul className="list-disc pl-5 text-xs text-red-600 space-y-1">
                        {valResult.errors.map((err: string, i: number) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {valResult.warnings.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <h4 className="text-xs font-bold uppercase text-amber-700 mb-2">Uyarılar ({valResult.warnings.length})</h4>
                      <ul className="list-disc pl-5 text-xs text-amber-600 space-y-1">
                        {valResult.warnings.map((wrn: string, i: number) => (
                          <li key={i}>{wrn}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Detected Tags list */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <h4 className="text-xs font-bold uppercase text-slate-500">Tespit Edilen iXBRL Etiketleri ({valResult.tags_found.length})</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-700">KGK Ulusal Taksonomisi v2025</span>
                    </div>
                    <table className="w-full text-xs text-left text-slate-500">
                      <thead className="text-[10px] bg-slate-50 uppercase text-slate-600">
                        <tr>
                          <th className="py-2 px-3">Etiket (Tag)</th>
                          <th className="py-2 px-3">Tanım</th>
                          <th className="py-2 px-3">Değer (Value)</th>
                          <th className="py-2 px-3">Format</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {valResult.tags_found.map((t: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{t.tag}</td>
                            <td className="py-2.5 px-3">{t.description}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{t.value}</td>
                            <td className="py-2.5 px-3 font-mono text-[10px]">{t.format}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="text-[11px] text-slate-400">
                Sistem, XHTML çıktılarına inline XBRL formatını otomatik enjekte eder.
              </div>
              <button 
                onClick={() => setValModalOpen(false)}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow">
                Kapat
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
