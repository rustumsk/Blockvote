import { useState, useEffect } from 'react';
import { ArrowLeft, Users, BarChart2, Plus, ImagePlus, Trophy, Radio, CheckCircle2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import ResultsChart from '../../components/shared/ResultsChart';
import { getCandidatePhotoSrc } from '../../api/client';
import { electionsApi, candidatesApi, resultsApi, type ElectionDetail, type Candidate, type ElectionResults } from '../../api/client';
import { subscribeToElectionResults } from '../../lib/resultsSocket';
import { notifyError, notifySuccess } from '../../lib/toast';

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
  const [addCredentials, setAddCredentials] = useState('');
  const [addPhoto, setAddPhoto] = useState<File | null>(null);
  const [addPhotoPreview, setAddPhotoPreview] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [results, setResults] = useState<ElectionResults | null>(null);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [publishingResults, setPublishingResults] = useState(false);
  const [syncingContract, setSyncingContract] = useState(false);

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

    fetchResults();
    const unsubscribe = subscribeToElectionResults(id, (data) => {
      if (!cancelled) {
        setResults(data);
        setResultsError(null);
        setResultsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
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
        credentials: addCredentials.trim() || undefined,
        photo: addPhoto,
      });
      setElection((prev) =>
        prev ? { ...prev, candidates: [...prev.candidates, created] } : null
      );
      setShowAddCandidate(false);
      setAddName('');
      setAddDescription('');
      setAddCredentials('');
      setAddPhoto(null);
      if (addPhotoPreview) {
        URL.revokeObjectURL(addPhotoPreview);
        setAddPhotoPreview(null);
      }
    } catch (err) {
      setAddError((err as Error).message);
    } finally {
      setAddLoading(false);
    }
  };

  const handlePhotoChange = (file: File | null) => {
    if (addPhotoPreview) {
      URL.revokeObjectURL(addPhotoPreview);
    }

    setAddPhoto(file);
    setAddPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const closeAddCandidateModal = () => {
    if (addPhotoPreview) {
      URL.revokeObjectURL(addPhotoPreview);
    }
    setShowAddCandidate(false);
    setAddError(null);
    setAddName('');
    setAddDescription('');
    setAddCredentials('');
    setAddPhoto(null);
    setAddPhotoPreview(null);
  };

  const handlePublishResults = async () => {
    if (!id) return;
    setPublishingResults(true);
    try {
      const data = await resultsApi.publishElectionResults(id);
      setResults(data.results);
      setElection((prev) =>
        prev
          ? {
              ...prev,
              resultsPublished: true,
              resultsPublishedAt: data.results.publishedAt,
            }
          : prev
      );
      notifySuccess('Official election results published.');
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Failed to publish results');
    } finally {
      setPublishingResults(false);
    }
  };

  const handleSyncContractIds = async () => {
    if (!id) return;
    setSyncingContract(true);
    try {
      const result = await electionsApi.syncContractIds(id);
      const refreshed = await electionsApi.getById(id);
      setElection(refreshed);
      notifySuccess(`Sync complete: ${result.syncedCandidates} candidate IDs linked.`);
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Failed to sync contract IDs');
    } finally {
      setSyncingContract(false);
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-bv-bg flex">
        <Sidebar variant="admin" />
        <main className="ml-56 flex-1 p-8">
          <p className="text-bv-ink-secondary">Invalid election ID.</p>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bv-bg flex">
        <Sidebar variant="admin" />
        <main className="ml-56 flex-1 p-8">
          <p className="text-bv-ink-muted">Loading election...</p>
        </main>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-bv-bg flex">
        <Sidebar variant="admin" />
        <main className="ml-56 flex-1 p-8">
          <p className="text-red-400">{error || 'Election not found.'}</p>
          <Link to="/admin/elections" className="text-bv-accent hover:underline mt-2 inline-block">
            Back to elections
          </Link>
        </main>
      </div>
    );
  }

  const isUpcoming = election.status === 'UPCOMING';
  const isClosed = election.status === 'CLOSED';
  const canAddCandidates = isUpcoming;
  const totalVotes = results?.totalVotes ?? 0;
  const turnout = results?.statistics.turnoutPercentage ?? 0;
  const approvedVoters = results?.statistics.approvedVoterCount ?? 0;
  const isPublished = results?.published ?? election.resultsPublished ?? false;
  const publishedAt = results?.publishedAt ?? election.resultsPublishedAt ?? null;
  const winnerName = results?.winner?.name ?? 'No winner yet';
  const hasMinimumCandidates = (election.candidates?.length ?? 0) >= 2;
  const unsyncedCandidatesCount = election.candidates.filter((c) => c.contractCandidateId == null).length;
  const isElectionUnsynced = election.contractElectionId == null || unsyncedCandidatesCount > 0;
  const setupSteps = [
    { label: 'Election details created', done: true },
    { label: 'At least 2 candidates added', done: hasMinimumCandidates },
    { label: 'Election is scheduled (upcoming)', done: isUpcoming || election.status === 'ACTIVE' },
    { label: 'Ready to publish after close', done: isClosed },
  ];

  return (
    <div className="min-h-screen bg-bv-bg flex">
      <Sidebar variant="admin" />

      <main className="ml-56 flex-1 overflow-y-auto px-10 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/admin/elections"
            className="flex items-center gap-1.5 text-bv-ink-secondary hover:text-bv-ink transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <div className="h-4 w-px bg-white/15" />
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-bv-ink">{election.title}</h1>
            <Badge variant={statusToVariant(election.status)} />
          </div>
        </div>

        <p className="mb-6 max-w-2xl text-sm text-bv-ink-secondary">{election.description}</p>
        <div className="flex items-center gap-4 text-bv-ink-muted text-sm mb-8">
          <span>Start: {formatDate(election.startDate)}</span>
          <span>End: {formatDate(election.endDate)}</span>
        </div>

        {isElectionUnsynced && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-sm text-bv-ink-secondary">
              This election is not fully synced to contract IDs yet.
              {election.contractElectionId == null ? ' Election ID missing.' : ''}{' '}
              {unsyncedCandidatesCount > 0 ? `${unsyncedCandidatesCount} candidate ID(s) missing.` : ''}
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={handleSyncContractIds} loading={syncingContract}>
                {syncingContract ? 'Syncing...' : 'Re-sync Contract IDs'}
              </Button>
            </div>
          </div>
        )}

        <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-bv-ink-muted">Setup Progress</p>
              <h2 className="mt-1 text-base font-semibold text-bv-ink">Election readiness checklist</h2>
            </div>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-bv-ink-secondary">
              {setupSteps.filter((step) => step.done).length}/{setupSteps.length} complete
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {setupSteps.map((step) => (
              <div key={step.label} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <CheckCircle2 size={15} className={step.done ? 'text-white' : 'text-bv-ink-muted'} />
                <span className={step.done ? 'text-sm text-bv-ink' : 'text-sm text-bv-ink-secondary'}>{step.label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Candidates', value: String(election.candidates?.length ?? 0) },
            { icon: BarChart2, label: 'Total Votes Cast', value: String(totalVotes) },
            { icon: Users, label: 'Approved Voters', value: String(approvedVoters) },
            { icon: Trophy, label: 'Turnout', value: `${turnout}%` },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 mb-3">
                <card.icon size={16} className="text-bv-ink-secondary" />
                <span className="text-bv-ink-muted text-xs uppercase tracking-wide">{card.label}</span>
              </div>
              <div className="text-2xl font-semibold text-bv-ink">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-bv-ink">Candidates</h2>
          {canAddCandidates && (
            <Button variant="primary" size="sm" onClick={() => setShowAddCandidate(true)}>
              <Plus size={16} />
              Add candidate
            </Button>
          )}
        </div>

        {!canAddCandidates && (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-bv-ink-secondary">
            Candidate editing is locked once the election is no longer upcoming.
          </div>
        )}

        <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.02] p-6">
          {!election.candidates?.length ? (
            <p className="text-bv-ink-muted">
              No candidates yet. {canAddCandidates && 'Click "Add candidate" to complete setup before voting opens.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {election.candidates.map((c: Candidate, idx: number) => (
                <div
                  key={c.id}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-4 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                      {c.photoUrl ? (
                        <img
                          src={getCandidatePhotoSrc(c) ?? undefined}
                          alt={c.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Users size={24} className="text-bv-ink-muted" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-bv-ink">
                          {idx + 1}
                        </span>
                        <span className="text-bv-ink text-sm font-semibold">{c.name}</span>
                      </div>
                      {c.credentials && (
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-bv-ink-secondary">
                          {c.credentials}
                        </p>
                      )}
                      {c.description && (
                        <p className="mt-2 text-bv-ink-secondary text-sm leading-relaxed">
                          {c.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" disabled>
            Edit Election (coming soon)
          </Button>
          <Button variant="outline" disabled>
            Pause Election (coming soon)
          </Button>
          {isClosed && !isPublished && (
            <Button variant="primary" onClick={handlePublishResults} loading={publishingResults}>
              {publishingResults ? 'Publishing...' : 'Publish Official Results'}
            </Button>
          )}
        </div>

        {/* Live Results */}
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-bv-ink">Live Results</h2>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-bv-ink-secondary">
              <Radio size={12} />
              Live tally stays visible
            </span>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
            <ResultsChart
              candidates={results?.candidates ?? []}
              winner={results?.winner ?? null}
              totalVotes={results?.totalVotes ?? 0}
              loading={resultsLoading}
              error={resultsError}
              emptyMessage="No votes have been recorded for this election yet."
            />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-bold text-bv-ink mb-3">Official Published Result</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
            {isPublished ? (
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-bv-ink-secondary">
                    Official winner
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-bv-ink">{winnerName}</p>
                  <p className="mt-2 text-sm text-bv-ink-secondary">
                    Published {publishedAt ? new Date(publishedAt).toLocaleString() : 'just now'}.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                  <p className="text-xs uppercase tracking-wide text-bv-ink-muted">Recorded votes</p>
                  <p className="mt-2 text-xl font-semibold text-bv-ink">{totalVotes}</p>
                </div>
              </div>
            ) : isClosed ? (
              <div>
                <p className="text-bv-ink text-sm font-medium">Results are ready for publication.</p>
                <p className="mt-2 text-sm text-bv-ink-secondary">
                  Voters can still monitor the live tally, but the official published result will only appear after you confirm it here.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-bv-ink text-sm font-medium">Official results are not available yet.</p>
                <p className="mt-2 text-sm text-bv-ink-secondary">
                  This election must close before an admin can publish the official result.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {showAddCandidate && (
        <Modal title="Add candidate" onClose={closeAddCandidateModal}>
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
            <div>
              <label className="block text-xs text-bv-ink-muted uppercase tracking-wide mb-1.5">
                Credentials
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Debate champion, blockchain researcher, council secretary"
                className="bg-bv-surface border border-bv-border rounded-lg px-4 py-3 text-bv-ink placeholder-bv-ink-muted focus:border-bv-accent focus:outline-none w-full resize-none text-sm"
                value={addCredentials}
                onChange={(e) => setAddCredentials(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-bv-ink-muted uppercase tracking-wide mb-1.5">
                Candidate Photo
              </label>
              <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-bv-border bg-bv-surface px-4 py-6 text-center hover:border-bv-accent/50 transition-colors">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
                />
                <div className="space-y-2">
                  {addPhotoPreview ? (
                    <img
                      src={addPhotoPreview}
                      alt="Candidate preview"
                      className="mx-auto h-28 w-28 rounded-2xl object-cover border border-bv-border"
                    />
                  ) : (
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-bv-bg border border-bv-border">
                      <ImagePlus size={22} className="text-bv-accent" />
                    </div>
                  )}
                  <div>
                    <p className="text-bv-ink text-sm font-medium">
                      {addPhoto ? addPhoto.name : 'Upload a candidate headshot'}
                    </p>
                    <p className="text-bv-ink-muted text-xs mt-1">
                      JPG, PNG, WEBP, or GIF up to 5MB
                    </p>
                  </div>
                </div>
              </label>
            </div>
            {addError && <p className="text-red-400 text-sm">{addError}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" fullWidth loading={addLoading}>
                {addLoading ? 'Adding...' : 'Add candidate'}
              </Button>
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={closeAddCandidateModal}
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
