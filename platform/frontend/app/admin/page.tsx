'use client'
import { useState } from 'react'
import { api } from '@/lib/api'

// ── Mock data (Sprint 18'de canlı API'ye bağlanacak) ─────────────────────────
const COMPANIES = [
  { id: '1', name: 'Akbank T.A.Ş.', sector: 'Bankacılık', plan: 'Enterprise', employees: 15000, co2e: 48200, reports: 12, score: 'A+', exporter: false, joined: '2026-03-12' },
  { id: '2', name: 'Koç Holding A.Ş.', sector: 'Konglomera', plan: 'Enterprise', employees: 90000, co2e: 312000, reports: 8, score: 'A', exporter: true, joined: '2026-03-28' },
  { id: '3', name: 'Ereğli Demir Çelik', sector: 'Demir-Çelik', plan: 'Pro', employees: 8200, co2e: 2100000, reports: 5, score: 'B+', exporter: true, joined: '2026-04-05' },
  { id: '4', name: 'Migros Ticaret A.Ş.', sector: 'Perakende', plan: 'Pro', employees: 25000, co2e: 87000, reports: 4, score: 'B', exporter: false, joined: '2026-04-19' },
  { id: '5', name: 'Arçelik A.Ş.', sector: 'Üretim', plan: 'Enterprise', employees: 40000, co2e: 234000, reports: 9, score: 'A', exporter: true, joined: '2026-05-01' },
  { id: '6', name: 'Türk Telekom A.Ş.', sector: 'Telekom', plan: 'Pro', employees: 35000, co2e: 156000, reports: 3, score: 'B+', exporter: false, joined: '2026-05-14' },
  { id: '7', name: 'Şişecam A.Ş.', sector: 'Cam & Kimya', plan: 'Pro', employees: 21000, co2e: 890000, reports: 6, score: 'B', exporter: true, joined: '2026-05-22' },
  { id: '8', name: 'Atlas Üniversitesi', sector: 'Eğitim', plan: 'Starter', employees: 1200, co2e: 3400, reports: 2, score: 'B+', exporter: false, joined: '2026-06-02' },
]

const SAGES = [
  { name: 'Fevzi Torun', title: 'CEO & Co-Founder', location: 'İstanbul / Londra', role: 'admin', status: 'active', avatar: 'FT', color: '#10b981' },
  { name: 'Deniz Erkuş', title: 'CFO & Board Member', location: 'İstanbul', role: 'editor', status: 'invited', avatar: 'DE', color: '#3b82f6' },
  { name: 'Erbil Büyükbay', title: 'Research Institute Lead', location: 'İstanbul', role: 'editor', status: 'active', avatar: 'EB', color: '#8b5cf6' },
  { name: 'Sarah Mitchell', title: 'UK Market Director', location: 'Londra', role: 'auditor', status: 'invited', avatar: 'SM', color: '#ec4899' },
  { name: 'Dr. Klaus Weber', title: 'EU Regulatory Advisor', location: 'Zürih', role: 'auditor', status: 'pending', avatar: 'KW', color: '#f59e0b' },
  { name: 'Amira Hassan', title: 'GCC Strategy Lead', location: 'Dubai', role: 'viewer', status: 'pending', avatar: 'AH', color: '#06b6d4' },
  { name: '[ 7. Üye ]', title: 'Teknoloji Yatırımcısı', location: '—', role: 'viewer', status: 'open', avatar: '?', color: '#334155' },
]

const LEADS = [
  { id: 'L001', company: 'Koç Holding', action: 'MACC Simülatörü çalıştırdı', detail: '5 önlem, €1.2M tasarruf senaryosu', time: '2 saat önce', hot: true },
  { id: 'L002', company: 'Ereğli Demir Çelik', action: 'CBAM Hesaplayıcı kullandı', detail: '€4.8M yıllık CBAM yükümlülüğü tespit edildi', time: '5 saat önce', hot: true },
  { id: 'L003', company: 'Şişecam A.Ş.', action: 'EUDR Uyum Sertifikası talep etti', detail: '3 tedarikçi için sertifika üretildi', time: '1 gün önce', hot: false },
  { id: 'L004', company: 'Migros Ticaret', action: 'Pro Plan simüle etti', detail: 'Checkout adımına geldi, geri döndü', time: '1 gün önce', hot: false },
  { id: 'L005', company: 'Atlas Üniversitesi', action: 'GreenMetric simülatörü kullandı', detail: '+1200 puan senaryosu — Top 100 hedefi', time: '2 gün önce', hot: false },
  { id: 'L006', company: 'Türk Telekom', action: 'Satellite Risk analizi yaptı', detail: '3 bölge deprem + sel riski haritalandı', time: '3 gün önce', hot: false },
]

const SCORE_COLORS: Record<string, { bg: string; text: string }> = {
  'A+': { bg: '#dcfce7', text: '#166534' },
  'A':  { bg: '#d1fae5', text: '#065f46' },
  'B+': { bg: '#fef9c3', text: '#854d0e' },
  'B':  { bg: '#fef3c7', text: '#92400e' },
  'C':  { bg: '#fee2e2', text: '#991b1b' },
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  active:  { bg: '#dcfce7', text: '#166534', label: 'Aktif' },
  invited: { bg: '#dbeafe', text: '#1e40af', label: 'Davet Gönderildi' },
  pending: { bg: '#fef9c3', text: '#854d0e', label: 'Müzakerede' },
  open:    { bg: '#f1f5f9', text: '#64748b', label: 'Açık Pozisyon' },
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Platform Admin', editor: 'YK Üyesi', auditor: 'Danışman', viewer: 'Gözlemci',
}

type Tab = 'companies' | 'sages' | 'leads' | 'advisory'

const PRIORITY_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  strategic: { bg: '#fef9c3', text: '#854d0e', label: 'Stratejik' },
  urgent:    { bg: '#fee2e2', text: '#991b1b', label: 'Acil' },
  normal:    { bg: '#f1f5f9', text: '#475569', label: 'Normal' },
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('companies')
  const [search, setSearch] = useState('')

  // Advisory state
  const [noteCompany, setNoteCompany] = useState(COMPANIES[0].id)
  const [noteContent, setNoteContent] = useState('')
  const [notePriority, setNotePriority] = useState('normal')
  const [noteTitle, setNoteTitle] = useState('Managing Partner, Europe')
  const [noteSending, setNoteSending] = useState(false)
  const [noteSent, setNoteSent] = useState(false)

  async function handleSendNote() {
    if (!noteContent.trim()) return
    setNoteSending(true)
    try {
      await api.advisory.createNote({
        company_id: noteCompany,
        content: noteContent,
        priority: notePriority,
        author_title: noteTitle,
      })
      setNoteSent(true)
      setNoteContent('')
      setTimeout(() => setNoteSent(false), 3000)
    } catch {
      // Note: requires auth token — demo mode shows UI only
    } finally {
      setNoteSending(false)
    }
  }

  const totalCO2 = COMPANIES.reduce((a, c) => a + c.co2e, 0)
  const totalReports = COMPANIES.reduce((a, c) => a + c.reports, 0)
  const exporters = COMPANIES.filter(c => c.exporter).length
  const hotLeads = LEADS.filter(l => l.hot).length

  const filteredCompanies = COMPANIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.sector.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">🏢 Global Admin Cockpit</h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            SustainHub.online · Platform Kumanda Merkezi · {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/p/sustainhub"
            className="px-4 py-2 rounded-xl text-sm font-bold border transition-all"
            style={{ borderColor: '#334155', color: '#94a3b8' }}
          >
            Halka Açık Profil
          </a>
          <a
            href="/pitch-deck.html"
            target="_blank"
            className="px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: '#10b981' }}
          >
            🎯 Pitch Deck
          </a>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Kayıtlı Şirket', value: COMPANIES.length.toString(), icon: '🏭', sub: '+3 bu hafta' },
          { label: 'Toplam Emisyon', value: `${(totalCO2 / 1000000).toFixed(1)}M`, icon: '🌿', sub: 'ton CO₂e takip' },
          { label: 'Üretilen Rapor', value: totalReports.toString(), icon: '📄', sub: 'AI raporlar' },
          { label: 'İhracatçı', value: exporters.toString(), icon: '🇪🇺', sub: 'CBAM / EUDR kapsam' },
          { label: 'Sıcak Lead', value: hotLeads.toString(), icon: '🔥', sub: 'Dönüşüm fırsatı' },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-5 border" style={{ background: '#1e293b', borderColor: '#334155' }}>
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="text-2xl font-black text-white">{k.value}</div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: '#e2e8f0' }}>{k.label}</div>
            <div className="text-xs mt-1" style={{ color: '#64748b' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#1e293b' }}>
        {([
          { key: 'companies', label: '🏭 Şirket Yönetimi', count: COMPANIES.length },
          { key: 'sages', label: '👑 7 Bilge Portalı', count: SAGES.filter(s => s.status === 'active').length },
          { key: 'leads', label: '🔥 Marketplace Leads', count: hotLeads },
          { key: 'advisory', label: '📝 Stratejik Yorumlar', count: 0 },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
            style={tab === t.key
              ? { background: '#0F172A', color: '#10b981' }
              : { color: '#64748b' }}
          >
            {t.label}
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#334155', color: '#94a3b8' }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── COMPANIES ──────────────────────────────────────────────────── */}
      {tab === 'companies' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Şirket veya sektör ara…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm border"
              style={{ background: '#1e293b', borderColor: '#334155', color: '#e2e8f0', width: 280 }}
            />
            <button className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#10b981', color: '#fff' }}>
              + Şirket Ekle
            </button>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#334155' }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-left" style={{ background: '#1e293b', borderColor: '#334155' }}>
                  {['Şirket', 'Sektör', 'Plan', 'Çalışan', 'CO₂e (ton)', 'Raporlar', 'Sustain-Score', 'CBAM/EUDR', 'Kayıt'].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold" style={{ color: '#64748b' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#1e293b' }}>
                {filteredCompanies.map(c => {
                  const sc = SCORE_COLORS[c.score] ?? { bg: '#f1f5f9', text: '#64748b' }
                  return (
                    <tr key={c.id} className="transition-colors" style={{ background: '#0F172A' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#1e293b')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#0F172A')}>
                      <td className="px-4 py-3 font-bold text-white">{c.name}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{c.sector}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded font-bold"
                          style={{ background: c.plan === 'Enterprise' ? '#10b981' : c.plan === 'Pro' ? '#3b82f6' : '#334155', color: '#fff' }}>
                          {c.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{c.employees.toLocaleString('tr-TR')}</td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: '#e2e8f0' }}>
                        {c.co2e >= 1000000 ? `${(c.co2e/1000000).toFixed(1)}M` : c.co2e >= 1000 ? `${(c.co2e/1000).toFixed(0)}K` : c.co2e}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{c.reports}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: sc.bg, color: sc.text }}>
                          {c.score}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {c.exporter ? (
                          <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: '#dbeafe', color: '#1e40af' }}>
                            🇪🇺 Kapsam
                          </span>
                        ) : (
                          <span style={{ color: '#334155' }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#64748b' }}>{c.joined}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 7 SAGES ────────────────────────────────────────────────────── */}
      {tab === 'sages' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {SAGES.map((sage, i) => {
              const st = STATUS_STYLE[sage.status]
              return (
                <div key={i} className="rounded-xl p-5 border flex items-start gap-4 transition-all"
                  style={{ background: '#1e293b', borderColor: sage.status === 'active' ? '#10b981' : '#334155' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                    style={{ background: sage.color }}>
                    {sage.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white">{sage.name}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: st.bg, color: st.text }}>
                        {st.label}
                      </span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{sage.title}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs" style={{ color: '#64748b' }}>📍 {sage.location}</span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#334155', color: '#94a3b8' }}>
                        {ROLE_LABEL[sage.role]}
                      </span>
                    </div>
                    {sage.status !== 'active' && sage.name !== '[ 7. Üye ]' && (
                      <button className="mt-3 text-xs px-3 py-1.5 rounded-lg font-bold border transition-all"
                        style={{ borderColor: '#10b981', color: '#10b981' }}>
                        {sage.status === 'invited' ? '✉️ Davet Yenile' : sage.status === 'pending' ? '📞 Takip Et' : '＋ Davet Et'}
                      </button>
                    )}
                    {sage.name === '[ 7. Üye ]' && (
                      <button className="mt-3 text-xs px-3 py-1.5 rounded-lg font-bold text-white"
                        style={{ background: '#7c3aed' }}>
                        ＋ Pozisyon Doldur
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="rounded-xl p-5 border" style={{ background: '#1e293b', borderColor: '#334155' }}>
            <h3 className="font-bold text-white mb-3">Yönetim Kurulu Özeti</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              {[
                { label: 'Aktif Üye', value: SAGES.filter(s=>s.status==='active').length, color: '#10b981' },
                { label: 'Müzakerede', value: SAGES.filter(s=>s.status==='pending'||s.status==='invited').length, color: '#f59e0b' },
                { label: 'Açık Pozisyon', value: SAGES.filter(s=>s.status==='open').length, color: '#64748b' },
                { label: 'Hedef Kapasite', value: 7, color: '#3b82f6' },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-lg" style={{ background: '#0F172A' }}>
                  <div className="text-2xl font-black" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-xs mt-1" style={{ color: '#64748b' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LEADS ──────────────────────────────────────────────────────── */}
      {tab === 'leads' && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: '#64748b' }}>
            Platformdaki simülasyon aktiviteleri — her "yüksek-niyetli" eylem bir satış fırsatı.
          </p>
          {LEADS.map(lead => (
            <div key={lead.id} className="rounded-xl p-5 border flex items-start gap-4"
              style={{ background: '#1e293b', borderColor: lead.hot ? '#f97316' : '#334155' }}>
              <div className="text-xl">{lead.hot ? '🔥' : '📊'}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{lead.company}</span>
                  {lead.hot && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: '#fed7aa', color: '#c2410c' }}>
                      Sıcak Lead
                    </span>
                  )}
                  <span className="text-xs ml-auto" style={{ color: '#64748b' }}>{lead.time}</span>
                </div>
                <div className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>{lead.action}</div>
                <div className="text-xs mt-1" style={{ color: '#64748b' }}>{lead.detail}</div>
              </div>
              <button className="text-xs px-3 py-1.5 rounded-lg font-bold flex-shrink-0"
                style={{ background: '#10b981', color: '#fff' }}>
                Demo Yolla
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── ADVISORY ───────────────────────────────────────────────────── */}
      {tab === 'advisory' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Compose */}
          <div className="rounded-xl p-6 border space-y-4" style={{ background: '#1e293b', borderColor: '#334155' }}>
            <h3 className="font-bold text-white">Yeni Stratejik Not</h3>
            <p className="text-xs" style={{ color: '#64748b' }}>
              YK notu şirketin dashboard'unda altın zarf olarak görünür.
            </p>

            <div>
              <label className="text-xs font-bold" style={{ color: '#94a3b8' }}>Şirket</label>
              <select value={noteCompany} onChange={e => setNoteCompany(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: '#0F172A', color: '#e2e8f0', border: '1px solid #334155' }}>
                {COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold" style={{ color: '#94a3b8' }}>Ünvan (imza)</label>
              <input value={noteTitle} onChange={e => setNoteTitle(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg text-sm"
                style={{ background: '#0F172A', color: '#e2e8f0', border: '1px solid #334155' }} />
            </div>

            <div>
              <label className="text-xs font-bold" style={{ color: '#94a3b8' }}>Öncelik</label>
              <div className="flex gap-2 mt-1">
                {(['normal', 'strategic', 'urgent'] as const).map(p => (
                  <button key={p} onClick={() => setNotePriority(p)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={notePriority === p
                      ? { background: PRIORITY_STYLE[p].bg, color: PRIORITY_STYLE[p].text }
                      : { background: '#334155', color: '#64748b' }}>
                    {PRIORITY_STYLE[p].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold" style={{ color: '#94a3b8' }}>Not İçeriği</label>
              <textarea rows={5} value={noteContent} onChange={e => setNoteContent(e.target.value)}
                placeholder="Örn: Scope 3 verilerindeki %10'luk sapma, yeşil tahvil başvurunuzu olumsuz etkileyebilir. Bu ay düzeltme önceliklendirilmeli."
                className="mt-1 w-full px-3 py-2 rounded-lg text-sm resize-none"
                style={{ background: '#0F172A', color: '#e2e8f0', border: '1px solid #334155' }} />
            </div>

            <button onClick={handleSendNote} disabled={noteSending || !noteContent.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all"
              style={{ background: noteSent ? '#10b981' : '#7c3aed' }}>
              {noteSent ? '✓ Not Gönderildi' : noteSending ? 'Gönderiliyor…' : '📝 Stratejik Not Gönder'}
            </button>
          </div>

          {/* Info panel */}
          <div className="space-y-4">
            <div className="rounded-xl p-5 border" style={{ background: '#1e293b', borderColor: '#334155' }}>
              <h3 className="font-bold text-white mb-3">Nasıl Çalışır?</h3>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'YK üyesi (editor+ rol) bu ekrandan şirket seçer ve not yazar.' },
                  { step: '2', text: 'Not backend\'e kaydedilir, şirket dashboard\'unda altın zarf ikonu belirir.' },
                  { step: '3', text: 'Şirket yöneticisi zarfa tıklar, notu okur; okundu olarak işaretlenir.' },
                  { step: '4', text: 'Acil notlar kırmızı, stratejik notlar sarı, normal notlar gri rozet taşır.' },
                ].map(s => (
                  <div key={s.step} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: '#7c3aed', color: '#fff' }}>{s.step}</div>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-5 border" style={{ background: '#1e293b', borderColor: '#10b981' }}>
              <div className="text-xs font-bold mb-2" style={{ color: '#10b981' }}>Sustaihub.com ile fark</div>
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                Rakiplerimizde YK üyeleri platformu sadece izleyebilir. SustainHub&apos;da 7 Bilge şirketlere
                doğrudan stratejik yönlendirme yapabilir — platform bir &quot;Danışmanlık Aracı&quot;na dönüşür.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
