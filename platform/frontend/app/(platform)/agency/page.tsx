'use client'
import { useState } from 'react'
import Link from 'next/link'

type Client = {
  id: string
  name: string
  sector: string
  country: string
  flag: string
  plan: string
  reportingYear: number
  scope1: number
  scope2: number
  scope3: number
  status: 'active' | 'draft' | 'review' | 'submitted'
  lastActivity: string
  reportsDone: number
  reportsTotal: number
  initials: string
  color: string
}

const DEMO_CLIENTS: Client[] = [
  {
    id: 'c1', name: 'Stirling Medical Ltd', sector: 'Medical Devices', country: 'UK', flag: '🇬🇧',
    plan: 'Pro', reportingYear: 2023, scope1: 12.4, scope2: 411.9, scope3: 156.8,
    status: 'draft', lastActivity: '2 hours ago', reportsDone: 3, reportsTotal: 5,
    initials: 'SM', color: '#3b82f6',
  },
  {
    id: 'c2', name: 'GreenCore Manufacturing', sector: 'Manufacturing', country: 'UK', flag: '🇬🇧',
    plan: 'Starter', reportingYear: 2023, scope1: 234.1, scope2: 892.3, scope3: 1240.0,
    status: 'active', lastActivity: '1 day ago', reportsDone: 2, reportsTotal: 4,
    initials: 'GC', color: '#10b981',
  },
  {
    id: 'c3', name: 'Nordic Logistics AS', sector: 'Logistics', country: 'Norway', flag: '🇳🇴',
    plan: 'Pro', reportingYear: 2023, scope1: 1892.4, scope2: 340.0, scope3: 4210.5,
    status: 'review', lastActivity: '3 days ago', reportsDone: 4, reportsTotal: 5,
    initials: 'NL', color: '#8b5cf6',
  },
  {
    id: 'c4', name: 'Akbank T.A.Ş.', sector: 'Banking', country: 'Turkey', flag: '🇹🇷',
    plan: 'Enterprise', reportingYear: 2023, scope1: 8.2, scope2: 72.0, scope3: 48200.0,
    status: 'submitted', lastActivity: '1 week ago', reportsDone: 5, reportsTotal: 5,
    initials: 'AK', color: '#f59e0b',
  },
  {
    id: 'c5', name: 'Thames Retail Group', sector: 'Retail', country: 'UK', flag: '🇬🇧',
    plan: 'Starter', reportingYear: 2023, scope1: 45.3, scope2: 1240.8, scope3: 890.2,
    status: 'draft', lastActivity: '5 days ago', reportsDone: 1, reportsTotal: 5,
    initials: 'TR', color: '#ec4899',
  },
]

const STATUS_CONFIG = {
  active:    { label: 'Active',    bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  draft:     { label: 'In Progress', bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  review:    { label: 'Under Review', bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  submitted: { label: 'Submitted', bg: '#dcfce7', text: '#166534', dot: '#16a34a' },
}

const STANDARDS = ['GHG Protocol', 'ISO 14064', 'TSRS 1+2', 'SECR (UK)', 'GRI 305']

export default function AgencyPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = DEMO_CLIENTS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.sector.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalClients = DEMO_CLIENTS.length
  const totalScope1 = DEMO_CLIENTS.reduce((s, c) => s + c.scope1, 0)
  const totalScope2 = DEMO_CLIENTS.reduce((s, c) => s + c.scope2, 0)
  const totalScope3 = DEMO_CLIENTS.reduce((s, c) => s + c.scope3, 0)
  const totalReports = DEMO_CLIENTS.reduce((s, c) => s + c.reportsDone, 0)
  const totalRequired = DEMO_CLIENTS.reduce((s, c) => s + c.reportsTotal, 0)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">🏢</span>
              <h1 className="text-2xl font-black text-white">Agency Portal</h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                CONSULTANCY
              </span>
            </div>
            <p className="text-slate-400 text-sm">Manage carbon footprint reports for all your clients from one workspace</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 transition-colors"
            >
              <span>+</span> Add New Client
            </button>
            <Link
              href="/report-builder"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border border-white/20 hover:border-emerald-500 text-slate-300 hover:text-white transition-colors"
            >
              📄 Report Builder
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">

        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Clients', value: totalClients, sub: '5 active', icon: '🏢', color: '#3b82f6' },
            { label: 'Total Scope 1', value: `${totalScope1.toFixed(0)} tCO₂e`, sub: 'Direct emissions', icon: '🔥', color: '#ef4444' },
            { label: 'Total Scope 2', value: `${totalScope2.toFixed(0)} tCO₂e`, sub: 'Electricity', icon: '⚡', color: '#f59e0b' },
            { label: 'Total Scope 3', value: `${(totalScope3 / 1000).toFixed(1)}K tCO₂e`, sub: 'Value chain', icon: '🔗', color: '#8b5cf6' },
            { label: 'Reports Filed', value: `${totalReports}/${totalRequired}`, sub: 'Across all clients', icon: '📄', color: '#10b981' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{stat.icon}</span>
                <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
              </div>
              <div className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
          />
          <div className="flex gap-2">
            {['all', 'active', 'draft', 'review', 'submitted'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === s
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s}
              </button>
            ))}
          </div>
        </div>

        {/* Client Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(client => {
            const st = STATUS_CONFIG[client.status]
            const progress = Math.round((client.reportsDone / client.reportsTotal) * 100)
            const totalEmissions = client.scope1 + client.scope2 + client.scope3

            return (
              <div key={client.id} className="bg-white/5 border border-white/10 hover:border-emerald-500/40 rounded-xl p-5 transition-all group">
                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                      style={{ background: client.color }}
                    >
                      {client.initials}
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {client.flag} {client.name}
                      </div>
                      <div className="text-xs text-slate-400">{client.sector} · {client.country} · {client.reportingYear}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.text }}>
                      <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ background: st.dot }} />
                      {st.label}
                    </span>
                  </div>
                </div>

                {/* Emissions summary */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Scope 1', value: client.scope1, unit: 'tCO₂e', color: '#ef4444' },
                    { label: 'Scope 2', value: client.scope2, unit: 'tCO₂e', color: '#f59e0b' },
                    { label: 'Scope 3', value: client.scope3, unit: 'tCO₂e', color: '#8b5cf6' },
                  ].map(em => (
                    <div key={em.label} className="bg-white/5 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-0.5">{em.label}</div>
                      <div className="text-sm font-bold" style={{ color: em.color }}>
                        {em.value >= 1000 ? `${(em.value / 1000).toFixed(1)}K` : em.value.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-600">{em.unit}</div>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Report progress</span>
                    <span>{client.reportsDone}/{client.reportsTotal} modules</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${progress}%`, background: progress === 100 ? '#10b981' : '#3b82f6' }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Updated {client.lastActivity}</span>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10">
                      📊 Dashboard
                    </button>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors border border-emerald-500/30">
                      📄 Report
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Add client card */}
          <button
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-xl p-5 flex flex-col items-center justify-center gap-3 transition-all group min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-emerald-500/10 flex items-center justify-center text-2xl transition-colors">
              +
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-400 group-hover:text-emerald-400 transition-colors">Add New Client</div>
              <div className="text-xs text-slate-600">Register a new company to your portfolio</div>
            </div>
          </button>
        </div>

        {/* Standards supported */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="text-sm font-bold text-slate-300 mb-3">Reporting Standards Covered</h3>
          <div className="flex flex-wrap gap-2">
            {STANDARDS.map(s => (
              <span key={s} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ✓ {s}
              </span>
            ))}
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              + UK DEFRA Emission Factors
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              + SECR (UK Mandatory)
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              + TSRS 1+2 (Turkey KGK)
            </span>
          </div>
        </div>

        {/* Agency pricing info */}
        <div className="bg-gradient-to-r from-emerald-900/30 to-blue-900/20 rounded-xl p-5 border border-emerald-500/20">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm font-bold text-emerald-400 mb-1">Agency Pro Plan — Active</div>
              <div className="text-xs text-slate-400">Unlimited client accounts · All reporting standards · White-label available</div>
            </div>
            <div className="flex gap-3">
              <div className="text-center">
                <div className="text-2xl font-black text-white">5/∞</div>
                <div className="text-xs text-slate-500">Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-white">{totalReports}</div>
                <div className="text-xs text-slate-500">Reports</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-white">$60K</div>
                <div className="text-xs text-slate-500">/ year</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Add New Client</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Company Name', placeholder: 'e.g. Stirling Medical Ltd' },
                { label: 'Contact Email', placeholder: 'contact@company.com' },
                { label: 'Country', placeholder: 'UK, Turkey, Norway...' },
                { label: 'Sector', placeholder: 'Manufacturing, Retail, Banking...' },
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">{field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-white/20 text-slate-300 hover:border-white/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  Create Client Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
