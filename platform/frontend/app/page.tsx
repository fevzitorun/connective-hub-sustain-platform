'use client'
import React from 'react'
import Link from 'next/link'
import { Factory, Landmark, Truck, GraduationCap, ArrowRight, ShieldCheck, Globe, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20">🌿</div>
            <div>
              <span className="font-black text-2xl tracking-tight text-slate-900">SustainHub</span>
              <span className="text-emerald-600 font-bold ml-1">.online</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-slate-600">
            <Link href="#platform" className="hover:text-emerald-600 transition-colors">Platform</Link>
            <Link href="#solutions" className="hover:text-emerald-600 transition-colors">Solutions</Link>
            <Link href="/pitch-deck.html" className="hover:text-emerald-600 transition-colors">Investors</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden md:block text-sm font-bold text-slate-600 hover:text-slate-900">
              Sign In
            </Link>
            <Link href="/dashboard" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-xl">
              Launch Platform <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-widest mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            SustainHub 2.0 is Live
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-[1.1]">
            The Operating System <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">for Green Transition.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
            Zurich Trust. London Finance. Istanbul Production. <br/>
            Powered by AI & Satellites.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
            <Link href="/dashboard" className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] flex items-center justify-center gap-3">
              Enter The Ecosystem
            </Link>
            <Link href="/pitch-deck.html" className="w-full sm:w-auto bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3">
              View Investor Deck
            </Link>
          </div>
        </div>
      </section>

      {/* One Platform, Four Worlds Section */}
      <section id="platform" className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">One Platform, Four Worlds.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              SustainHub bridges the gap between industrial production, high-tier finance, global supply chains, and academic innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* World 1: SME */}
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:bg-slate-800/80 transition-all group">
              <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Factory size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Industrial Edge</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Automate CBAM declarations, track Scope 1-2-3 emissions via IoT, and optimize Decarbonization ROI using AI.
              </p>
            </div>

            {/* World 2: Bank */}
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:bg-slate-800/80 transition-all group">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Landmark size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Green Finance</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Unlock London's green credit lines. Automated GAR reporting, climate risk stress testing (TCFD), and Swiss-grade audit trails.
              </p>
            </div>

            {/* World 3: Supply Chain */}
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:bg-slate-800/80 transition-all group">
              <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Truck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Supply Nexus</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Orchestrate your vendors. Full EUDR compliance with map-based traceability, vendor maturity scoring, and automated audits.
              </p>
            </div>

            {/* World 4: Academy */}
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:bg-slate-800/80 transition-all group">
              <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Academic Core</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                UI GreenMetric automation for campuses. Real-time simulators for students to earn blockchain-verified ESG Analyst certificates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Proof */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-black text-slate-800 mb-12">The Ultimate Trust Layer</h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                <ShieldCheck className="text-emerald-600" size={32} />
              </div>
              <div className="font-bold text-slate-600">ISO 27001 Certified</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                <Globe className="text-blue-600" size={32} />
              </div>
              <div className="font-bold text-slate-600">GDPR Compliant</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                <Zap className="text-amber-500" size={32} />
              </div>
              <div className="font-bold text-slate-600">Satellite Verified</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6 text-center text-slate-500 text-sm font-medium">
        <p>© 2026 SustainHub.online - Zurich · London · Istanbul</p>
      </footer>
    </div>
  )
}
