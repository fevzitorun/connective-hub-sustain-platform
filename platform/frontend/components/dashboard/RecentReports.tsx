import Link from 'next/link'

const reports = [
  {
    name: 'Akbank 2024 TSRS Sürdürülebilirlik Raporu',
    sector: '🏦 Bankacılık',
    standard: 'TSRS 1 & 2',
    lang: 'TR / EN',
    score: '87/100 · B',
    scoreColor: 'var(--green-700)',
    status: 'Yayında',
    statusClass: 'bg-green-100 text-green-800',
    date: 'Mar 2025',
  },
  {
    name: 'Akbank 2024 GAR Portalı',
    sector: '🏦 BDDK',
    standard: 'GAR / PCAF',
    lang: 'TR',
    score: '%34.2 GAR',
    scoreColor: '#00897B',
    status: 'Gönderildi',
    statusClass: 'bg-green-100 text-green-800',
    date: 'Nis 2025',
  },
  {
    name: 'Akbank 2023 Sürdürülebilirlik Raporu',
    sector: '🏦 Bankacılık',
    standard: 'TSRS 1 & 2',
    lang: 'TR / EN / DE',
    score: '76/100 · C',
    scoreColor: '#F57F17',
    status: 'Yayında',
    statusClass: 'bg-green-100 text-green-800',
    date: 'Mar 2024',
  },
  {
    name: '2025 Taslak Raporu',
    sector: '🏦 Bankacılık',
    standard: 'TSRS 1 & 2',
    lang: 'TR',
    score: 'Hesaplanıyor…',
    scoreColor: 'var(--muted-foreground)',
    status: 'Taslak',
    statusClass: 'bg-amber-100 text-amber-800',
    date: 'Devam ediyor',
  },
]

export function RecentReports() {
  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Son Raporlar</div>
        <Link
          href="/raporlar"
          className="text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors"
          style={{ borderColor: 'var(--green-700)', color: 'var(--green-700)' }}
        >
          Tümünü Gör
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              {['Rapor Adı', 'Sektör', 'Standart', 'Dil', 'TSRS Skoru', 'Durum', 'Tarih', ''].map(h => (
                <th key={h} className="pb-2 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--muted-foreground)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.name} className="border-b hover:bg-green-50/50 transition-colors"
                style={{ borderColor: 'var(--border)' }}>
                <td className="py-3 font-semibold pr-4">{r.name}</td>
                <td className="py-3 pr-4 text-xs whitespace-nowrap">{r.sector}</td>
                <td className="py-3 pr-4 text-xs">{r.standard}</td>
                <td className="py-3 pr-4 text-xs">{r.lang}</td>
                <td className="py-3 pr-4 text-xs font-bold" style={{ color: r.scoreColor }}>{r.score}</td>
                <td className="py-3 pr-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.statusClass}`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.date}</td>
                <td className="py-3">
                  <button
                    className="text-xs font-semibold px-2 py-1 rounded-md border transition-colors"
                    style={{ borderColor: 'var(--green-700)', color: 'var(--green-700)' }}
                  >
                    İndir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
