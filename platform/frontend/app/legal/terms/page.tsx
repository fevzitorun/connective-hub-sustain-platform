import { Header } from '@/components/layout/Header'

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Terms of Service" subtitle="Platform Usage & Disclaimer" />
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-8 py-16">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-2xl">
              ⚖️
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
              <p className="text-slate-500 mt-1">Platform General Terms & Conditions</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-slate-800 font-medium">
              SustainHub, bir raporlama asistanıdır. Hesaplamalar GHG Protocol ve IFRS standartlarına dayanır. Kullanıcı, sisteme girdiği verilerin doğruluğundan sorumludur.
            </div>

            <h3 className="text-xl font-bold text-slate-800 mt-8">1. Scope of Service & Disclaimer</h3>
            <p>SustainHub.online provides automated sustainability calculations, AI-assisted reporting, and satellite risk verifications based on widely accepted international frameworks (GHG Protocol, IFRS, TSRS, CSRD). However, the platform acts solely as a technological enabler and reporting assistant.</p>
            <p><strong>Disclaimer:</strong> The accuracy of the generated reports depends entirely on the accuracy and completeness of the data inputted by the User. SustainHub.online does not replace formal third-party audits or legal environmental consulting. The ultimate responsibility for regulatory filings and compliance declarations rests with the User.</p>

            <h3 className="text-xl font-bold text-slate-800 mt-6">2. Subscription & Cancellation</h3>
            <p>Subscriptions are billed in advance on a monthly or annual basis. You may cancel your subscription at any time; however, no refunds are provided for partial months. Upon cancellation, your data will remain accessible in read-only mode for 30 days before being securely purged.</p>

            <h3 className="text-xl font-bold text-slate-800 mt-6">3. Advisor & Multi-Tenant Accounts</h3>
            <p>Users registered under the "ADVISOR" role are responsible for obtaining the necessary legal consent from their respective clients before uploading any third-party corporate data into the platform.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
