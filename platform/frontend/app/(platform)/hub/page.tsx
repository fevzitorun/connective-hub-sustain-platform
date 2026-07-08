'use client'
import React from 'react'
import { Globe, Bell, Zap, BookOpen, ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'

export default function HubPage() {
  const policyAlerts = [
    {
      id: "p0",
      date: "2 Temmuz 2026",
      title: "COP31 Türkiye Ev Sahipliği — TSRS Uyum Penceresi Açıldı",
      summary: "Türkiye'nin COP31'e ev sahipliği yapması, BDDK ve KGK'nın zorunlu TSRS raporlamasını hızlandırmasını beraberinde getiriyor. 34 banka ve 200+ büyük şirket için kritik hazırlık dönemi başladı.",
      impact: "Critical",
      tag: "COP31 🇹🇷"
    },
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
        {/* PR Tagline */}
        <div className="mt-5 px-6 py-3 rounded-2xl inline-block" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
          <p className="text-sm font-semibold italic" style={{ color: '#065f46' }}>
            "SustainHub turns TCFD climate scenarios into board-ready financial impact matrices in under 60 seconds —{' '}
            <span className="font-bold not-italic">powered by IEA WEO 2024 data.</span>"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Policy Alerts */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b-2 border-red-500 pb-2 inline-flex">
            <Bell size={20} className="text-red-500" />
            Policy Alerts
          </h2>
          <div className="space-y-4">
            {policyAlerts.map(alert => {
              const isCop31 = alert.id === 'p0'
              return (
                <div key={alert.id}
                  className="bg-white rounded-r-xl p-5 shadow-sm hover:shadow-md transition-shadow border-l-4"
                  style={{ borderLeftColor: isCop31 ? '#d97706' : '#ef4444' }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
                      style={{ color: isCop31 ? '#92400e' : '#ef4444', background: isCop31 ? '#fef3c7' : '#fef2f2' }}>
                      {alert.tag}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{alert.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2 leading-tight">{alert.title}</h3>
                  <p className="text-sm text-slate-600">{alert.summary}</p>
                  {isCop31 && (
                    <div className="mt-3 flex gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">BDDK</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">TSRS</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">PCAF</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">GAR</span>
                    </div>
                  )}
                </div>
              )
            })}
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

      {/* Recent Policy Briefs */}
      <div className="border-t pt-8" style={{ borderColor: '#e2e8f0' }}>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6" style={{ color: '#1e293b' }}>
          <FileText size={22} className="text-purple-600" />
          Güncel Politika Özetleri
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              category: 'COP31 Türkiye', categoryColor: '#b45309', categoryBg: '#fef3c7',
              date: '2026-07', tag: '🇹🇷 COP31 Özel',
              title: 'COP31 & TSRS: Türk Şirketleri İçin Yol Haritası',
              body: 'Türkiye\'nin COP31 ev sahipliği, BDDK/KGK TSRS zorunluluklarını hızlandırıyor. 34 banka ve 200+ büyük şirket için uyum takvimi, PCAF finanse edilen emisyonlar ve GAR yükümlülükleri.',
            },
            {
              category: 'Düzenleme', categoryColor: '#7c3aed', categoryBg: '#ede9fe',
              date: '2025-06', tag: 'CSRD',
              title: 'CSRD Geçiş Planı Yükümlülükleri Netleşti',
              body: 'Avrupa Komisyonu, 2026 raporlamasından itibaren şirketlerin 2050 net-sıfır hedefine uyumlu birer geçiş planı yayımlamasını zorunlu kılıyor.',
            },
            {
              category: 'Finans', categoryColor: '#0369a1', categoryBg: '#e0f2fe',
              date: '2025-06', tag: 'Yeşil Tahvil',
              title: 'ICMA Yeşil Tahvil Standartları 2025 Revizyonu',
              body: 'ICMA, yeşil tahvil ilkelerini güncelleyerek "yeşil aklama" riskini azaltmak için bağımsız doğrulama zorunluluğunu genişletti.',
            },
            {
              category: 'Tedarik Zinciri', categoryColor: '#065f46', categoryBg: '#d1fae5',
              date: '2025-05', tag: 'EUDR',
              title: 'EUDR Uyum Tarihleri Kesinleşti',
              body: 'AB Ormansızlaşma Tüzüğü kapsamında büyük işletmelerin 30 Aralık 2025, KOBİ\'lerin 30 Haziran 2026 tarihine kadar due diligence sistemlerini kurması gerekiyor.',
            },
            {
              category: 'İklim', categoryColor: '#b45309', categoryBg: '#fef3c7',
              date: '2025-05', tag: 'TCFD',
              title: 'TCFD → ISSB Geçişi: Yeni Zorunluluklar',
              body: 'TCFD\'nin görevi ISSB\'ye devredildi. IFRS S2 (İklim Açıklamaları) 2025\'ten itibaren pek çok ülkede yasal yükümlülük haline geliyor.',
            },
            {
              category: 'Karbon', categoryColor: '#c2410c', categoryBg: '#ffedd5',
              date: '2025-04', tag: 'CBAM',
              title: 'CBAM Geçiş Dönemi Raporlama Gereklilikleri',
              body: '2026 sonrası CBAM tam uygulamaya geçtiğinde ihracat belgesi olmayan Türk üreticiler ton başına €130\'a kadar karbon vergisi ödeyecek.',
            },
            {
              category: 'Standart', categoryColor: '#4f46e5', categoryBg: '#e0e7ff',
              date: '2025-04', tag: 'GHG Protocol',
              title: 'GHG Protocol Kapsam 3 Güncelleme Taslağı',
              body: 'GHG Protocol, 15 kategoride hesaplama metodolojisini revize ediyor; finans sektörü finansal emisyonları (Kapsam 15) için yeni rehber yayımladı.',
            },
          ].map(b => (
            <div key={b.title} className="rounded-xl border p-5 hover:shadow-md transition-shadow bg-white" style={{ borderColor: '#e2e8f0' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: b.categoryBg, color: b.categoryColor }}>{b.category}</span>
                <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{b.date}</span>
              </div>
              <div className="text-xs font-bold mb-1" style={{ color: b.categoryColor }}>{b.tag}</div>
              <h3 className="font-bold text-sm mb-2 leading-snug" style={{ color: '#1e293b' }}>{b.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
