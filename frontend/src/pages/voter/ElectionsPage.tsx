import { useState } from 'react';
import { Search } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import ElectionCard from '../../components/shared/ElectionCard';

type FilterTab = 'all' | 'active' | 'upcoming' | 'closed';

const allElections = [
  {
    id: '1',
    title: 'Student Council President 2026',
    description: 'Vote for your preferred candidate for the student council presidency this academic year.',
    status: 'active' as const,
    startDate: 'Mar 1, 2026',
    endDate: 'Mar 10, 2026',
    candidateCount: 4,
    hasVoted: false,
  },
  {
    id: '2',
    title: 'Faculty Representative Election',
    description: 'Elect your faculty representatives for the academic board of governors.',
    status: 'active' as const,
    startDate: 'Mar 3, 2026',
    endDate: 'Mar 15, 2026',
    candidateCount: 6,
    hasVoted: true,
  },
  {
    id: '3',
    title: 'Department Head Selection',
    description: 'Select the department head for the Computer Science department for the next term.',
    status: 'upcoming' as const,
    startDate: 'Mar 20, 2026',
    endDate: 'Mar 27, 2026',
    candidateCount: 3,
    hasVoted: false,
  },
  {
    id: '4',
    title: 'Research Committee Election',
    description: 'Elect members for the university research and innovation committee.',
    status: 'upcoming' as const,
    startDate: 'Apr 1, 2026',
    endDate: 'Apr 8, 2026',
    candidateCount: 8,
    hasVoted: false,
  },
  {
    id: '5',
    title: 'Annual Board Election 2025',
    description: 'Previous annual board elections — results are final and verifiable on chain.',
    status: 'closed' as const,
    startDate: 'Dec 1, 2025',
    endDate: 'Dec 10, 2025',
    candidateCount: 5,
    hasVoted: false,
  },
  {
    id: '6',
    title: 'Budget Committee Vote',
    description: 'Community vote on the annual budget allocation and priority projects.',
    status: 'closed' as const,
    startDate: 'Jan 15, 2026',
    endDate: 'Jan 22, 2026',
    candidateCount: 4,
    hasVoted: true,
  },
];

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'closed', label: 'Closed' },
];

const ElectionsPage = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  const filtered = allElections.filter((e) => {
    const matchesTab = activeTab === 'all' || e.status === activeTab;
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex">
      <Sidebar variant="voter" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Elections</h1>
            <p className="text-[#8899aa] text-sm mt-1">Browse and participate in ongoing elections</p>
          </div>
          {/* Search */}
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

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-6 bg-[#0f1929] border border-[#1a2a3a] rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tab.key
                  ? 'bg-[#00d4c8] text-black'
                  : 'text-[#8899aa] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#556677]">
            No elections found.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {filtered.map((election) => (
              <ElectionCard key={election.id} {...election} role="voter" />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ElectionsPage;
