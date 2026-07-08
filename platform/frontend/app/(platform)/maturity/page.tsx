'use client'
import React, { useState } from 'react'
import { Target, CheckCircle2, ArrowRight, ShieldCheck, Activity } from 'lucide-react'

export default function MaturityPage() {
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)

  const questions = [
    {
      title: "1. Yönetişim ve Strateji",
      text: "Şirketinizde sürdürülebilirlik konularından sorumlu üst düzey bir yönetici (CSO) veya komite bulunuyor mu?",
      options: [
        { text: "Hayır, henüz bir atama yapılmadı.", points: 0 },
        { text: "Evet, ancak sadece gönüllü projelerle ilgileniyorlar.", points: 10 },
        { text: "Evet, Yönetim Kuruluna doğrudan raporlayan resmi bir komitemiz var.", points: 25 }
      ]
    },
    {
      title: "2. Veri ve Raporlama (Karbon)",
      text: "Sera Gazı emisyonlarınızı (Kapsam 1, 2, 3) hangi standartlarda raporluyorsunuz?",
      options: [
        { text: "Herhangi bir hesaplama yapmıyoruz.", points: 0 },
        { text: "Sadece Kapsam 1 ve 2 verilerini faturalardan manuel hesaplıyoruz.", points: 10 },
        { text: "Kapsam 1, 2 ve 3 verilerimiz GHG Protokolüne uygun, bağımsız denetimden (ISO 14064) geçmiştir.", points: 25 }
      ]
    },
    {
      title: "3. Tedarik Zinciri ve İhracat (UK/AB)",
      text: "Tedarikçilerinizin emisyonlarını takip ediyor musunuz ve AB/UK sınır vergileri (CBAM, UK SDR) risklerinizi hesapladınız mı?",
      options: [
        { text: "Hayır, henüz tedarikçi verisine veya CBAM maliyetlerine hakim değiliz.", points: 0 },
        { text: "Temel tedarikçilerimizden anket ile veri topluyoruz.", points: 10 },
        { text: "Tedarik zincirimiz SustainHub üzerinden otonom karnelere sahip ve CBAM risk primimiz hesaplandı.", points: 25 }
      ]
    },
    {
      title: "4. Hedefler ve Finansman",
      text: "SBTi (Bilimsel Temelli Hedefler) taahhüdünüz ve Yeşil Kredi / TÜBİTAK Ar-Ge fonlarından faydalanma durumunuz nedir?",
      options: [
        { text: "Hedefimiz yok, finansman mekanizmalarını kullanmıyoruz.", points: 0 },
        { text: "İç hedeflerimiz var ancak SBTi onaylı değil.", points: 10 },
        { text: "SBTi Net-Zero hedefimiz onaylı ve AB/UK bankalarından 'Sürdürülebilirlik Bağlantılı Kredi' kullanıyoruz.", points: 25 }
      ]
    }
  ]

  const handleAnswer = (points: number) => {
    setScore(score + points)
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      setCompleted(true)
    }
  }

  const getMaturityLevel = () => {
    if (score < 30) return { label: "Başlangıç (Novice)", color: "text-slate-500", bg: "bg-slate-100", advice: "Acil olarak bir Karbon Ayak İzi ölçümü yapmalısınız." }
    if (score < 70) return { label: "Gelişim Aşamasında (Transitioning)", color: "text-amber-500", bg: "bg-amber-100", advice: "UK SDR ve CBAM deklarasyonları için Kapsam 3 verilerinizi iyileştirin." }
    return { label: "Küresel Lider (Leader)", color: "text-emerald-500", bg: "bg-emerald-100", advice: "Harika! London Finance Gateway üzerinden yeşil kredi başvurusu yapmaya hazırsınız." }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-800 mb-4 flex justify-center items-center gap-3">
          <Activity className="text-blue-600" size={32} />
          Sürdürülebilirlik Olgunluk Analizi
        </h1>
        <p className="text-slate-500">
          İSO standartlarına ve Birleşik Krallık (UK SRS) regülasyonlarına göre şirketinizin küresel rekabet gücünü test edin.
        </p>
      </div>

      {!completed ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex justify-between items-center mb-8">
            <span className="text-sm font-bold text-slate-400">Soru {step + 1} / {questions.length}</span>
            <div className="flex gap-1">
              {questions.map((_, idx) => (
                <div key={idx} className={`h-2 w-8 rounded-full ${idx <= step ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">{questions[step].title}</h2>
          <p className="text-lg text-slate-600 mb-8">{questions[step].text}</p>

          <div className="space-y-4">
            {questions[step].options.map((option, idx) => (
              <button 
                key={idx}
                onClick={() => handleAnswer(option.points)}
                className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group flex justify-between items-center"
              >
                <span className="font-semibold text-slate-700 group-hover:text-blue-700">{option.text}</span>
                <ArrowRight className="text-slate-300 group-hover:text-blue-500" size={20} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 text-center animate-in fade-in zoom-in duration-500">
          <ShieldCheck size={80} className={`mx-auto mb-6 ${getMaturityLevel().color}`} />
          <h2 className="text-3xl font-black text-slate-800 mb-2">Analiz Tamamlandı</h2>
          <p className="text-slate-500 mb-8">Platformumuzun verilerine göre şirketinizin İSO & UK Market uyumluluk durumu:</p>
          
          <div className={`inline-block px-8 py-4 rounded-2xl mb-8 ${getMaturityLevel().bg}`}>
            <div className="text-5xl font-black mb-2">{score}<span className="text-2xl opacity-50">/100</span></div>
            <div className={`text-xl font-bold ${getMaturityLevel().color}`}>{getMaturityLevel().label}</div>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Target size={18} className="text-blue-600"/> Sustain-Copilot Stratejik Önerisi:</h3>
            <p className="text-slate-600">{getMaturityLevel().advice}</p>
          </div>

          <div className="flex gap-4 justify-center">
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-bold transition-colors">
              TÜBİTAK/EEN Mentörleriyle Eşleş
            </button>
            <button onClick={() => window.location.href='/dashboard'} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
              Dashboard'a Dön
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
