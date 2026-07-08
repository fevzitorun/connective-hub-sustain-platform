'use client'
import React, { useState } from 'react'
import { ShieldCheck, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function DenetimTerminaliPage() {
  const [records, setRecords] = useState([
    { id: 101, type: 'Kapsam 2 - Elektrik', value: '150,000 kWh', evidence: 'Enerjisa Faturası_May.pdf', status: 'pending' },
    { id: 102, type: 'Kapsam 1 - Doğalgaz', value: '55,000 m³', evidence: 'İGDAŞ_Fatura_May.pdf', status: 'pending' },
    { id: 103, type: 'Kapsam 3 - İş Seyahati', value: '12,500 km', evidence: 'THY_Boarding_Pass.zip', status: 'pending' }
  ])

  const handleVerify = (id: number, status: 'verified' | 'rejected') => {
    setRecords(records.map(r => r.id === id ? { ...r, status } : r))
    toast.success(`Kayıt #${id} ${status === 'verified' ? 'doğrulandı' : 'reddedildi'}.`)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
          <ShieldCheck className="text-emerald-600" size={32} />
          Denetçi Terminali (Auditor Hub)
        </h1>
        <p className="text-slate-500">Bağımsız denetçiler için kanıt inceleme ve onay arayüzü.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Bekleyen Denetim Kayıtları</h2>
          <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
            {records.filter(r => r.status === 'pending').length} İncelenecek
          </span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {records.map(record => (
            <div key={record.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{record.type}</span>
                  {record.status === 'verified' && <CheckCircle size={16} className="text-emerald-500" />}
                  {record.status === 'rejected' && <XCircle size={16} className="text-red-500" />}
                </div>
                <p className="text-sm text-slate-500 font-mono">Beyan Edilen: {record.value}</p>
                <div className="flex items-center gap-1 mt-2 text-blue-600 cursor-pointer hover:underline text-xs font-semibold">
                  <FileText size={14} /> Kanıt Belgesi: {record.evidence}
                </div>
              </div>
              
              <div className="flex gap-2">
                {record.status === 'pending' ? (
                  <>
                    <button onClick={() => handleVerify(record.id, 'rejected')}
                      className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors">
                      Reddet
                    </button>
                    <button onClick={() => handleVerify(record.id, 'verified')}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors">
                      Doğrula (Verify)
                    </button>
                  </>
                ) : (
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                    record.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {record.status === 'verified' ? 'Onaylandı' : 'Reddedildi'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {records.every(r => r.status !== 'pending') && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
          <CheckCircle className="text-emerald-600 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-emerald-900">Denetim Tamamlandı</h3>
            <p className="text-sm text-emerald-800">Tüm kayıtlar başarıyla incelendi. Şirketin kamusal ESG profilinde "Verified by Auditor" mührü aktif edildi.</p>
          </div>
        </div>
      )}
    </div>
  )
}
