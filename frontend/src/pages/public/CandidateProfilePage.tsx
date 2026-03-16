import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, User, Users, LogIn } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import {
  electionsApi,
  getCandidatePhotoSrc,
  type Candidate,
  type ElectionDetail,
} from '../../api/client';
import { useAuth } from '../../context/AuthContext';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const CandidateProfilePage = () => {
  const { user, token } = useAuth();
  const { electionId, candidateId } = useParams<{ electionId: string; candidateId: string }>();
  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImage, setShowImage] = useState(true);

  useEffect(() => {
    if (!electionId || !candidateId) return;

    setLoading(true);
    setError(null);

    electionsApi
      .getById(electionId)
      .then((data) => {
        const matchedCandidate = data.candidates.find((item) => item.id === candidateId) ?? null;
        setElection(data);
        setCandidate(matchedCandidate);
        setShowImage(Boolean(matchedCandidate?.photoUrl));
        if (!matchedCandidate) {
          setError('Candidate not found in this election.');
        }
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [candidateId, electionId]);

  const electionLink =
    token && user
      ? user.role === 'ADMIN'
        ? `/admin/elections/${election?.id ?? ''}`
        : `/voter/elections/${election?.id ?? ''}`
      : '/elections';

  return (
    <div className="min-h-screen bg-bv-bg text-bv-ink">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-24">
        <Link
          to={electionId ? `/elections` : '/'}
          className="inline-flex items-center gap-2 text-sm text-bv-ink-secondary transition-colors hover:text-bv-ink"
        >
          <ArrowLeft size={16} />
          Back to elections
        </Link>

        {loading && <p className="mt-8 text-bv-ink-muted">Loading candidate...</p>}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {!loading && election && candidate && (
          <section className="mt-8 overflow-hidden rounded-[28px] border border-bv-border bg-bv-surface">
            <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
              <div className="border-b border-bv-border p-6 lg:border-b-0 lg:border-r">
                <div className="overflow-hidden rounded-[24px] border border-bv-border bg-bv-bg">
                  {showImage && getCandidatePhotoSrc(candidate) ? (
                    <img
                      src={getCandidatePhotoSrc(candidate) ?? undefined}
                      alt={candidate.name}
                      className="h-[360px] w-full object-cover"
                      onError={() => setShowImage(false)}
                    />
                  ) : (
                    <div className="flex h-[360px] items-center justify-center bg-bv-bg-deep">
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-bv-border bg-bv-surface">
                        <User size={40} className="text-bv-ink-muted" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 lg:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-bv-accent">
                  Candidate Profile
                </p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-bv-ink">
                  {candidate.name}
                </h1>
                {candidate.credentials && (
                  <p className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-bv-accent">
                    {candidate.credentials}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3 text-sm text-bv-ink-secondary">
                  <span className="inline-flex items-center gap-2 rounded-full border border-bv-border bg-bv-bg px-4 py-2">
                    <Calendar size={15} className="text-bv-accent" />
                    {formatDate(election.startDate)} to {formatDate(election.endDate)}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-bv-border bg-bv-bg px-4 py-2">
                    <Users size={15} className="text-bv-accent" />
                    {election.title}
                  </span>
                </div>

                <div className="mt-8 rounded-[24px] border border-bv-border bg-bv-bg p-6">
                  <h2 className="text-lg font-bold text-bv-ink">About this candidate</h2>
                  <p className="mt-3 text-sm leading-7 text-bv-ink-secondary">
                    {candidate.description || 'No candidate description was provided yet.'}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {token && user ? (
                    <Link
                      to={electionLink}
                      className="inline-flex items-center justify-center rounded-xl bg-bv-accent px-5 py-3 text-sm font-semibold text-bv-bg transition-colors hover:bg-bv-accent-hover"
                    >
                      Open Election
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-bv-accent px-5 py-3 text-sm font-semibold text-bv-bg transition-colors hover:bg-bv-accent-hover"
                    >
                      <LogIn size={15} />
                      Log In To Vote
                    </Link>
                  )}
                  <Link
                    to="/elections"
                    className="inline-flex items-center justify-center rounded-xl border border-bv-border bg-bv-bg px-5 py-3 text-sm font-semibold text-bv-ink-secondary transition-colors hover:text-bv-ink hover:border-bv-accent/35"
                  >
                    View All Elections
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default CandidateProfilePage;
