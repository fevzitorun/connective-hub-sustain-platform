'use client'
import React from 'react'
import { CheckCircle2, Circle, AlertTriangle, FileText, Calendar, ArrowRight } from 'lucide-react'

export default function CompliancePage() {
  const regulations = [
    {
      id: 'tsrs',
      title: 'TSRS (Türkiye Sürdürülebilirlik Raporlama Standartları)',
      status: 'Active',
      deadline: '2025-06-30',
      progress: 65,
      tasks: [
        { name: 'Çift Önemlilik Analizi Tamamlanması', done: true },
        { name: 'Kapsam 1 & 2 Emisyon Veri Toplaması', done: true },
        { name: 'Yönetim Kurulu Onayı', done: false },
        { name: 'Bağımsız Denetim (Sınırlı Güvence)', done: false }
      ]
    },
    {
      id: 'cbam',
      title: 'CBAM (Sınırda Karbon Düzenleme Mekanizması)',
      status: 'Transitional',
      deadline: '2025-07-31',
      progress: 40,
      tasks: [
        { name: 'İhracat Ürün Karbon Ayak İzi (PCF) Hesabı', done: true },
        { name: 'CBAM Deklarasyonu Hazırlanması', done: false },
        { name: 'AB Müşterileri ile Veri Paylaşımı', done: false }
      ]
    },
    {
      id: 'csrd',
      title: 'CSRD (Corporate Sustainability Reporting Directive)',
      status: 'Upcoming',
      deadline: '2026-01-01',
      progress: 10,
      tasks: [
        { name: 'ESRS Veri Boşluk Analizi (Gap Analysis)', done: false },
        { name: 'Değer Zinciri (Kapsam 3) Veri Altyapısı', done: false }
      ]
    }
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 mb-2 flex items-center gap-3">
          <Calendar className="text-blue-600" size={32} />
          Global Regulatory Tracker
        </h1>
        <p className="text-slate-500">
          Uluslararası mevzuatlara uyum takvimi, son tarihler ve operasyonel görev listeleri.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          {regulations.map(reg => (
            <div key={reg.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-slate-800">{reg.title}</h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      reg.status === 'Active' ? 'bg-red-100 text-red-700' :
                      reg.status === 'Transitional' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {reg.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                    <span className="flex items-center gap-1"><AlertTriangle size={16} /> Son Tarih: {new Date(reg.deadline).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-slate-800">{reg.progress}%</span>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Uyum Skoru</p>
                </div>
              </div>
              
              <div className="p-6 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-widest">Görev Listesi (Tasks)</h3>
                <div className="space-y-3">
                  {reg.tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {task.done ? (
                        <CheckCircle2 size={20} className="text-emerald-500" />
                      ) : (
                        <Circle size={20} className="text-slate-300" />
                      )}
                      <span className={`text-sm font-medium ${task.done ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                        {task.name}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700">
                    Detaylı Rapor <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <FileText size={100} />
            </div>
            <h3 className="text-lg font-bold mb-2">Denetim & Güvence (Assurance)</h3>
            <p className="text-sm text-slate-400 mb-6">
              KPMG, Deloitte, PwC gibi Big Four firmalarının talep ettiği formatta "Audit-Ready" veri paketini tek tıkla indirin.
            </p>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors">
              Data Room Oluştur (.ZIP)
            </button>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-emerald-900 mb-2">TSRS Sektörel Rehberler</h3>
            <p className="text-sm text-emerald-700 mb-4">
              Kamu Gözetimi Kurumu (KGK) tarafından yayınlanan güncel uygulama rehberlerine anında ulaşın.
            </p>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm font-semibold text-emerald-600 hover:underline flex items-center gap-2"><FileText size={14}/> Tekstil Sektörü Rehberi</a></li>
              <li><a href="#" className="text-sm font-semibold text-emerald-600 hover:underline flex items-center gap-2"><FileText size={14}/> Otomotiv Sektörü Rehberi</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
