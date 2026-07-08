import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — SustainHub',
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-base">🌿</div>
          <span className="font-black text-slate-900 text-xl">SustainHub<span className="text-emerald-600">.online</span></span>
        </Link>
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">← Back to Home</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Cookie Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: July 2026</p>

        <h2 className="text-xl font-bold text-slate-900 mb-3">What Are Cookies?</h2>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          Cookies are small text files stored on your device when you visit a website. They help us provide a better experience by remembering your preferences and understanding how you use the platform.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mb-3">Cookies We Use</h2>
        <div className="space-y-4 mb-8">
          {[
            { type: 'Essential', desc: 'Required for login sessions and security. Cannot be disabled.', examples: 'auth_token, csrf_token' },
            { type: 'Functional', desc: 'Remember your preferences (language, sidebar state, currency).', examples: 'prelaunch_statuses, currency_pref' },
            { type: 'Analytics', desc: 'Help us understand usage patterns to improve the platform. Anonymised.', examples: 'ga_session (Google Analytics)' },
            { type: 'Marketing', desc: 'Used for demo booking conversion tracking. Only active with your consent.', examples: 'fbp, _gcl_aw' },
          ].map(c => (
            <div key={c.type} className="border border-slate-200 rounded-xl p-4">
              <div className="font-bold text-slate-900 mb-1">{c.type}</div>
              <p className="text-sm text-slate-600 mb-2">{c.desc}</p>
              <code className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">{c.examples}</code>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-3">Third-Party Cookies</h2>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          We may use Google Analytics and Stripe for payment processing. These services may set their own cookies. Refer to their respective privacy policies.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mb-3">Managing Cookies</h2>
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          You can control cookies through your browser settings. Disabling essential cookies will prevent login functionality. To opt out of analytics, you can use browser extensions or adjust settings in your SustainHub account preferences.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mb-3">Contact</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Questions about our cookie policy? Contact us at{' '}
          <a href="mailto:privacy@sustainhub.online" className="text-emerald-600 hover:underline">privacy@sustainhub.online</a>
          {' '}or visit our{' '}
          <Link href="/contact" className="text-emerald-600 hover:underline">contact page</Link>.
        </p>
      </div>
    </div>
  )
}
