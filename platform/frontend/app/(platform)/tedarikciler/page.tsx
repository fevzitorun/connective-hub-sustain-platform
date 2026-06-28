'use client'
import { useState, useEffect } from 'react'
import { Copy, CheckCircle, Send, UserPlus, FileText, ShieldCheck, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

type Tab = 'invite' | 'status' | 'audit'

type AuditQuestion = {
  id: string; category: string; question: string; weight: number; red_flag_if: string | null
}

type AuditResult = {
  supplier_name: string; score_pct: number; grade: string; grade_color: string
  red_flags: Array<{ question_id: string; category: string; question: string; answer: string; severity: string }>
  critical_flag_count: number; requires_immediate_action: boolean
  category_breakdown: Record<string, number>; recommendation: string
}

const CATEGORIES = ['Çalışma Hakları', 'İSG', 'Çevre', 'Etik', 'Tedarik Zinciri']

const CATEGORY_STYLE: Record<string, { bg: string; color: string }> = {
  'Çalışma Hakları': { bg: '#dbeafe', color: '#1e40af' },
  'İSG':             { bg: '#dcfce7', color: '#166534' },
  'Çevre':           { bg: '#d1fae5', color: '#065f46' },
  'Etik':            { bg: '#fef9c3', color: '#854d0e' },
  'Tedarik Zinciri': { bg: '#ede9fe', color: '#5b21b6' },
}

export default function SuppliersPage() {
  const [tab, setTab] = useState<Tab>('invite')

  // Invite tab state
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const [suppliers] = useState([
    { id: 1, name: 'ABC Lojistik', email: 'info@abclojistik.com', status: 'submitted', date: '2024-05-12' },
    { id: 2, name: 'XYZ Enerji', email: 'contact@xyz.com', status: 'pending', date: '2024-05-15' },
  ])

  // Audit tab state
  const [questions, setQuestions] = useState<AuditQuestion[]>([])
  const [supplierName, setSupplierName] = useState('')
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)

  useEffect(() => {
    if (tab === 'audit' && questions.length === 0) {
      api.supplierAudit.questions().then(d => setQuestions(d.questions)).catch(() => {})
    }
  }, [tab, questions.length])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.suppliers.invite({ name: inviteName, email: inviteEmail })
      setGeneratedLink(res.invite_link)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAuditSubmit = async () => {
    if (!supplierName) { toast.error('Tedarikçi adını girin'); return }
    const unanswered = questions.filter(q => !responses[q.id])
    if (unanswered.length > 0) { toast.error(`${unanswered.length} soru yanıtsız`); return }
    setAuditLoading(true)
    try {
      const res = await api.supplierAudit.score({ supplier_name: supplierName, responses })
      setAuditResult(res)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Puanlama hatası')
    } finally { setAuditLoading(false) }
  }

  const groupedQuestions = CATEGORIES.map(cat => ({
    cat,
    qs: questions.filter(q => q.category === cat),
  })).filter(g => g.qs.length > 0)

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'invite', label: 'Davet Oluştur', icon: <UserPlus size={16} /> },
    { id: 'status', label: 'Durum Takibi', icon: <FileText size={16} /> },
    { id: 'audit', label: 'ESG Denetimi', icon: <ShieldCheck size={16} /> },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: '#1e293b' }}>Tedarikçi Ekosistemi (Kapsam 3)</h1>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>
          Tedarikçi davet, durum takibi ve RBA + ISO 26000 tabanlı ESG denetimi
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 border-b" style={{ borderColor: '#e2e8f0' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-colors"
            style={{
              color: tab === t.id ? '#065f46' : '#64748b',
              borderBottom: tab === t.id ? '2px solid #065f46' : '2px solid transparent',
            }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Invite Tab */}
      {tab === 'invite' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: '#e2e8f0' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#d1fae5', color: '#065f46' }}>
                <UserPlus size={20} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: '#1e293b' }}>Yeni Davet Oluştur</h2>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>Tedarikçi Adı</label>
                <input type="text" required value={inviteName} onChange={e => setInviteName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none" style={{ borderColor: '#e2e8f0' }}
                  placeholder="Örn: X Lojistik A.Ş." />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>E-posta (Opsiyonel)</label>
                <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg outline-none" style={{ borderColor: '#e2e8f0' }}
                  placeholder="ornek@sirket.com" />
              </div>
              <button type="submit" disabled={loading || !inviteName}
                className="w-full text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: '#1e293b' }}>
                <Send size={16} />
                {loading ? 'Oluşturuluyor...' : 'Lite-Entry Linki Üret'}
              </button>
            </form>
            {generatedLink && (
              <div className="mt-6 p-4 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p className="text-xs font-bold uppercase mb-2" style={{ color: '#64748b' }}>Paylaşım Linki</p>
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value={generatedLink}
                    className="flex-1 bg-white border rounded px-3 py-1.5 text-xs outline-none" style={{ borderColor: '#e2e8f0' }} />
                  <button onClick={copyToClipboard}
                    className="p-2 rounded" style={{ background: '#d1fae5', color: '#065f46' }}>
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: '#e2e8f0' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                <FileText size={20} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: '#1e293b' }}>Tedarikçi Durum Takibi</h2>
            </div>
            <div className="space-y-3">
              {suppliers.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 border rounded-xl" style={{ borderColor: '#f1f5f9' }}>
                  <div>
                    <p className="font-bold" style={{ color: '#1e293b' }}>{s.name}</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>{s.email} · Davet: {s.date}</p>
                  </div>
                  {s.status === 'submitted' ? (
                    <span className="px-3 py-1 text-xs font-bold uppercase rounded-full flex items-center gap-1"
                      style={{ background: '#d1fae5', color: '#065f46' }}>
                      <CheckCircle size={14} /> Veri Girildi
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-bold uppercase rounded-full"
                      style={{ background: '#fef9c3', color: '#854d0e' }}>
                      Bekleniyor
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Tab */}
      {tab === 'status' && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: '#e2e8f0' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: '#1e293b' }}>Tüm Tedarikçiler</h2>
          <div className="space-y-3">
            {suppliers.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 border rounded-xl" style={{ borderColor: '#f1f5f9' }}>
                <div>
                  <p className="font-bold" style={{ color: '#1e293b' }}>{s.name}</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>{s.email} · Davet: {s.date}</p>
                </div>
                {s.status === 'submitted' ? (
                  <span className="px-3 py-1 text-xs font-bold uppercase rounded-full" style={{ background: '#d1fae5', color: '#065f46' }}>
                    Veri Girildi
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-bold uppercase rounded-full" style={{ background: '#fef9c3', color: '#854d0e' }}>
                    Bekleniyor
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ESG Audit Tab */}
      {tab === 'audit' && (
        <div className="space-y-6">
          {!auditResult ? (
            <>
              <div className="rounded-2xl border p-5" style={{ borderColor: '#e2e8f0' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>Tedarikçi Adı</p>
                <input type="text" value={supplierName} onChange={e => setSupplierName(e.target.value)}
                  placeholder="Örn: ABC Tekstil A.Ş."
                  className="w-full max-w-sm px-4 py-2.5 border rounded-xl text-sm outline-none"
                  style={{ borderColor: '#e2e8f0' }} />
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-12" style={{ color: '#64748b' }}>Sorular yükleniyor…</div>
              ) : (
                groupedQuestions.map(({ cat, qs }) => {
                  const style = CATEGORY_STYLE[cat] ?? { bg: '#f1f5f9', color: '#475569' }
                  return (
                    <div key={cat} className="rounded-2xl border overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
                      <div className="px-5 py-3 text-xs font-bold uppercase tracking-wider"
                        style={{ background: style.bg, color: style.color }}>
                        {cat}
                      </div>
                      <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
                        {qs.map(q => (
                          <div key={q.id} className="px-5 py-4 flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <span className="text-xs font-bold mr-2" style={{ color: '#94a3b8' }}>{q.id}</span>
                              <span className="text-sm" style={{ color: '#374151' }}>{q.question}</span>
                              {q.weight >= 3 && (
                                <span className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: '#fee2e2', color: '#991b1b' }}>Kritik</span>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              {(['yes', 'partial', 'no'] as const).map(val => {
                                const active = responses[q.id] === val
                                const labelMap = { yes: 'Evet', partial: 'Kısmi', no: 'Hayır' }
                                const colorMap = {
                                  yes: active ? { bg: '#dcfce7', color: '#166534', border: '#86efac' } : { bg: 'white', color: '#64748b', border: '#e2e8f0' },
                                  partial: active ? { bg: '#fef9c3', color: '#854d0e', border: '#fcd34d' } : { bg: 'white', color: '#64748b', border: '#e2e8f0' },
                                  no: active ? { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' } : { bg: 'white', color: '#64748b', border: '#e2e8f0' },
                                }
                                const c = colorMap[val]
                                return (
                                  <button key={val} onClick={() => setResponses(r => ({ ...r, [q.id]: val }))}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
                                    style={{ background: c.bg, color: c.color, borderColor: c.border }}>
                                    {labelMap[val]}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}

              {questions.length > 0 && (
                <button onClick={handleAuditSubmit} disabled={auditLoading}
                  className="px-8 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: '#065f46' }}>
                  {auditLoading ? 'Hesaplanıyor…' : 'ESG Skoru Hesapla'}
                </button>
              )}
            </>
          ) : (
            /* Result Panel */
            <div className="space-y-6">
              {/* Score hero */}
              <div className="rounded-2xl p-8 text-center"
                style={{ background: auditResult.requires_immediate_action ? '#fff1f2' : '#f0fdf4', border: `2px solid ${auditResult.grade_color}` }}>
                <div className="text-6xl font-black mb-2" style={{ color: auditResult.grade_color }}>
                  {auditResult.score_pct}
                </div>
                <div className="text-sm mb-1" style={{ color: '#64748b' }}>/ 100 puan</div>
                <div className="text-2xl font-bold" style={{ color: auditResult.grade_color }}>{auditResult.grade}</div>
                <div className="text-sm mt-1" style={{ color: '#64748b' }}>{auditResult.supplier_name}</div>
              </div>

              {/* Critical Alert */}
              {auditResult.requires_immediate_action && (
                <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: '#fee2e2', border: '1px solid #fca5a5' }}>
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#991b1b' }}>Acil Aksiyon Gerekli</p>
                    <p className="text-xs mt-0.5" style={{ color: '#b91c1c' }}>
                      {auditResult.critical_flag_count} kritik Red Flag tespit edildi. {auditResult.recommendation}
                    </p>
                  </div>
                </div>
              )}

              {/* Category breakdown */}
              <div className="rounded-2xl border p-6" style={{ borderColor: '#e2e8f0' }}>
                <h3 className="font-bold text-sm mb-4" style={{ color: '#1e293b' }}>Kategori Puanları</h3>
                <div className="space-y-3">
                  {Object.entries(auditResult.category_breakdown).map(([cat, pct]) => {
                    const style = CATEGORY_STYLE[cat] ?? { bg: '#f1f5f9', color: '#475569' }
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-xs font-bold w-36 shrink-0" style={{ color: style.color }}>{cat}</span>
                        <div className="flex-1 h-2 rounded-full" style={{ background: '#e2e8f0' }}>
                          <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: style.color }} />
                        </div>
                        <span className="text-xs font-bold w-8 text-right" style={{ color: style.color }}>{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Red Flags */}
              {auditResult.red_flags.length > 0 && (
                <div className="rounded-2xl border p-6" style={{ borderColor: '#e2e8f0' }}>
                  <h3 className="font-bold text-sm mb-4" style={{ color: '#991b1b' }}>Red Flags ({auditResult.red_flags.length})</h3>
                  <div className="space-y-3">
                    {auditResult.red_flags.map(f => (
                      <div key={f.question_id} className="flex items-start gap-3 rounded-xl p-3"
                        style={{ background: f.severity === 'critical' ? '#fee2e2' : '#fff7ed' }}>
                        <span className="text-xs font-black px-2 py-0.5 rounded shrink-0"
                          style={{ background: f.severity === 'critical' ? '#dc2626' : '#ea580c', color: '#fff' }}>
                          {f.severity === 'critical' ? 'KRİTİK' : 'YÜKSEK'}
                        </span>
                        <div>
                          <span className="text-xs font-bold mr-1" style={{ color: '#94a3b8' }}>{f.question_id}</span>
                          <span className="text-xs" style={{ color: '#374151' }}>{f.question}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setAuditResult(null); setResponses({}); setSupplierName('') }}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold border" style={{ borderColor: '#e2e8f0', color: '#64748b' }}>
                  Yeni Denetim
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
