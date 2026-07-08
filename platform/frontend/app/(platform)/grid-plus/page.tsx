'use client'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'

interface LiveMeterData {
  timestamp: string
  voltages: { L1: number; L2: number; L3: number }
  currents: { L1: number; L2: number; L3: number }
  active_power_kw: number
  reactive_power_kvar: number
  power_factor: number
  frequency_hz: number
  cumulative_kwh: number
}

interface EfficiencyAnalysis {
  efficiency_score: number
  energy_intensity_kwh_per_unit: number
  baseline_intensity: number
  improvement_pct: number
  grid_factor_applied: number
  carbon_equivalent_tco2e: number
  recommendations: string[]
}

export default function GridPlusPage() {
  const [meter, setMeter] = useState<LiveMeterData | null>(null)
  const [analysis, setAnalysis] = useState<EfficiencyAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [powerHistory, setPowerHistory] = useState<{ time: string; kw: number }[]>([])

  const fetchMeterAndAnalysis = (isInitial = false) => {
    const companyId = localStorage.getItem('company_id')
    if (!companyId) {
      if (isInitial) setLoading(false)
      return
    }

    Promise.all([
      api.grid.getLiveMeter(companyId),
      api.grid.getEfficiency(companyId)
    ])
      .then(([meterRes, effRes]: [any, any]) => {
        setMeter(meterRes)
        setAnalysis(effRes.analysis)
        
        // Add to history
        const now = new Date()
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
        setPowerHistory(prev => {
          const next = [...prev, { time: timeStr, kw: meterRes.active_power_kw }]
          // Limit to last 15 points
          return next.slice(-15)
        })
      })
      .catch(() => {
        if (isInitial) toast.error('Sayaç verileri şebekeden alınamadı.')
      })
      .finally(() => {
        if (isInitial) setLoading(false)
      })
  }

  // Poll for live meter updates every 4 seconds to simulate active IoT stream
  useEffect(() => {
    fetchMeterAndAnalysis(true)
    const interval = setInterval(() => {
      fetchMeterAndAnalysis(false)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleSyncToEmissions = () => {
    if (!meter) return
    setSyncing(true)
    const companyId = localStorage.getItem('company_id')
    if (!companyId) {
      setSyncing(false)
      return
    }

    api.grid.syncToEmissions(companyId, meter.cumulative_kwh, 2024)
      .then((res: any) => {
        toast.success(`Senkronizasyon Başarılı! ${res.electricity_kwh.toLocaleString('tr-TR')} kWh elektrik tüketimi ${res.emissions_tco2e} tCO₂e olarak Scope 2 kayıtlarına yazıldı.`)
      })
      .catch(() => {
        toast.error('Emisyon kayıtlarına senkronizasyon başarısız oldu.')
      })
      .finally(() => {
        setSyncing(false)
      })
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="h-4 bg-slate-800 rounded w-1/2" />
        <div className="h-96 bg-slate-800 rounded-xl" />
      </div>
    )
  }

  if (!meter || !analysis) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center py-20">
        <span className="text-4xl block mb-3">⚡</span>
        <h2 className="text-xl font-bold text-white">Sustain Grid+ Portalı</h2>
        <p className="text-slate-400 text-sm mt-1">Lütfen şirket profili ve sayaç tanımlamalarınızı kontrol ediniz.</p>
      </div>
    )
  }

  // Color logic for power factor (Cos phi)
  const pfColor = meter.power_factor >= 0.95 ? 'text-emerald-400' 
    : meter.power_factor >= 0.90 ? 'text-amber-500' 
    : 'text-red-500'

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sustain Grid+ Energy Intelligence</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-Time IoT Smart Meter Monitoring · TEİAŞ & DESNZ Grid Factors · ISO 50001
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/20 border border-emerald-500/30 rounded-xl px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">CANLI TELEMETRİ</span>
        </div>
      </div>

      {/* Top metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Active Power */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Aktif Güç Yükü</div>
          <div className="text-3xl font-black text-white">{meter.active_power_kw} kW</div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono">Frekans: {meter.frequency_hz} Hz</div>
        </div>

        {/* Power Factor (Cos phi) */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Güç Faktörü (Cos φ)</div>
          <div className={`text-3xl font-black ${pfColor}`}>{meter.power_factor}</div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono">
            {meter.power_factor >= 0.95 ? '✓ Sınır Değer Uyumlu' : '⚠️ Reaktif Ceza Riski'}
          </div>
        </div>

        {/* Reaktif Power */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reaktif Güç</div>
          <div className="text-3xl font-black text-white">{meter.reactive_power_kvar} kVAR</div>
          <div className="text-[10px] text-slate-500 mt-2 font-mono">Endüktif/Kapasitif Bileşen</div>
        </div>

        {/* Cumulative Energy */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 relative overflow-hidden">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Toplam Tüketim</div>
          <div className="text-3xl font-black text-white font-mono">{Math.round(meter.cumulative_kwh).toLocaleString('tr-TR')} kWh</div>
          <div className="text-[10px] text-slate-500 mt-2">Aktif Birikmiş Sayaç Göstergesi</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Power Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Yük Profili (Aktif Güç kW)</h3>
            <span className="text-[10px] text-slate-500 font-mono">Son 15 Sayaç Okuması</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={powerHistory}>
                <defs>
                  <linearGradient id="colorKw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} labelStyle={{ color: '#94a3b8' }} />
                <Area type="monotone" dataKey="kw" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorKw)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 3-Phase Voltages & Currents */}
          <div className="grid grid-cols-2 gap-4 text-xs mt-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Anlık Gerilim (Volt)</div>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div><div className="text-slate-400">L1</div><div className="font-bold text-white">{meter.voltages.L1}V</div></div>
                <div><div className="text-slate-400">L2</div><div className="font-bold text-white">{meter.voltages.L2}V</div></div>
                <div><div className="text-slate-400">L3</div><div className="font-bold text-white">{meter.voltages.L3}V</div></div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Anlık Akım (Amper)</div>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div><div className="text-slate-400">L1</div><div className="font-bold text-white">{meter.currents.L1}A</div></div>
                <div><div className="text-slate-400">L2</div><div className="font-bold text-white">{meter.currents.L2}A</div></div>
                <div><div className="text-slate-400">L3</div><div className="font-bold text-white">{meter.currents.L3}A</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency & Sync Panel */}
        <div className="space-y-6">
          {/* CarbonSense Auto-Feed */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">CarbonSense Otomatik Senkronizasyon</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sayaçta biriken elektrik tüketimi, ülkenizin güncel şebeke katsayısı kullanılarak otomatik karbon emisyonuna dönüştürülür.
            </p>
            
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-700 space-y-3 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-500">Tüketim Değeri</span>
                <span className="text-white font-mono">{Math.round(meter.cumulative_kwh).toLocaleString('tr-TR')} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Uygulanan Katsayı</span>
                <span className="text-sky-400 font-mono">{analysis.grid_factor_applied} kgCO₂e/kWh</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-2 font-bold text-sm">
                <span className="text-slate-400">Karbon Eşdeğeri</span>
                <span className="text-emerald-400 font-mono">{analysis.carbon_equivalent_tco2e} tCO₂e</span>
              </div>
            </div>

            <button
              onClick={handleSyncToEmissions}
              disabled={syncing}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 transition-all shadow-lg shadow-emerald-600/10">
              {syncing ? 'Aktarılıyor…' : '🔌 Emisyon Tablosuna Aktar (Scope 2)'}
            </button>
          </div>

          {/* Efficiency & ISO 50001 Score */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">ISO 50001 Verimlilik</h3>
              <div className="text-2xl font-black text-emerald-400">{analysis.efficiency_score}/100</div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Enerji Yoğunluğu (kWh/Ürün)</span>
                <span className="text-white font-mono">{analysis.energy_intensity_kwh_per_unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Referans Yoğunluk (Baseline)</span>
                <span className="text-slate-500 font-mono">{analysis.baseline_intensity}</span>
              </div>
              <div className="flex justify-between border-t border-slate-700/50 pt-1">
                <span className="text-slate-400">İyileşme Oranı</span>
                <span className="text-emerald-400 font-bold">%{analysis.improvement_pct} Azaltım</span>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/40 text-[11px] text-slate-300 space-y-2">
              <div className="font-bold text-slate-400">⚡ Enerji Verimliliği Önerileri:</div>
              <ul className="list-disc pl-4 space-y-1">
                {analysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
