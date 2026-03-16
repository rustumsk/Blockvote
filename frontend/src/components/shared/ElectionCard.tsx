import { useEffect, useState } from 'react';
import { Calendar, Users, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

type ElectionStatus = 'active' | 'upcoming' | 'closed';

interface ElectionCardProps {
  id: string;
  title: string;
  description: string;
  status: ElectionStatus;
  startDate: string;
  endDate: string;
  candidateCount: number;
  hasVoted?: boolean;
  role?: 'voter' | 'admin' | 'public';
}

function formatShort(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCountdown(msDiff: number) {
  if (msDiff <= 0) return '0s';
  const totalSeconds = Math.floor(msDiff / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

const ElectionCard: React.FC<ElectionCardProps> = ({
  id,
  title,
  description,
  status,
  startDate,
  endDate,
  candidateCount,
  hasVoted = false,
  role = 'voter',
}) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const startTs = new Date(startDate).getTime();
  const endTs = new Date(endDate).getTime();
  const isUpcoming = status === 'upcoming';
  const isActive = status === 'active';
  const voterDetailHref = `/voter/elections/${id}`;
  const publicDetailHref = `/elections/${id}`;

  let countdownLabel: string | null = null;
  if (isUpcoming) {
    countdownLabel = `${formatCountdown(startTs - now)} until start`;
  } else if (isActive) {
    countdownLabel = `${formatCountdown(endTs - now)} left`;
  }

  return (
    <div className="group bg-bv-surface border border-bv-border rounded-2xl p-5 hover:border-bv-accent/25 transition-all duration-200 flex flex-col gap-3.5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-bv-ink font-semibold text-[15px] leading-snug group-hover:text-bv-accent transition-colors">
          {title}
        </h3>
        <Badge variant={status} />
      </div>

      <p className="text-bv-ink-secondary text-[13px] leading-relaxed line-clamp-2">{description}</p>

      {countdownLabel && (
        <div className="flex items-center gap-2 text-bv-accent text-xs font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-bv-accent animate-pulse" />
          {countdownLabel}
        </div>
      )}

      <div className="flex items-center gap-5 text-bv-ink-muted text-xs">
        <span className="flex items-center gap-1.5">
          <Calendar size={13} />
          {formatShort(startDate)} — {formatShort(endDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={13} />
          {candidateCount}
        </span>
      </div>

      <div className="mt-auto pt-1.5 border-t border-bv-border">
        {role === 'admin' ? (
          <Link to={`/admin/elections/${id}`} className="block">
            <Button variant="ghost" size="sm" fullWidth>
              Manage
            </Button>
          </Link>
        ) : role === 'public' ? (
          <Link to={publicDetailHref} className="block">
            <Button variant="ghost" size="sm" fullWidth>
              View Details
            </Button>
          </Link>
        ) : hasVoted ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium py-1.5">
            <CheckCircle size={15} />
            <span>Voted</span>
          </div>
        ) : status === 'active' ? (
          <Link to={`/voter/elections/${id}/vote`} className="block">
            <Button variant="primary" size="sm" fullWidth>
              Vote Now
            </Button>
          </Link>
        ) : (
          <Link to={voterDetailHref} className="block">
            <Button variant="ghost" size="sm" fullWidth>
              View Details
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ElectionCard;
