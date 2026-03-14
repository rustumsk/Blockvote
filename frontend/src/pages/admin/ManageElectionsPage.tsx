import { useState } from 'react';
import { Plus, Eye, Edit, Pause, Trash2 } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';

type FilterTab = 'all' | 'active' | 'upcoming' | 'closed';

const elections = [
  { id: '1', title: 'Student Council President 2026', status: 'active' as const, start: 'Mar 1, 2026', end: 'Mar 10, 2026', candidates: 4, votes: 87 },
  { id: '2', title: 'Faculty Representative Election', status: 'active' as const, start: 'Mar 3, 2026', end: 'Mar 15, 2026', candidates: 6, votes: 54 },
  { id: '3', title: 'Department Head Selection', status: 'upcoming' as const, start: 'Mar 20, 2026', end: 'Mar 27, 2026', candidates: 3, votes: 0 },
  { id: '4', title: 'Research Committee Election', status: 'upcoming' as const, start: 'Apr 1, 2026', end: 'Apr 8, 2026', candidates: 8, votes: 0 },
  { id: '5', title: 'Annual Board Election 2025', status: 'closed' as const, start: 'Dec 1, 2025', end: 'Dec 10, 2025', candidates: 5, votes: 203 },
];

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'closed', label: 'Closed' },
];

const defaultCandidates = [
  { name: '', description: '' },
  { name: '', description: '' },
];

const ManageElectionsPage = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showModal, setShowModal] = useState(true);
  const [candidates, setCandidates] = useState(defaultCandidates);

  const filtered = elections.filter((e) => activeTab === 'all' || e.status === activeTab);

  const addCandidate = () => setCandidates([...candidates, { name: '', description: '' }]);
  const removeCandidate = (idx: number) =>
    setCandidates(candidates.filter((_, i) => i !== idx));

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex">
      <Sidebar variant="admin" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Manage Elections</h1>
            <p className="text-[#8899aa] text-sm mt-1">Create, edit, and monitor all elections</p>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Create Election
          </Button>
        </div>

        {/* Filter tabs */}
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

        {/* Table */}
        <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a2a3a]">
                {['Title', 'Status', 'Start Date', 'End Date', 'Candidates', 'Total Votes', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs text-[#556677] uppercase tracking-wide font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2a3a]">
              {filtered.map((el) => (
                <tr key={el.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4 text-white text-sm font-medium">{el.title}</td>
                  <td className="px-5 py-4"><Badge variant={el.status} /></td>
                  <td className="px-5 py-4 text-[#8899aa] text-sm">{el.start}</td>
                  <td className="px-5 py-4 text-[#8899aa] text-sm">{el.end}</td>
                  <td className="px-5 py-4 text-[#8899aa] text-sm">{el.candidates}</td>
                  <td className="px-5 py-4 text-white text-sm font-medium">{el.votes}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-[#8899aa] hover:text-white rounded hover:bg-white/5 transition-colors">
                        <Eye size={15} />
                      </button>
                      <button className="p-1.5 text-[#8899aa] hover:text-[#00d4c8] rounded hover:bg-white/5 transition-colors">
                        <Edit size={15} />
                      </button>
                      <button className="p-1.5 text-[#8899aa] hover:text-yellow-400 rounded hover:bg-white/5 transition-colors">
                        <Pause size={15} />
                      </button>
                      <button className="p-1.5 text-[#8899aa] hover:text-red-400 rounded hover:bg-white/5 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Create Election Modal */}
      {showModal && (
        <Modal title="Create New Election" onClose={() => setShowModal(false)}>
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <Input label="Election Title" placeholder="e.g. Student Council President 2026" />

            <div>
              <label className="block text-xs text-[#556677] uppercase tracking-wide mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe the purpose of this election..."
                className="bg-[#0a0f1a] border border-[#1a2a3a] rounded-lg px-4 py-3 text-white placeholder-[#556677] focus:border-[#00d4c8] focus:outline-none w-full resize-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Start Date & Time" type="datetime-local" />
              <Input label="End Date & Time" type="datetime-local" />
            </div>

            {/* Candidates */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-[#556677] uppercase tracking-wide font-medium">
                  Candidates
                </label>
                <button
                  type="button"
                  onClick={addCandidate}
                  className="flex items-center gap-1 text-[#00d4c8] text-xs hover:underline"
                >
                  <Plus size={13} /> Add Candidate
                </button>
              </div>
              <div className="space-y-3">
                {candidates.map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={`Candidate ${idx + 1} name`}
                        className="bg-[#0a0f1a] border border-[#1a2a3a] rounded-lg px-3 py-2.5 text-white placeholder-[#556677] focus:border-[#00d4c8] focus:outline-none text-sm w-full transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Short description"
                        className="bg-[#0a0f1a] border border-[#1a2a3a] rounded-lg px-3 py-2.5 text-white placeholder-[#556677] focus:border-[#00d4c8] focus:outline-none text-sm w-full transition-colors"
                      />
                    </div>
                    {candidates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCandidate(idx)}
                        className="p-1.5 text-[#556677] hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" fullWidth>
                Create Election
              </Button>
              <Button type="button" variant="outline" fullWidth onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManageElectionsPage;
