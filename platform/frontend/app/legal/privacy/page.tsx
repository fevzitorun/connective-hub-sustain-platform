import { Header } from '@/components/layout/Header'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Privacy Policy" subtitle="SustainHub.online Data Protection" />
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-8 py-16">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl">
              🛡️
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="text-slate-500 mt-1">GDPR & KVKK Compliance</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-6 text-emerald-900 font-medium">
              SustainHub.online, verilerinizi uçtan uca şifreler. Verileriniz, AB GDPR ve TR KVKK standartlarına uygun olarak güvenli bulut sunucularında saklanır. Karbon hesaplamaları için kullanılan veriler üçüncü taraflarla reklam amaçlı paylaşılmaz.
            </div>

            <h3 className="text-xl font-bold text-slate-800 mt-8">1. Data Security & Encryption</h3>
            <p>All sustainability and financial data uploaded to the platform is encrypted both in transit (TLS 1.3) and at rest (AES-256). We utilize ISO 27001 certified data centers physically located in Zurich, Switzerland and Frankfurt, Germany to ensure maximum regulatory compliance.</p>

            <h3 className="text-xl font-bold text-slate-800 mt-6">2. GDPR & KVKK Compliance</h3>
            <p>Your data is yours. We act strictly as a data processor. You retain full ownership of all uploaded invoices, sensor data, and generated reports. You have the right to export, modify, or permanently delete your data at any time under the "Right to be Forgotten" provisions of both the EU GDPR and Turkish KVKK.</p>

            <h3 className="text-xl font-bold text-slate-800 mt-6">3. Third-Party Sharing</h3>
            <p>SustainHub.online does not sell or share your raw operational data with third parties. Anonymized, highly aggregated data may only be used for calculating macro-industry benchmarks if explicitly opted-in by the user.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
