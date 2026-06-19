interface KpiCardProps {
  label: string
  value: string
  unit: string
  trend: string
  trendDown?: boolean
  icon: string
  accentColor: string
}

function KpiCard({ label, value, unit, trend, trendDown = true, icon, accentColor }: KpiCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white border p-5 shadow-sm"
      style={{ borderColor: 'var(--border)' }}>
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ background: accentColor }}
      />
      <div className="text-xs font-semibold uppercase tracking-wider mb-2"
        style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </div>
      <div className="text-3xl font-black leading-none" style={{ color: 'var(--foreground)' }}>
        {value}
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{unit}</div>
      <div
        className="flex items-center gap-1 mt-3 text-xs font-medium"
        style={{ color: trendDown ? 'var(--green-600)' : '#F57F17' }}
      >
        {trendDown ? '▼' : '▲'} {trend}
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-10 select-none">
        {icon}
      </div>
    </div>
  )
}

export function KpiGrid() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <KpiCard
        label="Kapsam 1 — Doğrudan"
        value="4.280"
        unit="ton CO₂e"
        trend="%12 geçen yıla göre"
        accentColor="var(--green-700)"
        icon="🏭"
      />
      <KpiCard
        label="Kapsam 2 — Elektrik"
        value="12.640"
        unit="ton CO₂e (konum bazlı)"
        trend="%8 geçen yıla göre"
        accentColor="var(--teal, #00897B)"
        icon="⚡"
      />
      <KpiCard
        label="Kapsam 3 — Değer Zinciri"
        value="183.500"
        unit="ton CO₂e (finanse edilmiş)"
        trend="%5 geçen yıla göre"
        accentColor="var(--blue, #1565C0)"
        icon="🔗"
      />
      <KpiCard
        label="TSRS Uyum Skoru"
        value="87"
        unit="100 üzerinden · Derece: B+"
        trend="+11 puan (2023: 76)"
        trendDown={false}
        accentColor="#F57F17"
        icon="✅"
      />
    </div>
  )
}
