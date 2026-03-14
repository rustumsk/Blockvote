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
  role?: 'voter' | 'admin';
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
  return (
    <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl p-6 hover:border-[#00d4c8]/30 transition-all duration-200 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-white font-bold text-base leading-snug">{title}</h3>
        <Badge variant={status} />
      </div>

      {/* Description */}
      <p className="text-[#8899aa] text-sm leading-relaxed line-clamp-2">{description}</p>

      {/* Meta */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[#556677] text-xs">
          <Calendar size={14} />
          <span>{startDate} — {endDate}</span>
        </div>
        <div className="flex items-center gap-2 text-[#556677] text-xs">
          <Users size={14} />
          <span>{candidateCount} Candidates</span>
        </div>
      </div>

      {/* Action */}
      <div className="mt-auto pt-2">
        {role === 'admin' ? (
          <Button variant="outline" size="sm" fullWidth>
            Manage
          </Button>
        ) : hasVoted ? (
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
            <CheckCircle size={16} />
            <span>Voted ✓</span>
          </div>
        ) : status === 'active' ? (
          <Link to={`/voter/elections/${id}/vote`} className="block">
            <Button variant="primary" size="sm" fullWidth>
              Vote Now
            </Button>
          </Link>
        ) : (
          <Link to={`/voter/elections`} className="block">
            <Button variant="outline" size="sm" fullWidth>
              View Election
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ElectionCard;
