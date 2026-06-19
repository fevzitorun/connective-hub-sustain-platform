'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { api } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.auth.login(form.email, form.password)
      localStorage.setItem('sustain_token', res.access_token)
      document.cookie = `sustain_token=${res.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      toast.success('Giriş başarılı')
      router.push('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Giriş başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--green-900)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'var(--green-500)' }}>
              🌿
            </div>
            <span className="text-xl font-black text-white">sustain.com.tr</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--green-300)' }}>
            Sürdürülebilirlik Raporlama Platformu
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--green-900)' }}>Giriş Yap</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
            Hesabınıza erişin
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                E-posta
              </label>
              <input
                type="email"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all"
                style={{ borderColor: 'var(--border)' }}
                placeholder="isim@sirket.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                Şifre
              </label>
              <input
                type="password"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none transition-all"
                style={{ borderColor: 'var(--border)' }}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-60"
              style={{ background: 'var(--green-700)' }}
            >
              {loading ? 'Giriş yapılıyor…' : 'Giriş Yap →'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Hesabınız yok mu?{' '}
            <Link href="/register" className="font-semibold" style={{ color: 'var(--green-700)' }}>
              Ücretsiz Başlayın
            </Link>
          </div>

          {/* Dev shortcut */}
          <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              className="w-full py-2 rounded-lg text-xs font-medium transition-colors"
              style={{ background: 'var(--green-50)', color: 'var(--green-800)' }}
              onClick={() => {
                localStorage.setItem('sustain_token', 'demo_token')
                document.cookie = `sustain_token=demo_token; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
                router.push('/dashboard')
              }}
            >
              🚀 Demo Girişi (geliştirme)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
