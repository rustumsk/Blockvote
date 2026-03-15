import { useState, useEffect } from 'react';
import { ArrowLeft, Users, BarChart2, Plus } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { electionsApi, candidatesApi, resultsApi, type ElectionDetail, type Candidate } from '../../api/client';

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

const ElectionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [addName, setAddName] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    candidates: { contractCandidateId: number; name: string; voteCount: number }[];
    winner: { contractCandidateId: number; name: string; voteCount: number } | null;
    totalVotes: number;
  } | null>(null);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    electionsApi
      .getById(id)
      .then(setElection)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !election) return;

    let cancelled = false;
    let interval: number | undefined;

    const fetchResults = async () => {
      try {
        setResultsLoading(true);
        setResultsError(null);
        const data = await resultsApi.getElectionResults(id);
        if (!cancelled) setResults(data);
      } catch (e) {
        if (!cancelled) setResultsError((e as Error).message);
      } finally {
        if (!cancelled) setResultsLoading(false);
      }
    };

    // Always load once
    fetchResults();

    // Poll while ACTIVE
    if (election.status === 'ACTIVE') {
      interval = window.setInterval(fetchResults, 5000);
    }

    return () => {
      cancelled = true;
      if (interval) window.clearInterval(interval);
    };
  }, [id, election]);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !addName.trim()) return;
    setAddLoading(true);
    setAddError(null);
    try {
      const created = await candidatesApi.create(id, {
        name: addName.trim(),
        description: addDescription.trim() || undefined,
      });
      setElection((prev) =>
        prev ? { ...prev, candidates: [...prev.candidates, created] } : null
      );
      setShowAddCandidate(false);
      setAddName('');
      setAddDescription('');
    } catch (err) {
      setAddError((err as Error).message);
    } finally {
      setAddLoading(false);
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-bv-bg flex">
        <Sidebar variant="admin" />
        <main className="ml-12 flex-1 p-8">
          <p className="text-bv-ink-secondary">Invalid election ID.</p>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bv-bg flex">
        <Sidebar variant="admin" />
        <main className="ml-12 flex-1 p-8">
          <p className="text-bv-ink-muted">Loading election...</p>
        </main>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-bv-bg flex">
        <Sidebar variant="admin" />
        <main className="ml-12 flex-1 p-8">
          <p className="text-red-400">{error || 'Election not found.'}</p>
          <Link to="/admin/elections" className="text-bv-accent hover:underline mt-2 inline-block">
            Back to elections
          </Link>
        </main>
      </div>
    );
  }

  const isUpcoming = election.status === 'UPCOMING';
  const totalVotes = results?.totalVotes ?? 0;

  return (
    <div className="min-h-screen bg-bv-bg flex">
      <Sidebar variant="admin" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/admin/elections"
            className="flex items-center gap-1.5 text-bv-ink-secondary hover:text-bv-ink transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <div className="h-4 w-px bg-bv-border" />
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-bv-ink">{election.title}</h1>
            <Badge variant={statusToVariant(election.status)} />
          </div>
        </div>

        <p className="text-bv-ink-secondary text-sm mb-6 max-w-2xl">{election.description}</p>
        <div className="flex items-center gap-4 text-bv-ink-muted text-sm mb-8">
          <span>Start: {formatDate(election.startDate)}</span>
          <span>End: {formatDate(election.endDate)}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Users, label: 'Candidates', value: String(election.candidates?.length ?? 0) },
            { icon: BarChart2, label: 'Total Votes Cast', value: String(totalVotes) },
            { icon: Users, label: 'Status', value: election.status },
          ].map((card) => (
            <div key={card.label} className="bg-bv-surface border border-bv-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <card.icon size={16} className="text-bv-accent" />
                <span className="text-bv-ink-muted text-xs uppercase tracking-wide">{card.label}</span>
              </div>
              <div className="text-2xl font-bold text-bv-ink">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-bv-ink">Candidates</h2>
          {isUpcoming && (
            <Button variant="primary" size="sm" onClick={() => setShowAddCandidate(true)}>
              <Plus size={16} />
              Add candidate
            </Button>
          )}
        </div>

        <div className="bg-bv-surface border border-bv-border rounded-xl p-6 mb-6">
          {!election.candidates?.length ? (
            <p className="text-bv-ink-muted">
              No candidates yet.{' '}
              {isUpcoming && 'Click "Add candidate" to add candidates before the election starts.'}
            </p>
          ) : (
            <div className="space-y-4">
              {election.candidates.map((c: Candidate, idx: number) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between py-2 border-b border-bv-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-bv-ink-muted text-xs w-4">{idx + 1}.</span>
                    <span className="text-bv-ink text-sm font-medium">{c.name}</span>
                    {c.description && (
                      <span className="text-bv-ink-secondary text-xs">— {c.description}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline">Edit Election</Button>
          <Button variant="danger">Pause Election</Button>
        </div>

        {/* Live Results */}
        <section className="mt-8">
          <h2 className="text-lg font-bold text-bv-ink mb-3">Live Results</h2>
          <div className="bg-bv-surface border border-bv-border rounded-xl p-6">
            {resultsLoading && !results && (
              <p className="text-bv-ink-muted text-sm">Loading results from the blockchain...</p>
            )}
            {resultsError && (
              <p className="text-red-400 text-sm">{resultsError}</p>
            )}
            {!resultsLoading && !resultsError && results && results.candidates.length === 0 && (
              <p className="text-bv-ink-muted text-sm">
                No votes have been recorded for this election yet.
              </p>
            )}
            {!resultsLoading && results && results.candidates.length > 0 && (
              <div className="space-y-4">
                {results.candidates.map((c) => {
                  const percent =
                    results.totalVotes > 0
                      ? Math.round((c.voteCount / results.totalVotes) * 100)
                      : 0;
                  return (
                    <div key={c.contractCandidateId}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-bv-ink text-sm font-medium">{c.name}</span>
                        </div>
                          <span className="text-bv-ink-secondary text-xs">
                            {c.voteCount} votes ({percent}%)
                          </span>
                      </div>
                      <div className="h-2 bg-bv-bg rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-bv-accent transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {results.winner && (
                  <p className="text-bv-accent text-sm mt-3">
                    Current winner: <strong>{results.winner.name}</strong> ({results.winner.voteCount}{' '}
                    votes)
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {showAddCandidate && (
        <Modal title="Add candidate" onClose={() => setShowAddCandidate(false)}>
          <form className="space-y-5" onSubmit={handleAddCandidate}>
            <Input
              label="Name"
              placeholder="Candidate name"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs text-bv-ink-muted uppercase tracking-wide mb-1.5">
                Description (optional)
              </label>
              <textarea
                rows={2}
                placeholder="Short description"
                className="bg-bv-surface border border-bv-border rounded-lg px-4 py-3 text-bv-ink placeholder-bv-ink-muted focus:border-bv-accent focus:outline-none w-full resize-none text-sm"
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
              />
            </div>
            {addError && <p className="text-red-400 text-sm">{addError}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" fullWidth disabled={addLoading}>
                {addLoading ? 'Adding...' : 'Add candidate'}
              </Button>
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setShowAddCandidate(false)}
                disabled={addLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ElectionDetailPage;
