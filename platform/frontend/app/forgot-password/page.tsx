'use client'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { api } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.auth.forgotPassword(email).catch(() => {})
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white w-[45%] p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-emerald-500/30">🌿</div>
          <span className="font-black text-xl">SustainHub<span className="text-emerald-400">.online</span></span>
        </Link>
        <div className="space-y-4">
          <h2 className="text-3xl font-black leading-tight">
            Account Recovery<br />
            <span className="text-emerald-400">Quick &amp; Secure.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            We'll send a one-time password reset link to your registered work email. The link expires in 30 minutes.
          </p>
        </div>
        <p className="text-xs text-slate-600">© 2026 SustainHub · Connective Hub Digital Technologies Ltd.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-lg">🌿</div>
              <span className="font-black text-xl text-slate-900">SustainHub<span className="text-emerald-600">.online</span></span>
            </Link>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-6xl">📬</div>
              <h1 className="text-2xl font-black text-slate-900">Check your inbox</h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                If <strong>{email}</strong> is registered, you'll receive a reset link within a few minutes. Check your spam folder if it doesn't arrive.
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 text-sm font-semibold text-emerald-600 hover:underline"
              >
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 mb-1">Forgot your password?</h1>
                <p className="text-slate-500 text-sm">
                  Enter your work email and we'll send you a reset link.
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
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-black text-white text-sm bg-slate-900 hover:bg-slate-800 transition-all disabled:opacity-60 shadow-lg"
                >
                  {loading ? 'Sending…' : 'Send Reset Link →'}
                </button>
              </form>

              <p className="text-center text-sm mt-6">
                <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
                  ← Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
