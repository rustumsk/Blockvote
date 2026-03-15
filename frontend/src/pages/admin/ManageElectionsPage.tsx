import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Pause, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { electionsApi, type ElectionListItem } from '../../api/client';

type FilterTab = 'all' | 'ACTIVE' | 'UPCOMING' | 'CLOSED';

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'CLOSED', label: 'Closed' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusToVariant(s: string): 'active' | 'upcoming' | 'closed' {
  const lower = s.toLowerCase();
  if (lower === 'active') return 'active';
  if (lower === 'upcoming' || lower === 'paused') return 'upcoming';
  return 'closed';
}

const ManageElectionsPage = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showModal, setShowModal] = useState(false);
  const [elections, setElections] = useState<ElectionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');

  useEffect(() => {
    const status = activeTab === 'all' ? undefined : activeTab;
    setLoading(true);
    setError(null);
    electionsApi
      .getList({ status })
      .then(setElections)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const filtered = elections.filter((e) => activeTab === 'all' || e.status === activeTab);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim() || !formStart || !formEnd) {
      setCreateError('Please fill all fields.');
      return;
    }
    const start = new Date(formStart);
    const end = new Date(formEnd);
    if (end <= start) {
      setCreateError('End date must be after start date.');
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      await electionsApi.create({
        title: formTitle.trim(),
        description: formDescription.trim(),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      setShowModal(false);
      setFormTitle('');
      setFormDescription('');
      setFormStart('');
      setFormEnd('');
      const list = await electionsApi.getList();
      setElections(list);
    } catch (err) {
      setCreateError((err as Error).message);
    } finally {
      setCreateLoading(false);
    }
  };

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

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-[#556677]">Loading elections...</div>
        ) : (
          <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a2a3a]">
                  {['Title', 'Status', 'Start Date', 'End Date', 'Candidates', 'Actions'].map((h) => (
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
                    <td className="px-5 py-4"><Badge variant={statusToVariant(el.status)} /></td>
                    <td className="px-5 py-4 text-[#8899aa] text-sm">{formatDate(el.startDate)}</td>
                    <td className="px-5 py-4 text-[#8899aa] text-sm">{formatDate(el.endDate)}</td>
                    <td className="px-5 py-4 text-[#8899aa] text-sm">{el.candidateCount}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/elections/${el.id}`} className="p-1.5 text-[#8899aa] hover:text-white rounded hover:bg-white/5 transition-colors">
                          <Eye size={15} />
                        </Link>
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
        )}
      </main>

      {/* Create Election Modal */}
      {showModal && (
        <Modal title="Create New Election" onClose={() => setShowModal(false)}>
          <form className="space-y-5" onSubmit={handleCreateSubmit}>
            <Input
              label="Election Title"
              placeholder="e.g. Student Council President 2026"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />

            <div>
              <label className="block text-xs text-[#556677] uppercase tracking-wide mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe the purpose of this election..."
                className="bg-[#0a0f1a] border border-[#1a2a3a] rounded-lg px-4 py-3 text-white placeholder-[#556677] focus:border-[#00d4c8] focus:outline-none w-full resize-none transition-colors"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date & Time"
                type="datetime-local"
                value={formStart}
                onChange={(e) => setFormStart(e.target.value)}
              />
              <Input
                label="End Date & Time"
                type="datetime-local"
                value={formEnd}
                onChange={(e) => setFormEnd(e.target.value)}
              />
            </div>

            {createError && (
              <p className="text-red-400 text-sm">{createError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" fullWidth disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create Election'}
              </Button>
              <Button type="button" variant="outline" fullWidth onClick={() => setShowModal(false)} disabled={createLoading}>
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
