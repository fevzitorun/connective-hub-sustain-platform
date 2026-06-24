'use client'
import React, { useState } from 'react'
import { Copy, CheckCircle, Send, UserPlus, FileText } from 'lucide-react'
import { api } from '@/lib/api'

export default function SuppliersPage() {
  const [inviteName, setInviteName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Mock list of suppliers for demonstration
  const [suppliers] = useState([
    { id: 1, name: "ABC Lojistik", email: "info@abclojistik.com", status: "submitted", date: "2024-05-12" },
    { id: 2, name: "XYZ Enerji", email: "contact@xyz.com", status: "pending", date: "2024-05-15" }
  ])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/suppliers/invite', { name: inviteName, email: inviteEmail })
      setGeneratedLink(res.invite_link)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Tedarikçi Ekosistemi (Kapsam 3)</h1>
        <p className="text-slate-500">Tedarikçilerinize tek tıklamalık davet linkleri göndererek Kapsam 3 emisyon verilerini şifresiz toplayın.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Yeni Davet Oluştur</h2>
          </div>
          
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Tedarikçi Adı</label>
              <input type="text" required value={inviteName} onChange={e => setInviteName(e.target.value)} 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                placeholder="Örn: X Lojistik A.Ş." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">E-posta (Opsiyonel)</label>
              <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                placeholder="ornek@sirket.com" />
            </div>
            <button type="submit" disabled={loading || !inviteName} 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              <Send size={16} />
              {loading ? 'Oluşturuluyor...' : 'Lite-Entry Linki Üret'}
            </button>
          </form>

          {generatedLink && (
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in slide-in-from-bottom-2">
              <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Paylaşım Linki (Token)</p>
              <div className="flex items-center gap-2">
                <input type="text" readOnly value={generatedLink} className="flex-1 bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-600 outline-none" />
                <button onClick={copyToClipboard} className="p-2 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors tooltip" title="Kopyala">
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <FileText size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Tedarikçi Durum Takibi</h2>
          </div>
          
          <div className="flex-1">
            <div className="space-y-3">
              {suppliers.map(s => (
                <div key={s.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-bold text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.email} • Davet: {s.date}</p>
                  </div>
                  <div>
                    {s.status === 'submitted' ? (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase rounded-full flex items-center gap-1">
                        <CheckCircle size={14} /> Veri Girildi
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase rounded-full">
                        Bekleniyor
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
