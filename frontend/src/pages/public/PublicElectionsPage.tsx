import { useState, useEffect } from 'react'
import { Search, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar'
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

const PublicElectionsPage = () => {
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

  const schedule = [...filtered].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />

      <main className="pt-24 pb-16 px-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Elections</h1>
          <p className="text-[#8899aa] mt-1">View all elections and the voting schedule. No account required.</p>
        </div>

        <div className="relative w-full max-w-sm mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#556677]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search elections..."
            className="bg-[#0f1929] border border-[#1a2a3a] rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-[#556677] focus:border-[#00d4c8] focus:outline-none w-full text-sm"
          />
        </div>

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

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-[#556677]">Loading elections...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#556677]">No elections found.</div>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Election schedule
              </h2>
              <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a2a3a]">
                      <th className="px-5 py-3 text-left text-xs text-[#556677] uppercase tracking-wide font-medium">Title</th>
                      <th className="px-5 py-3 text-left text-xs text-[#556677] uppercase tracking-wide font-medium">Status</th>
                      <th className="px-5 py-3 text-left text-xs text-[#556677] uppercase tracking-wide font-medium">Start</th>
                      <th className="px-5 py-3 text-left text-xs text-[#556677] uppercase tracking-wide font-medium">End</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a2a3a]">
                    {schedule.map((e) => (
                      <tr key={e.id} className="hover:bg-white/[0.02]">
                        <td className="px-5 py-3 text-white text-sm font-medium">{e.title}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            e.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                            e.status === 'UPCOMING' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-[#8899aa] text-sm">{formatDate(e.startDate)}</td>
                        <td className="px-5 py-3 text-[#8899aa] text-sm">{formatDate(e.endDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">All elections</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
            </section>
          </>
        )}

        <p className="mt-8 text-[#556677] text-sm">
          <Link to="/register" className="text-[#00d4c8] hover:underline">Register</Link>
          {' or '}
          <Link to="/login" className="text-[#00d4c8] hover:underline">log in</Link>
          {' to cast your vote in active elections.'}
        </p>
      </main>
    </div>
  )
}

export default PublicElectionsPage
