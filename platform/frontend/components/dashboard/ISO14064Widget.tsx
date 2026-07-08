'use client'

export default function ISO14064Widget({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm h-full flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-slate-800 text-sm mb-1">ISO 14064-1 Durumu</h3>
        <p className="text-xs text-slate-500 mb-6">Uyum Özeti</p>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              ✓
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">Doğrulanabilirlik</p>
              <p className="text-xs text-slate-500">Denetime Hazır</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
              ✓
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">Emisyon Faktörleri</p>
              <p className="text-xs text-slate-500">IPCC 2006, DEFRA '22</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
              ⚠
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">Kapsam 3 Eksikleri</p>
              <p className="text-xs text-slate-500">Veri kalitesi düşük</p>
            </div>
          </div>
        </div>
      </div>
      
      <button className="w-full mt-6 py-3 rounded-xl bg-slate-50 text-slate-700 text-sm font-bold border-2 border-slate-200 hover:bg-slate-100 transition-colors">
        PDF Rapor İndir
      </button>
    </div>
  )
}
