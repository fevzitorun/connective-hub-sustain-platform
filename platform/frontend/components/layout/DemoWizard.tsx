'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wand2, X, ChevronRight, Factory, ShieldCheck, GraduationCap, Landmark } from 'lucide-react'

export function DemoWizard() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const demoRoutes = [
    { label: 'Factory View (Kocaeli)', path: '/dashboard', icon: <Factory size={16} />, color: 'text-blue-500' },
    { label: 'Trust View (Zurich)', path: '/uydu', icon: <ShieldCheck size={16} />, color: 'text-emerald-500' },
    { label: 'Science View (ITU)', path: '/university', icon: <GraduationCap size={16} />, color: 'text-indigo-500' },
    { label: 'Banking View (GAR)', path: '/gar', icon: <Landmark size={16} />, color: 'text-amber-500' },
  ]

  const handleNavigate = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-slate-800 transition-all z-50 flex items-center gap-2 group border border-slate-700"
      >
        <Wand2 className="text-amber-400 group-hover:rotate-12 transition-transform" size={24} />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 z-50 overflow-hidden animate-in slide-in-from-bottom-5">
      <div className="bg-slate-800 px-4 py-3 flex justify-between items-center border-b border-slate-700">
        <h3 className="text-white font-bold flex items-center gap-2">
          <Wand2 className="text-amber-400" size={18} />
          Demo Wizard
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-3">
        <p className="text-xs text-slate-400 mb-3 px-1">
          Lansman Sunumu Hızlı Geçiş Menüsü:
        </p>
        <div className="space-y-2">
          {demoRoutes.map((route, idx) => (
            <button
              key={idx}
              onClick={() => handleNavigate(route.path)}
              className="w-full flex items-center justify-between px-3 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className={route.color}>{route.icon}</span>
                <span className="text-sm font-semibold text-slate-200 group-hover:text-white">{route.label}</span>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
