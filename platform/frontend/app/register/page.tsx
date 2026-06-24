'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { SECTORS } from '@/lib/constants'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    company_name: '',
    tax_id: '',
    sector: 'manufacturing',
    employee_count: '',
  })

  async function handleSubmit(e: React.FormEvent) {
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
      document.cookie = `sustain_token=${res.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
      toast.success('Hesabınız oluşturuldu')
      router.push('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Kayıt başarısız')
    } finally {
      setLoading(false)
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center py-12" style={{ background: 'var(--green-900)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'var(--green-500)' }}>
              🌿
            </div>
            <span className="text-xl font-black text-white">SustainHub.online</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--green-300)' }}>
            Sürdürülebilirlik Raporlama Platformu
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--green-900)' }}>Ücretsiz Başlayın</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
            14 gün ücretsiz, kredi kartı gerekmez
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                  Ad Soyad
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                  style={{ borderColor: 'var(--border)' }}
                  placeholder="Ahmet Yılmaz"
                  value={form.name}
                  onChange={set('name')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                  E-posta
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                  style={{ borderColor: 'var(--border)' }}
                  placeholder="isim@sirket.com"
                  value={form.email}
                  onChange={set('email')}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                Şifre
              </label>
              <input
                type="password"
                required
                minLength={8}
                className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                style={{ borderColor: 'var(--border)' }}
                placeholder="En az 8 karakter"
                value={form.password}
                onChange={set('password')}
              />
            </div>

            <hr style={{ borderColor: 'var(--border)' }} />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                  Şirket Adı
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                  style={{ borderColor: 'var(--border)' }}
                  placeholder="Şirket A.Ş."
                  value={form.company_name}
                  onChange={set('company_name')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                  Vergi No
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                  style={{ borderColor: 'var(--border)' }}
                  placeholder="1234567890"
                  maxLength={10}
                  value={form.tax_id}
                  onChange={set('tax_id')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                  Sektör
                </label>
                <select
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                  style={{ borderColor: 'var(--border)' }}
                  value={form.sector}
                  onChange={set('sector')}
                >
                  {SECTORS.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
                  Çalışan Sayısı
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
                  style={{ borderColor: 'var(--border)' }}
                  placeholder="250"
                  min={1}
                  value={form.employee_count}
                  onChange={set('employee_count')}
                />
              </div>
            </div>

            <div className="space-y-3 py-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" required className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                <span className="text-xs text-slate-600 leading-tight">
                  <Link href="/legal/terms" className="text-emerald-700 font-medium hover:underline">Terms of Use</Link> ve <Link href="/legal/privacy" className="text-emerald-700 font-medium hover:underline">Privacy Policy</Link>'yi okudum, kabul ediyorum.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" required className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                <span className="text-xs text-slate-600 leading-tight">
                  Verilerimin analiz edilmesi için açık rıza veriyorum (GDPR/KVKK Opt-in).
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-60"
              style={{ background: 'var(--green-700)' }}
            >
              {loading ? 'Hesap oluşturuluyor…' : 'Ücretsiz Başla →'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="font-semibold" style={{ color: 'var(--green-700)' }}>
              Giriş Yapın
            </Link>
          </div>

          <p className="mt-4 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Kaydolarak{' '}
            <span className="font-medium" style={{ color: 'var(--green-700)' }}>Kullanım Koşulları</span>
            {' '}ve{' '}
            <span className="font-medium" style={{ color: 'var(--green-700)' }}>Gizlilik Politikası</span>'nı
            kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  )
}
