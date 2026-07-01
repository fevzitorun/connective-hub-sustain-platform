'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.auth.login(form.email, form.password)
      localStorage.setItem('sustain_token', res.access_token)
      document.cookie = `sustain_token=${res.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  function demoLogin() {
    localStorage.setItem('sustain_token', 'demo_token')
    document.cookie = `sustain_token=demo_token; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white w-[45%] p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-emerald-500/30">🌿</div>
          <span className="font-black text-xl">SustainHub<span className="text-emerald-400">.online</span></span>
        </Link>
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-black leading-tight mb-4">
              The Intelligence Layer<br />
              <span className="text-emerald-400">for Sustainable Finance.</span>
            </h2>
            <p className="text-slate-400 leading-relaxed">
              43 modules. AI + satellite data. TSRS · ISSB · GRI · CBAM — everything your sustainability team needs in one platform.
            </p>
          </div>
          <div className="space-y-3">
            {[
              'TSRS 1+2 compliant reporting engine',
              'Bank GAR & PCAF financed emissions',
              'Satellite-verified physical climate risk',
              'AI-generated report drafts in minutes',
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                <span className="text-emerald-400 shrink-0">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-600">
          © 2026 SustainHub · Connective Hub Digital Technologies Ltd.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-lg">🌿</div>
              <span className="font-black text-xl text-slate-900">SustainHub<span className="text-emerald-600">.online</span></span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900 mb-1">Sign in to your account</h1>
            <p className="text-slate-500 text-sm">
              No account?{' '}
              <Link href="/register" className="text-emerald-600 font-semibold hover:underline">
                Start for free →
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Password</label>
                <Link href="/forgot-password" className="text-xs text-emerald-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-white text-sm bg-slate-900 hover:bg-slate-800 transition-all disabled:opacity-60 shadow-lg"
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Demo login */}
          <button
            onClick={demoLogin}
            className="w-full py-3 rounded-xl text-sm font-bold border-2 border-dashed border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-all"
          >
            🚀 Enter Demo Mode (no login required)
          </button>

          <p className="text-center text-xs text-slate-400 mt-6">
            By signing in you agree to our{' '}
            <Link href="/legal/terms" className="hover:underline">Terms</Link> and{' '}
            <Link href="/legal/privacy" className="hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
