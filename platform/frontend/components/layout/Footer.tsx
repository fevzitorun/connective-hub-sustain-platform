import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-10 px-6 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Brand — SustainHub by Connective */}
        <div className="flex flex-col gap-4">
          <div>
            <img src="/logo-reversed.svg" alt="SustainHub" className="h-8 w-auto max-w-full" />
            <div className="text-xs text-slate-500 mt-1.5">
              <span className="text-emerald-400/90 font-semibold">by Connective</span> · sustainhub.online
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
              🔒 ISO 27001 Certified Data Centers
            </span>
            <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-900/50 text-emerald-400 border border-emerald-800">
              🛡️ GDPR / KVKK Compliant
            </span>
          </div>
        </div>

        {/* Şirket & Adres */}
        <div className="text-xs leading-relaxed">
          <div className="text-slate-200 font-semibold mb-2">Connective Hub Dijital Teknolojiler Ltd. Şti.</div>
          <div className="text-slate-400">
            Dijitalpark Teknokent, Barbaros,<br />
            Şebboy Sk. No:4/1 Zemin Kat,<br />
            34742 Ataşehir / İstanbul
          </div>
          <a href="mailto:hello@sustainhub.online" className="text-emerald-400 hover:text-emerald-300 transition-colors inline-block mt-2">
            hello@sustainhub.online
          </a>
          <div className="text-slate-500 mt-2">Londra: Connective Hub Limited</div>
        </div>

        {/* Bağlantılar */}
        <div className="flex flex-col gap-2 text-xs font-medium md:items-end">
          <Link href="/legal/terms" className="hover:text-emerald-400 transition-colors">Website T&C</Link>
          <Link href="/legal/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
          <Link href="/legal/terms" className="hover:text-emerald-400 transition-colors">Platform Terms</Link>
          <Link href="/legal/privacy" className="hover:text-emerald-400 transition-colors">GDPR / KVKK</Link>
        </div>
      </div>

      <div className="text-center text-[10px] mt-8 opacity-50 border-t border-slate-800/60 pt-6">
        © {new Date().getFullYear()} SustainHub · Connective Hub Dijital Teknolojiler Ltd. Şti. · İstanbul · Londra
      </div>
    </footer>
  )
}
