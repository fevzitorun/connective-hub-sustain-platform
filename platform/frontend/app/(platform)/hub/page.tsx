'use client'
import React from 'react'
import { Globe, Bell, Zap, BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function HubPage() {
  const policyAlerts = [
    {
      id: "p1",
      date: "Bugün",
      title: "AB Parlamentosu CBAM'da Çelik Sınırlarını Güncelledi",
      summary: "Avrupa Birliği, çelik sektörü için Gömülü Emisyon (Embedded Emissions) standartlarını %15 daha sıkılaştırdı. Türkiye'deki üreticiler için risk primi artıyor.",
      impact: "High",
      tag: "CBAM Alert"
    },
    {
      id: "p2",
      date: "Dün",
      title: "KGK, TSRS Bağımsız Denetçi Standardını Açıkladı",
      summary: "Türkiye Sürdürülebilirlik Raporlama Standartları (TSRS) kapsamında 2025 raporlarında Sınırlı Güvence (Limited Assurance) şartları netleşti.",
      impact: "Medium",
      tag: "TSRS"
    }
  ]

  const climateTech = [
    {
      id: "t1",
      title: "Direct Air Capture (DAC) Maliyetleri İlk Kez $200/ton Altına İndi",
      summary: "İzlanda'daki yeni karbon yakalama tesisi 'Mammoth', endüstriyel ölçekte DAC maliyetlerinde devrim yaratıyor.",
      read_time: "5 dk okuma",
      simulation: "Carbon Capture"
    },
    {
      id: "t2",
      title: "Endüstriyel Isı Pompalarında 'Yeşil Amonyak' Dönemi",
      summary: "Avrupalı üreticiler doğalgazı tamamen devreden çıkararak, yüksek sıcaklıklı endüstriyel prosesleri ısı pompaları ile çözmeyi başardı.",
      read_time: "3 dk okuma",
      simulation: "Isı Pompaları"
    }
  ]

  const caseStudies = [
    {
      id: "c1",
      company: "Kordsa",
      title: "Kapsam 2 Emisyonlarında %40 Azaltım",
      summary: "Kordsa, çatı GES ve enerji satın alma anlaşmaları (PPA) ile sadece 18 ayda Scope 2 emisyonlarını nasıl yarı yarıya indirdi?"
    },
    {
      id: "c2",
      company: "Volvo Trucks",
      title: "Fosil Yakıtsız Çelikten İlk Tır Üretimi",
      summary: "Volvo, tedarik zincirindeki Kapsam 3 emisyonlarını sıfırlamak için SSAB'nin fosilsiz çeliğini kullanarak sektörde ilk adımı attı."
    }
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center pb-8 border-b border-slate-200">
        <h1 className="text-4xl font-black text-slate-800 mb-4 flex items-center gap-3">
          <Globe className="text-blue-600" size={40} />
          Sustain Intelligence Hub
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl">
          Global regülasyonlar, inovatif iklim teknolojileri ve sektörel başarı hikayeleri için günlük düşünce kuruluşunuz (Think-Tank).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Policy Alerts */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b-2 border-red-500 pb-2 inline-flex">
            <Bell size={20} className="text-red-500" />
            Policy Alerts
          </h2>
          <div className="space-y-4">
            {policyAlerts.map(alert => (
              <div key={alert.id} className="bg-white border-l-4 border-red-500 rounded-r-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-2 py-1 rounded">{alert.tag}</span>
                  <span className="text-xs font-semibold text-slate-400">{alert.date}</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2 leading-tight">{alert.title}</h3>
                <p className="text-sm text-slate-600">{alert.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Climate Tech News */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b-2 border-emerald-500 pb-2 inline-flex">
            <Zap size={20} className="text-emerald-500" />
            Climate Tech Daily
          </h2>
          <div className="space-y-4">
            {climateTech.map(tech => (
              <div key={tech.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-32 bg-slate-100 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <span className="absolute bottom-3 left-4 text-white text-xs font-bold">{tech.read_time}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-800 mb-2 leading-tight group-hover:text-emerald-600 transition-colors">{tech.title}</h3>
                  <p className="text-sm text-slate-600 mb-4">{tech.summary}</p>
                  
                  {/* Cross-Sell Simulator Link */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                    <p className="text-xs font-semibold text-emerald-800 mb-2">Bu teknolojinin fabrikanızdaki etkisini simüle edin:</p>
                    <Link href="/simulator" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                      {tech.simulation} Simülatörü <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Case Studies */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b-2 border-blue-500 pb-2 inline-flex">
            <BookOpen size={20} className="text-blue-500" />
            Benchmarking & Case Studies
          </h2>
          <div className="space-y-4">
            {caseStudies.map(study => (
              <div key={study.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-xs font-bold text-blue-600 mb-2 block">{study.company}</span>
                <h3 className="font-bold text-slate-800 mb-2 leading-tight">{study.title}</h3>
                <p className="text-sm text-slate-600 mb-4">{study.summary}</p>
                <button className="text-xs font-bold text-slate-800 border border-slate-300 rounded-full px-4 py-1 hover:bg-slate-50 transition-colors">
                  Vaka Analizini Oku
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
