'use client'
import { Header } from '@/components/layout/Header'

const auditLogs = [
  { id: 1, user: 'Kemal Yılmaz', role: 'editor', action: 'Rapor Oluşturuldu', entity: 'TSRS 2024 Raporu v3', time: '2026-06-19 14:32', ip: '85.105.x.x', status: 'ok' },
  { id: 2, user: 'Zeynep Kaya', role: 'data_entry', action: 'Emisyon Verisi Güncellendi', entity: 'EmissionRecord #2024-001', time: '2026-06-19 11:15', ip: '85.105.x.x', status: 'ok' },
  { id: 3, user: 'Ahmet Demir', role: 'admin', action: 'Kullanıcı Rolü Değiştirildi', entity: 'Zeynep Kaya → editor', time: '2026-06-18 16:44', ip: '31.223.x.x', status: 'ok' },
  { id: 4, user: 'Kemal Yılmaz', role: 'editor', action: 'Rapor Onaya Gönderildi', entity: 'TSRS 2024 Raporu v2', time: '2026-06-18 09:20', ip: '85.105.x.x', status: 'ok' },
  { id: 5, user: 'Sistem', role: 'system', action: 'CSV Toplu Yükleme', entity: '127 satır emissions_2024.csv', time: '2026-06-17 22:00', ip: 'system', status: 'ok' },
  { id: 6, user: 'Ali Korkmaz', role: 'viewer', action: 'Yetkisiz Erişim Girişimi', entity: 'DELETE /reports/42', time: '2026-06-17 15:33', ip: '78.186.x.x', status: 'warn' },
  { id: 7, user: 'Ahmet Demir', role: 'admin', action: 'Rapor Onaylandı', entity: 'TSRS 2024 Raporu v1', time: '2026-06-16 11:00', ip: '31.223.x.x', status: 'ok' },
]

const roleColor: Record<string, string> = {
  admin: '#fef9c3',
  editor: '#dbeafe',
  data_entry: '#dcfce7',
  auditor: '#f3e8ff',
  viewer: '#f3f4f6',
  system: '#f1f5f9',
}
const roleText: Record<string, string> = {
  admin: '#854d0e',
  editor: '#1e40af',
  data_entry: '#166534',
  auditor: '#6b21a8',
  viewer: '#374151',
  system: '#475569',
}

export default function AuditPage() {
  return (
    <>
      <Header title="🔍 Denetim İzi" subtitle="Tüm kullanıcı ve sistem aktiviteleri · TSRS 1 Madde 9" />
      <div className="p-6 flex-1 space-y-5">

        {/* Özet */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Bu Ay İşlem', value: '1.248', icon: '📋', sub: 'Tüm kullanıcılar' },
            { label: 'Aktif Kullanıcı', value: '6', icon: '👥', sub: 'Son 30 gün' },
            { label: 'Uyarı', value: '2', icon: '⚠️', sub: 'Yetkisiz girişim' },
            { label: 'Denetim Kapsamı', value: '%100', icon: '✅', sub: 'Tüm API çağrıları' },
          ].map((k) => (
            <div key={k.label} className="bg-white rounded-xl border p-5" style={{ borderColor: 'var(--border)' }}>
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className="text-xl font-bold" style={{ color: 'var(--green-800)' }}>{k.value}</div>
              <div className="text-xs font-semibold mt-0.5">{k.label}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Filtre */}
        <div className="bg-white rounded-xl border p-4 flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
          <select className="border rounded-md px-3 py-1.5 text-xs" style={{ borderColor: 'var(--border)' }}>
            <option>Tüm Kullanıcılar</option>
            <option>Kemal Yılmaz</option>
            <option>Zeynep Kaya</option>
          </select>
          <select className="border rounded-md px-3 py-1.5 text-xs" style={{ borderColor: 'var(--border)' }}>
            <option>Tüm İşlemler</option>
            <option>Rapor</option>
            <option>Emisyon</option>
            <option>Kullanıcı</option>
          </select>
          <input
            type="date"
            className="border rounded-md px-3 py-1.5 text-xs"
            style={{ borderColor: 'var(--border)' }}
            defaultValue="2026-06-01"
          />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>—</span>
          <input
            type="date"
            className="border rounded-md px-3 py-1.5 text-xs"
            style={{ borderColor: 'var(--border)' }}
            defaultValue="2026-06-19"
          />
          <button
            className="ml-auto px-3 py-1.5 text-xs font-semibold rounded-md border"
            style={{ borderColor: 'var(--green-700)', color: 'var(--green-700)' }}
          >
            CSV İndir
          </button>
        </div>

        {/* Log tablosu */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-left" style={{ borderColor: 'var(--border)', background: '#f9fafb' }}>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Zaman</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Kullanıcı</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>İşlem</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Etkilenen Nesne</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>IP</th>
                <th className="px-4 py-3 font-semibold" style={{ color: 'var(--muted-foreground)' }}>Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {auditLogs.map((log) => (
                <tr key={log.id} className={log.status === 'warn' ? 'bg-amber-50' : ''}>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
                    {log.time}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold">{log.user}</div>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: roleColor[log.role] || '#f3f4f6', color: roleText[log.role] || '#374151' }}
                    >
                      {log.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">{log.action}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{log.entity}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{log.ip}</td>
                  <td className="px-4 py-3">
                    {log.status === 'ok' ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">OK</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">UYARI</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  )
}
