'use client'
import { useEffect, useState } from 'react'
import { Calendar, AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'

export function ComplianceCalendar() {
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof api.dashboard.summary>> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard.summary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false))
  }, [])

  const deadlines = summary?.deadlines ?? []

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Calendar size={18} className="text-emerald-600" />
          TSRS Takvimi
        </h3>
        <Link href="/compliance" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
          Tümünü Gör →
        </Link>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        {loading ? (
          <div className="h-32 animate-pulse bg-gray-50 rounded" />
        ) : deadlines.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Takvim verisi yüklenemedi.</p>
        ) : (
          deadlines.slice(0, 3).map((d, i) => {
            const overdue = d.days_left !== null && d.days_left < 0
            const soon = d.days_left !== null && d.days_left >= 0 && d.days_left <= 90
            const status = overdue ? 'overdue' : soon ? 'warning' : 'info'
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                <div className="mt-0.5">
                  {status === 'overdue' ? <AlertCircle size={18} className="text-red-500" /> :
                   status === 'warning' ? <AlertCircle size={18} className="text-amber-500" /> :
                   <Clock size={18} className="text-blue-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-slate-800 leading-tight">{d.segment}</h4>
                    {d.days_left !== null && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        overdue ? 'bg-red-100 text-red-800' :
                        soon ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {overdue ? 'Süresi geçti' : `${d.days_left} gün`}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">{d.deadline} · {d.regulator}</span>
                    <span className="text-slate-400">{d.mandatory ? 'Zorunlu' : 'Gönüllü'}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
