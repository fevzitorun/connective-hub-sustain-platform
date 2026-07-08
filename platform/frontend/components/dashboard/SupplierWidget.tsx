import React from 'react'
import { Link2, Zap } from 'lucide-react'
import Link from 'next/link'

export const SupplierWidget = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
      <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0"></div>
      
      <div>
        <div className="relative z-10 flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Link2 size={18} className="text-blue-500" />
            Tedarik Zinciri (Kapsam 3)
          </h3>
        </div>
        
        <div className="relative z-10 mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-500 font-medium">Tamamlanma Oranı</span>
            <span className="text-slate-800 font-bold">%45</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <div className="flex justify-between text-xs mt-2 text-slate-400">
            <span>9 Tedarikçi Yanıt Verdi</span>
            <span>Toplam 20 Davet</span>
          </div>
        </div>
      </div>

      <Link href="/tedarikciler" className="relative z-10 w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 transition-colors">
        <Zap size={16} className="text-amber-500" />
        Hızlı Davet Gönder
      </Link>
    </div>
  )
}

export default SupplierWidget
