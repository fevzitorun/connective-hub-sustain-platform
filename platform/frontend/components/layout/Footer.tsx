import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-8 px-6 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Brand & Badges */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-emerald-500/20">
              <img src="/logo.png" alt="SustainHub" className="w-7 h-7 object-contain" />
            </div>
            <span className="text-slate-200 font-bold tracking-wide">SustainHub</span>
          </div>
          <div className="flex gap-3">
            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              🔒 ISO 27001 Certified Data Centers
            </span>
            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-900/50 text-emerald-400 border border-emerald-800">
              🛡️ GDPR/KVKK Compliant
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-xs font-medium">
          <Link href="#" className="hover:text-emerald-400 transition-colors">Resources</Link>
          <Link href="/legal/terms" className="hover:text-emerald-400 transition-colors">Website T&C</Link>
          <Link href="/legal/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
          <Link href="/legal/terms" className="hover:text-emerald-400 transition-colors">Platform Terms</Link>
          <Link href="/legal/privacy" className="hover:text-emerald-400 transition-colors">GDPR Compliance</Link>
        </div>
      </div>
      <div className="text-center text-[10px] mt-8 opacity-50">
        © {new Date().getFullYear()} SustainHub.online. All rights reserved. London | Zurich | Istanbul
      </div>
    </footer>
  )
}
