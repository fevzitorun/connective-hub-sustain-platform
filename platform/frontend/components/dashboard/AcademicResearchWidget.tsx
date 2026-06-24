'use client'
import React from 'react'
import { BookOpen, ExternalLink, GraduationCap } from 'lucide-react'

// Mocking library service data
const ACADEMIC_PAPERS = [
  {
    id: "p_solar_itu",
    title: "Endüstriyel Çatılarda Hibrit Fotovoltaik Sistemlerin Verimlilik Analizi",
    university: "İTÜ Enerji Enstitüsü",
    year: 2024,
    keywords: ["solar"],
    roi_impact_note: "Bu araştırmaya göre, doğru açıyla kurulan hibrit paneller ROI süresini 1.2 yıl kısaltmaktadır.",
    link: "https://sustainhub.online/library/p_solar_itu"
  },
  {
    id: "p_ev_atlas",
    title: "Lojistik Filolarının Elektrifikasyonunda Şarj Ağı Optimizasyonu",
    university: "Atlas Üniversitesi",
    year: 2024,
    keywords: ["ev_fleet"],
    roi_impact_note: "Optimize edilmiş şarj istasyonu lokasyonları, filonun bekleme süresi maliyetlerini %15 oranında azaltır.",
    link: "https://sustainhub.online/library/p_ev_atlas"
  },
  {
    id: "p_heat_sabanci",
    title: "Endüstriyel Atık Isı Geri Kazanım Sistemlerinin Termodinamik Modeli",
    university: "Sabancı Üniversitesi",
    year: 2023,
    keywords: ["waste_heat"],
    roi_impact_note: "Atık ısı geri kazanımıyla kazan dairesi verimliliği %22 artış göstermektedir.",
    link: "https://sustainhub.online/library/p_heat_sabanci"
  }
]

export function AcademicResearchWidget({ investmentType }: { investmentType: string }) {
  const recommendations = ACADEMIC_PAPERS.filter(p => p.keywords.includes(investmentType))

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-6">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <GraduationCap className="text-indigo-600" size={20} />
        Akademik Çözüm Köprüsü (Sustain-Library)
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Üniversitelerimizin bu yatırım türüyle ilgili en güncel araştırma ve verimlilik raporları:
      </p>

      {recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map(paper => (
            <div key={paper.id} className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded">
                  {paper.university}
                </span>
                <span className="text-xs text-slate-400 font-bold">{paper.year}</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-2">{paper.title}</h4>
              <p className="text-xs text-indigo-800 font-medium mb-3 bg-white/50 p-2 rounded">
                💡 <strong>Ar-Ge Çıktısı:</strong> {paper.roi_impact_note}
              </p>
              <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Makaleyi Oku <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-400 italic">Bu konuyla ilgili henüz makale bulunmamaktadır.</div>
      )}
    </div>
  )
}
