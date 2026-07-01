import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: '#020c0a', color: '#f1f5f9' }}
    >
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="text-8xl font-black" style={{ color: '#059669' }}>404</div>
        <h1 className="text-3xl font-black text-white">Page Not Found</h1>
        <p className="text-slate-400 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center flex-wrap pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#059669,#0284c7)' }}
          >
            Go Home →
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl font-bold text-sm border border-slate-700 text-slate-300 hover:border-emerald-500 transition-colors"
          >
            Dashboard
          </Link>
        </div>
        <p className="text-xs text-slate-700 pt-4">
          SustainHub.online · Connective Hub Digital Technologies Ltd.
        </p>
      </div>
    </div>
  )
}
