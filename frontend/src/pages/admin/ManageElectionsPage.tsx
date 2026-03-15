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

  const handleDeleteElection = async (id: string, title: string) => {
    if (!window.confirm(`Delete election "${title}"? This cannot be undone.`)) return;
    try {
      await electionsApi.delete(id);
      setElections((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-bv-bg flex">
      <Sidebar variant="admin" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-bv-ink">Manage Elections</h1>
            <p className="text-bv-ink-secondary text-sm mt-1">Create, edit, and monitor all elections</p>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Create Election
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-6 bg-bv-surface border border-bv-border rounded-xl p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tab.key ? 'bg-bv-accent text-bv-bg' : 'text-bv-ink-secondary hover:text-bv-ink'
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
          <div className="text-center py-16 text-bv-ink-muted">Loading elections...</div>
        ) : (
          <div className="bg-bv-surface border border-bv-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-bv-border">
                  {['Title', 'Status', 'Start Date', 'End Date', 'Candidates', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs text-bv-ink-muted uppercase tracking-wide font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bv-border">
                {filtered.map((el) => (
                  <tr key={el.id} className="hover:bg-bv-surface-hover/50 transition-colors">
                    <td className="px-5 py-4 text-bv-ink text-sm font-medium">{el.title}</td>
                    <td className="px-5 py-4"><Badge variant={statusToVariant(el.status)} /></td>
                    <td className="px-5 py-4 text-bv-ink-secondary text-sm">{formatDate(el.startDate)}</td>
                    <td className="px-5 py-4 text-bv-ink-secondary text-sm">{formatDate(el.endDate)}</td>
                    <td className="px-5 py-4 text-bv-ink-secondary text-sm">{el.candidateCount}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/elections/${el.id}`} className="p-1.5 text-bv-ink-secondary hover:text-bv-ink rounded hover:bg-bv-surface-hover transition-colors">
                          <Eye size={15} />
                        </Link>
                        <button className="p-1.5 text-bv-ink-secondary hover:text-bv-accent rounded hover:bg-bv-surface-hover transition-colors">
                          <Edit size={15} />
                        </button>
                        <button className="p-1.5 text-bv-ink-secondary hover:text-yellow-400 rounded hover:bg-bv-surface-hover transition-colors">
                          <Pause size={15} />
                        </button>
                        <button
                          className="p-1.5 text-bv-ink-secondary hover:text-red-400 rounded hover:bg-bv-surface-hover transition-colors"
                          onClick={() => handleDeleteElection(el.id, el.title)}
                        >
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
              <label className="block text-xs text-bv-ink-muted uppercase tracking-wide mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe the purpose of this election..."
                className="bg-bv-bg border border-bv-border rounded-lg px-4 py-3 text-bv-ink placeholder-bv-ink-muted focus:border-bv-accent focus:outline-none w-full resize-none transition-colors"
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
