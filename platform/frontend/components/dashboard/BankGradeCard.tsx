import React from 'react';
import { CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface BankGradeCardProps {
  score: number;
  grade: string;
}

export const BankGradeCard: React.FC<BankGradeCardProps> = ({ score, grade }) => {
  const isEligible = score >= 65;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Sustain-Score</h3>
            <p className="text-4xl font-bold text-white mt-1">
              {grade} <span className="text-xl text-slate-500 font-normal">({score}/100)</span>
            </p>
          </div>
          <div className={`p-3 rounded-lg ${isEligible ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
            {isEligible ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
          </div>
        </div>

        <div className="space-y-3 relative z-10 mt-6">
          <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800">
            <span className="text-slate-300 text-sm">Yeşil Kredi Uygunluğu:</span>
            {isEligible ? (
              <span className="text-green-400 text-sm font-bold flex items-center gap-1">
                <ShieldCheck size={16} /> Uygun (Yeşil Finansman)
              </span>
            ) : (
              <span className="text-yellow-400 text-sm font-bold flex items-center gap-1">
                Gelişim Gerekli
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Mühür */}
      <div className="mt-8 flex justify-end items-center opacity-80 border-t border-slate-700/50 pt-4">
        <div className="text-xs text-slate-500 flex flex-col items-end">
          <span className="font-semibold text-blue-400">SustainHub.online Onaylı</span>
          <span>Banka Paylaşımına Hazır</span>
          <span className="font-mono text-[10px] mt-1 tracking-widest text-slate-600">DOGRULAMA: 0x8F...A12B</span>
        </div>
      </div>
    </div>
  );
};

export default BankGradeCard;
