'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import type { UserProfile } from '@/types'
import { ROLE_LABELS } from '@/types'

const ROLE_OPTIONS = [
  { value: 'admin',      label: 'Yönetici',    desc: 'Her şeyi yönetir, kullanıcı ekler/siler' },
  { value: 'editor',     label: 'Editör',       desc: 'Veri girer, rapor oluşturur, onaya gönderir' },
  { value: 'viewer',     label: 'İzleyici',     desc: 'Sadece okuma yetkisi' },
  { value: 'auditor',    label: 'Denetçi',      desc: 'Rapor görüntüler, değiştiremez' },
  { value: 'data_entry', label: 'Veri Girişi',  desc: 'Yalnızca veri girebilir' },
]

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  admin:      { bg: '#E8F5E9', color: '#1B5E20' },
  editor:     { bg: '#E3F2FD', color: '#0D47A1' },
  viewer:     { bg: '#FFF3E0', color: '#E65100' },
  auditor:    { bg: '#F3E5F5', color: '#4A148C' },
  data_entry: { bg: '#E0F2F1', color: '#004D40' },
}

function RoleBadge({ role }: { role: string }) {
  const colors = ROLE_COLORS[role] ?? { bg: '#F5F5F5', color: '#424242' }
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: colors.bg, color: colors.color }}>
      {ROLE_LABELS[role] ?? role}
    </span>
  )
}

function InviteModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const [form, setForm] = useState({ email: '', name: '', role: 'editor' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ temp_password: string; email: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email || !form.name) { toast.error('Ad ve e-posta zorunludur'); return }
    setLoading(true)
    try {
      const res = await api.users.invite(form)
      setResult({ temp_password: res.temp_password, email: res.email })
      toast.success(`${res.name} davet edildi`)
      onInvited()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Davet gönderilemedi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black" style={{ color: 'var(--green-900)' }}>Kullanıcı Davet Et</h2>
          <button onClick={onClose} className="text-xl opacity-50 hover:opacity-100">×</button>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: 'var(--green-50)', border: '1px solid var(--green-300)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--green-800)' }}>
                ✅ {result.email} davet edildi
              </p>
              <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
                Geçici şifreyi kullanıcıyla paylaşın. İlk girişte değiştirmelerini isteyin.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg text-sm font-mono font-bold"
                  style={{ background: '#E8F5E9', color: 'var(--green-900)' }}>
                  {result.temp_password}
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(result.temp_password); toast.success('Kopyalandı') }}
                  className="px-3 py-2 rounded-lg text-xs font-semibold border"
                  style={{ borderColor: 'var(--green-300)', color: 'var(--green-700)' }}>
                  Kopyala
                </button>
              </div>
            </div>
            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: 'var(--green-700)' }}>
              Tamam
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Ad Soyad</label>
              <input type="text" required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--border)' }} placeholder="Ayşe Kaya" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>E-posta</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: 'var(--border)' }} placeholder="ayse@sirket.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Rol</label>
              <div className="space-y-2">
                {ROLE_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all"
                    style={form.role === opt.value
                      ? { borderColor: 'var(--green-500)', background: 'var(--green-50)' }
                      : { borderColor: 'var(--border)', background: 'white' }}>
                    <input type="radio" name="role" value={opt.value} checked={form.role === opt.value}
                      onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                      className="mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--green-900)' }}>{opt.label}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: 'var(--green-700)' }}>
              {loading ? '⏳ Davet gönderiliyor…' : '✉️ Davet Gönder'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function KullanicilerPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [forbidden, setForbidden] = useState(false)

  async function loadUsers() {
    try {
      const data = await api.users.list()
      setUsers(data)
    } catch (err) {
      if (err instanceof Error && err.message.includes('yönetici')) setForbidden(true)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      await api.users.updateRole(userId, newRole)
      toast.success('Rol güncellendi')
      loadUsers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Rol değiştirilemedi')
    }
  }

  async function handleRemove(userId: string, name: string) {
    if (!confirm(`${name} kullanıcısını şirketten kaldırmak istediğinizden emin misiniz?`)) return
    try {
      await api.users.remove(userId)
      toast.success(`${name} kaldırıldı`)
      loadUsers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kullanıcı kaldırılamadı')
    }
  }

  if (forbidden) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="rounded-2xl p-10 text-center"
          style={{ background: '#FFEBEE', border: '1px solid #FFCDD2' }}>
          <p className="text-2xl mb-3">🔒</p>
          <p className="font-bold" style={{ color: '#B71C1C' }}>Yetki Gerekli</p>
          <p className="text-sm mt-2" style={{ color: '#C62828' }}>
            Bu sayfaya erişmek için yönetici yetkisine sahip olmanız gerekmektedir.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInvited={() => { loadUsers(); setShowInvite(false) }}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--green-900)' }}>Kullanıcı Yönetimi</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Şirket hesabına bağlı kullanıcılar ve rol atamaları
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="px-4 py-2 rounded-lg text-sm font-bold text-white"
          style={{ background: 'var(--green-700)' }}>
          + Kullanıcı Davet Et
        </button>
      </div>

      {/* Role guide */}
      <div className="bg-white rounded-2xl p-5 border mb-5" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--green-900)' }}>Rol Yetki Matrisi</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {ROLE_OPTIONS.map(r => (
            <div key={r.value} className="rounded-xl p-3 text-center"
              style={{ background: ROLE_COLORS[r.value]?.bg ?? '#F5F5F5' }}>
              <RoleBadge role={r.value} />
              <p className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl p-10 text-center bg-white border" style={{ borderColor: 'var(--border)' }}>
          <p style={{ color: 'var(--muted-foreground)' }}>Yükleniyor…</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--green-50)' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: 'var(--green-900)' }}>Kullanıcı</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: 'var(--green-900)' }}>E-posta</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: 'var(--green-900)' }}>Rol</th>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: 'var(--green-900)' }}>Katılım</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'var(--green-100)', color: 'var(--green-800)' }}>
                        {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-xs" style={{ color: 'var(--foreground)' }}>
                          {u.name}
                          {u.is_self && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--green-100)', color: 'var(--green-700)' }}>Siz</span>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{u.email}</td>
                  <td className="px-5 py-3">
                    {u.is_self ? (
                      <RoleBadge role={u.role} />
                    ) : (
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold border-0 outline-none cursor-pointer"
                        style={{ background: ROLE_COLORS[u.role]?.bg ?? '#F5F5F5', color: ROLE_COLORS[u.role]?.color ?? '#424242' }}>
                        {ROLE_OPTIONS.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {new Date(u.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {!u.is_self && (
                      <button
                        onClick={() => handleRemove(u.id, u.name)}
                        className="text-xs px-2.5 py-1 rounded-lg border transition-all"
                        style={{ borderColor: '#FFCDD2', color: '#B71C1C', background: '#FFEBEE' }}>
                        Kaldır
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
