'use client'
import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'

export function ComplianceCalendar() {
  const events = [
    { id: 1, title: 'TSRS Sürdürülebilirlik Raporu', date: '2025-06-30', daysLeft: 45, status: 'warning', type: 'Zorunlu' },
    { id: 2, title: 'CBAM Geçiş Dönemi Beyanı', date: '2025-07-31', daysLeft: 76, status: 'info', type: 'Zorunlu' },
    { id: 3, title: 'CSRD Çift Önemlilik Analizi', date: '2025-12-31', daysLeft: 228, status: 'pending', type: 'Hazırlık' }
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <Calendar size={18} className="text-emerald-600" />
          Kritik Tarihler
        </h3>
        <Link href="/compliance" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
          Tümünü Gör →
        </Link>
      </div>
      
      <div className="p-5 flex-1 flex flex-col gap-4">
        {events.map(event => (
          <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
            <div className="mt-0.5">
              {event.status === 'warning' ? <AlertCircle size={18} className="text-amber-500" /> : 
               event.status === 'info' ? <Clock size={18} className="text-blue-500" /> : 
               <CheckCircle2 size={18} className="text-slate-400" />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-slate-800 leading-tight">{event.title}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  event.status === 'warning' ? 'bg-amber-100 text-amber-800' :
                  event.status === 'info' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {event.daysLeft} Gün
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">{new Date(event.date).toLocaleDateString('tr-TR', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                <span className="text-slate-400">{event.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
