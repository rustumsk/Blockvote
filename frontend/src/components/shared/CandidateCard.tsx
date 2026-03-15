import { User } from 'lucide-react';

interface CandidateCardProps {
  id: string;
  name: string;
  description: string;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  id,
  name,
  description,
  selected = false,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect?.(id)}
      className={`rounded-2xl p-5 border transition-all duration-150 cursor-pointer ${
        selected
          ? 'border-bv-accent bg-bv-accent/5 ring-1 ring-bv-accent/20'
          : 'bg-bv-surface border-bv-border hover:border-bv-accent/30'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
            selected ? 'bg-bv-accent/15' : 'bg-bv-surface-hover'
          }`}
        >
          <User size={20} className={selected ? 'text-bv-accent' : 'text-bv-ink-muted'} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-bv-ink font-semibold text-[15px] truncate">{name}</h4>
            <div
              className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                selected ? 'border-bv-accent bg-bv-accent' : 'border-bv-border'
              }`}
            >
              {selected && <div className="w-2 h-2 rounded-full bg-bv-bg" />}
            </div>
          </div>
          <p className="text-bv-ink-secondary text-[13px] mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
