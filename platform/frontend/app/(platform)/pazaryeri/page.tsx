'use client'
import React, { useState } from 'react'
import { ShoppingBag, Sun, Zap, Info, CheckCircle, Send } from 'lucide-react'
import { toast } from 'sonner'

const VENDORS = [
  { id: 'v1', name: 'Enerjisa GES Çözümleri', type: 'solar', trust: 98, tag: 'Önerilen', desc: 'Anahtar teslim kurumsal çatı GES kurulumu ve 10 yıl bakım garantisi.' },
  { id: 'v2', name: 'Kalyon PV', type: 'solar', trust: 95, tag: 'Yerli Üretim', desc: 'Yüksek verimli yerli güneş panelleri ile hızlı amortisman.' },
  { id: 'v3', name: 'Zorlu Energy Solutions', type: 'ev_fleet', trust: 96, tag: 'Popüler', desc: 'Filo elektrifikasyonu ve akıllı şarj ağı yönetimi.' },
  { id: 'v4', name: 'Ecolab Atık Isı', type: 'waste_heat', trust: 92, tag: 'Endüstri', desc: 'Fabrika bacalarından atık ısı geri kazanımı ile %30 doğalgaz tasarrufu.' }
]

export default function MarketplacePage() {
  const [filter, setFilter] = useState('solar')

  const handleLeadSubmit = (vendorName: string) => {
    toast.success(`${vendorName} firmasına simülasyon özetiniz ve teklif talebiniz başarıyla iletildi!`)
  }

  const filteredVendors = VENDORS.filter(v => v.type === filter)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
          <ShoppingBag className="text-blue-600" size={32} />
          Sustain-Marketplace: Çözüm Pazaryeri
        </h1>
        <p className="text-slate-500">ROI Simülatörü sonuçlarına dayanarak sizin için en uygun yeşil teknoloji tedarikçileri.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex items-start gap-4 mb-4">
        <Info className="text-blue-600 mt-1 flex-shrink-0" size={24} />
        <div>
          <h3 className="font-bold text-blue-900 mb-1">Akıllı Eşleşme (Smart Match) Aktif</h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            Sprint 8'de yaptığınız simülasyonlara göre şirketinizin en yüksek ROI'yi <strong>Güneş Paneli (GES)</strong> yatırımından elde edeceği hesaplanmıştır. Aşağıda sizin için filtrelenmiş güvenilir çözüm ortaklarını görebilirsiniz.
          </p>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-center gap-2 mb-8 shadow-sm">
        <CheckCircle className="text-emerald-600" size={18} />
        <p className="text-sm font-bold text-emerald-900">
          Veri Mahremiyeti Mührü: Verileriniz sadece sizin onayınızla, tamamen anonimleştirilmiş olarak çözüm ortaklarına iletilir.
        </p>
      </div>

      <div className="flex gap-4 border-b border-slate-200 pb-4">
        <button onClick={() => setFilter('solar')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === 'solar' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'text-slate-500 hover:bg-slate-100'}`}>
          <Sun size={16} /> Güneş Paneli (GES)
        </button>
        <button onClick={() => setFilter('ev_fleet')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === 'ev_fleet' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'text-slate-500 hover:bg-slate-100'}`}>
          <Zap size={16} /> Elektrikli Filo
        </button>
        <button onClick={() => setFilter('waste_heat')} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === 'waste_heat' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'text-slate-500 hover:bg-slate-100'}`}>
          🔥 Atık Isı Kazanımı
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {filteredVendors.map(vendor => (
          <div key={vendor.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider rounded mb-2">
                    {vendor.tag}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800">{vendor.name}</h3>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={14} /> Trust Score
                  </span>
                  <span className="text-2xl font-black text-slate-800">{vendor.trust}</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {vendor.desc}
              </p>
            </div>
            
            <button 
              onClick={() => handleLeadSubmit(vendor.name)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Send size={16} /> Verilerimi Gönder & Teklif Al
            </button>
          </div>
        ))}
        {filteredVendors.length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-500">
            Bu kategoride henüz doğrulanmış bir tedarikçi bulunmamaktadır.
          </div>
        )}
      </div>
    </div>
  )
}
