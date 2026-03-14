import { ArrowLeft, Users, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const candidates = [
  { name: 'Marcus Chen', votes: 34, percent: 39 },
  { name: 'Sofia Ramirez', votes: 28, percent: 32 },
  { name: 'Ethan Brooks', votes: 15, percent: 17 },
  { name: 'Aisha Nwosu', votes: 10, percent: 11 },
];

const ElectionDetailPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex">
      <Sidebar variant="admin" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/admin/elections"
            className="flex items-center gap-1.5 text-[#8899aa] hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <div className="h-4 w-px bg-[#1a2a3a]" />
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Student Council President 2026</h1>
            <Badge variant="active" />
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total Votes Cast', value: '87' },
            { icon: BarChart2, label: 'Voter Turnout', value: '68%' },
            { icon: Users, label: 'Registered Voters', value: '128' },
          ].map((card) => (
            <div key={card.label} className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <card.icon size={16} className="text-[#00d4c8]" />
                <span className="text-[#556677] text-xs uppercase tracking-wide">{card.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
            </div>
          ))}
        </div>

        {/* Results */}
        <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-5">Live Results</h2>
          <div className="space-y-4">
            {candidates.map((c, idx) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[#556677] text-xs w-4">{idx + 1}.</span>
                    <span className="text-white text-sm font-medium">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#8899aa] text-xs">{c.votes} votes</span>
                    <span className="text-white text-sm font-semibold w-10 text-right">{c.percent}%</span>
                  </div>
                </div>
                <div className="h-2 bg-[#0a0f1a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#00d4c8] transition-all"
                    style={{ width: `${c.percent}%`, opacity: idx === 0 ? 1 : 0.6 - idx * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline">Edit Election</Button>
          <Button variant="danger">Pause Election</Button>
        </div>
      </main>
    </div>
  );
};

export default ElectionDetailPage;
