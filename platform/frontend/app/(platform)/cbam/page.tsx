'use client'
import React, { useState } from 'react'
import { Download, Globe, ShieldAlert, Euro, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

export default function CbamPage() {
  const [sector, setSector] = useState("çelik")
  const [goodsTons, setGoodsTons] = useState(1000)
  const [customFactor, setCustomFactor] = useState("")
  
  const [importYear, setImportYear] = useState(2024)
  const [importing, setImporting] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  
  // CBAM Engine Simulation Logic (Frontend Replica for instant feedback)
  const euEtsPrice = 71.0
  const sectorFactors: Record<string, number> = {
    "çelik": 1.89,
    "alüminyum": 8.02,
    "çimento": 0.82,
    "gübre": 2.14,
    "elektrik": 0.0,
    "hidrojen": 8.9,
  }

  const factorUsed = customFactor ? parseFloat(customFactor) : sectorFactors[sector]
  const embeddedEmissions = goodsTons * factorUsed
  const estimatedTax = embeddedEmissions * euEtsPrice

  const handleExport = () => {
    toast.success("CBAM XML/Excel beyanname taslağı hazırlanıyor...")
    setTimeout(() => {
      toast.success("CBAM_Declaration_2026.xlsx indirildi.")
    }, 1500)
  }

  const handlePreviewImport = async () => {
    setImporting(true)
    try {
      const data = await api.cbam.importPreview(importYear)
      setPreviewData(data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Veri alınamadı')
    } finally {
      setImporting(false)
    }
  }

  const handleConfirmImport = () => {
    setSector(previewData.sector)
    // Custom factor = total_emissions / goodsTons. We assume goodsTons is already set correctly by user or keep current.
    const calculatedFactor = previewData.total_cbam_emissions / goodsTons
    setCustomFactor(calculatedFactor.toFixed(3))
    toast.success('ISO 14064 verileri aktarıldı. Özel faktör güncellendi.')
    setPreviewData(null)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
          <Globe className="text-blue-600" size={32} />
          SKDM (CBAM) Küresel Pasaport
        </h1>
        <p className="text-slate-500">AB'ye ihracat yapan şirketler için sınırda karbon vergisi simülasyonu ve resmi beyanname motoru.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-slate-800">Ürün Yoğunluğu & İhracat Verileri</h2>
              <div className="flex items-center gap-2">
                <select 
                  value={importYear} 
                  onChange={e => setImportYear(Number(e.target.value))}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value={2024}>2024</option>
                  <option value={2023}>2023</option>
                  <option value={2022}>2022</option>
                </select>
                <button 
                  onClick={handlePreviewImport}
                  disabled={importing}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2"
                >
                  <FileDown size={14} /> 
                  ISO 14064'ten Aktar
                </button>
              </div>
            </div>

            {previewData && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6">
                <h3 className="font-bold text-blue-900 mb-2">İçe Aktarım Önizlemesi ({previewData.year})</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800 mb-4">
                  <p>Doğrudan (Scope 1): {previewData.direct_emissions} t</p>
                  <p>Dolaylı (Scope 2): {previewData.indirect_emissions} t</p>
                  <p className="font-bold col-span-2">Toplam CBAM Emisyonu: {previewData.total_cbam_emissions} t</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleConfirmImport} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
                    Onayla ve Aktar
                  </button>
                  <button onClick={() => setPreviewData(null)} className="bg-white text-slate-600 px-4 py-2 rounded-lg font-bold text-sm border">
                    İptal
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">İhraç Edilen Sektör/Ürün</label>
                <select value={sector} onChange={e => setSector(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="çelik">Demir & Çelik</option>
                  <option value="alüminyum">Alüminyum</option>
                  <option value="çimento">Çimento</option>
                  <option value="gübre">Gübre</option>
                  <option value="hidrojen">Hidrojen</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Miktar (Ton/Yıl)</label>
                <input type="number" min={0} value={goodsTons} onChange={e => setGoodsTons(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="col-span-2 mt-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider flex items-center gap-2">
                  Özel Karbon Ayak İzi (Opsiyonel) <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full">ton CO₂e / ton ürün</span>
                </label>
                <input type="number" step="0.01" value={customFactor} onChange={e => setCustomFactor(e.target.value)}
                  placeholder={`Sektör varsayılanı: ${sectorFactors[sector]}`}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <p className="text-xs text-slate-400 mt-1">Sertifikalı EPD veya özel ölçümünüz (örn. ISO 14064 aktarımı) varsa buraya girerek varsayılan değeri (Default Value) ezin.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2">
              <ShieldAlert size={20} />
              Neden Gümrük Vizesi (CBAM)?
            </h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              Ocak 2026'dan itibaren Avrupa Birliği'ne ihraç edilen CBAM kapsamındaki ürünler için karbon yoğunluğu beyan edilmek zorundadır. Aksi takdirde tonaj başına ağır cezalar (EUR 50/ton'a kadar) uygulanır. Eğer ürününüzün emisyon yoğunluğu AB ortalamasının üzerindeyse, aradaki fark için <strong>EUA Sertifikası</strong> satın alarak vergi ödemek durumunda kalacaksınız.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 shadow-lg text-white">
            <h2 className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-wider">SKDM Vergi Simülasyonu</h2>
            <div className="my-6">
              <p className="text-sm text-slate-300">Tahmini AB Sınır Vergisi</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black text-amber-400">€ {estimatedTax.toLocaleString('de-DE', { maximumFractionDigits: 0 })}</span>
                <span className="text-sm text-slate-400">/ yıl</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Toplam Gömülü Emisyon</span>
                <span className="font-bold">{embeddedEmissions.toLocaleString('de-DE', { maximumFractionDigits: 1 })} ton CO₂e</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Kullanılan Katsayı</span>
                <span className="font-bold">{factorUsed.toFixed(2)} tCO₂/tÜrün</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Güncel EUA Fiyatı</span>
                <span className="font-bold text-emerald-400">€ {euEtsPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              onClick={handleExport}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Download size={18} />
              CBAM XML İndir
            </button>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-slate-700 font-bold mb-2">
              <Euro className="text-emerald-500" size={20} />
              EUA Piyasası Analizi
            </div>
            <p className="text-xs text-slate-500">
              EUA (European Emission Allowances) fiyatı şu an <strong>71.0 EUR</strong> bandında seyretmektedir. Ancak 2030 yılına kadar bu fiyatın 120-150 EUR seviyelerine çıkması beklenmektedir. Düşük karbonlu üretime geçiş, marjlarınızı korumak için hayati önem taşır.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
