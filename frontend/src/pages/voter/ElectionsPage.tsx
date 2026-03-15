import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import Sidebar from '../../components/layout/Sidebar'
import ElectionCard from '../../components/shared/ElectionCard'
import { electionsApi, type ElectionListItem } from '../../api/client'

type FilterTab = 'all' | 'ACTIVE' | 'UPCOMING' | 'CLOSED'

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'CLOSED', label: 'Closed' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusToVariant(s: string): 'active' | 'upcoming' | 'closed' {
  const lower = s.toLowerCase()
  if (lower === 'active') return 'active'
  if (lower === 'upcoming' || lower === 'paused') return 'upcoming'
  return 'closed'
}

const ElectionsPage = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [elections, setElections] = useState<ElectionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const status = activeTab === 'all' ? undefined : activeTab
    setLoading(true)
    setError(null)
    electionsApi
      .getList({ status })
      .then(setElections)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [activeTab])

  const filtered = elections.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex">
      <Sidebar variant="voter" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Elections</h1>
            <p className="text-[#8899aa] text-sm mt-1">Browse and participate in ongoing elections</p>
          </div>
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#556677]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search elections..."
              className="bg-[#0f1929] border border-[#1a2a3a] rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-[#556677] focus:border-[#00d4c8] focus:outline-none w-full text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-1 mb-6 bg-[#0f1929] border border-[#1a2a3a] rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tab.key ? 'bg-[#00d4c8] text-black' : 'text-[#8899aa] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#556677]">Loading elections...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#556677]">No elections found.</div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {filtered.map((election) => (
              <ElectionCard
                key={election.id}
                id={election.id}
                title={election.title}
                description={election.description}
                status={statusToVariant(election.status)}
                startDate={formatDate(election.startDate)}
                endDate={formatDate(election.endDate)}
                candidateCount={election.candidateCount}
                hasVoted={false}
                role="voter"
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default ElectionsPage
