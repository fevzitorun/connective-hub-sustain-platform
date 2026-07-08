'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { SECTORS } from '@/lib/constants'

const COMPANY_TYPES = [
  { id: 'bank', icon: '🏦', label: 'Bank / Financial Institution', desc: 'GAR Suite, PCAF, Green Asset Ratio' },
  { id: 'corporate', icon: '🏢', label: 'Corporate / Holding', desc: 'TSRS, GRI, CBAM, Scope 1-2-3' },
  { id: 'sme', icon: '🏭', label: 'SME', desc: 'ESG Credit Score, Quick Check, KOBİ tools' },
  { id: 'university', icon: '🎓', label: 'University / Research', desc: 'Academic Core, research modules' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    company_type: '',
    name: '',
    email: '',
    password: '',
    company_name: '',
    tax_id: '',
    sector: 'manufacturing',
    employee_count: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.auth.register({
        name: form.name,
        email: form.email,
        password: form.password,
        company_name: form.company_name,
        tax_id: form.tax_id,
        sector: form.sector,
        employee_count: form.employee_count ? parseInt(form.employee_count) : undefined,
      })
      localStorage.setItem('sustain_token', res.access_token)
      localStorage.setItem('company_type', form.company_type)
      document.cookie = `sustain_token=${res.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      toast.success('Account created! Welcome to SustainHub.')
      router.push('/onboarding')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white w-[40%] p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-emerald-500/30">🌿</div>
          <span className="font-black text-xl">SustainHub<span className="text-emerald-400">.online</span></span>
        </Link>
        <div className="space-y-8">
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
              14-day free trial · no credit card
            </div>
            <h2 className="text-3xl font-black leading-tight mb-4">
              Start measuring.<br />
              <span className="text-emerald-400">Start reporting.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Set up your workspace in under 5 minutes. Your role-based dashboard activates immediately after you choose your organisation type.
            </p>
          </div>
          <div className="space-y-4">
            {COMPANY_TYPES.map(ct => (
              <div key={ct.id} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${form.company_type === ct.id ? 'bg-emerald-900/40 border-emerald-500/50' : 'bg-white/5 border-white/10'}`}>
                <span className="text-2xl">{ct.icon}</span>
                <div>
                  <div className="text-sm font-bold text-white">{ct.label}</div>
                  <div className="text-xs text-slate-500">{ct.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-600">© 2026 SustainHub · Connective Hub Digital Technologies Ltd.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-lg">🌿</div>
              <span className="font-black text-xl text-slate-900">SustainHub<span className="text-emerald-600">.online</span></span>
            </Link>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map(n => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= n ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {n}
                </div>
                {n < 2 && <div className={`w-12 h-0.5 transition-all ${step > n ? 'bg-slate-900' : 'bg-slate-200'}`} />}
              </div>
            ))}
            <span className="ml-2 text-xs text-slate-400">{step === 1 ? 'Choose your workspace' : 'Account details'}</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-900 mb-1">
              {step === 1 ? "What's your organisation?" : 'Create your account'}
            </h1>
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-600 font-semibold hover:underline">Sign in →</Link>
            </p>
          </div>

          {/* Step 1 — company type */}
          {step === 1 && (
            <div className="space-y-3">
              {COMPANY_TYPES.map(ct => (
                <button
                  key={ct.id}
                  type="button"
                  onClick={() => {
                    setForm(f => ({ ...f, company_type: ct.id }))
                    setStep(2)
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50 ${form.company_type === ct.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}
                >
                  <span className="text-3xl">{ct.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 text-sm">{ct.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{ct.desc}</div>
                  </div>
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* Step 2 — details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Back */}
              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 mb-2 -mt-2 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Change organisation type
              </button>

              {/* Selected badge */}
              {form.company_type && (() => {
                const ct = COMPANY_TYPES.find(c => c.id === form.company_type)!
                return (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-sm">
                    <span>{ct.icon}</span>
                    <span className="font-bold text-emerald-800">{ct.label}</span>
                    <span className="text-emerald-600 text-xs ml-auto">workspace selected</span>
                  </div>
                )
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Full Name</label>
                  <input type="text" required placeholder="Jane Smith" value={form.name} onChange={set('name')}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Work Email</label>
                  <input type="email" required placeholder="you@company.com" value={form.email} onChange={set('email')}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Password</label>
                <input type="password" required minLength={8} placeholder="Min. 8 characters" value={form.password} onChange={set('password')}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Company Name</label>
                  <input type="text" required placeholder="Acme Corp" value={form.company_name} onChange={set('company_name')}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Tax ID <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                  <input type="text" placeholder="1234567890" maxLength={10} value={form.tax_id} onChange={set('tax_id')}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Industry</label>
                  <select value={form.sector} onChange={set('sector')}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white">
                    {SECTORS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Employees</label>
                  <input type="number" placeholder="250" min={1} value={form.employee_count} onChange={set('employee_count')}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white" />
                </div>
              </div>

              <div className="flex items-start gap-2.5 py-1">
                <input type="checkbox" required id="terms"
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <Link href="/legal/terms" className="text-emerald-600 hover:underline font-medium">Terms of Use</Link>
                  {' '}and{' '}
                  <Link href="/legal/privacy" className="text-emerald-600 hover:underline font-medium">Privacy Policy</Link>
                  {' '}(GDPR / KVKK consent included)
                </label>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-black text-white text-sm bg-slate-900 hover:bg-slate-800 transition-all disabled:opacity-60 shadow-lg">
                {loading ? 'Creating account…' : 'Start Free Trial →'}
              </button>

              <p className="text-center text-xs text-slate-400">
                14 days free · no credit card required · cancel anytime
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
