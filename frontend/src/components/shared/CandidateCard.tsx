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
      className={`rounded-xl p-5 border transition-all duration-200 cursor-pointer ${
        selected
          ? 'border-[#00d4c8] bg-[#00d4c8]/5 shadow-[0_0_20px_rgba(0,212,200,0.1)]'
          : 'bg-[#0f1929] border-[#1a2a3a] hover:border-[#00d4c8]/40'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            selected ? 'bg-[#00d4c8]/20' : 'bg-white/5'
          }`}
        >
          <User size={22} className={selected ? 'text-[#00d4c8]' : 'text-[#8899aa]'} />
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-bold text-base">{name}</h4>
            {/* Radio indicator */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected ? 'border-[#00d4c8] bg-[#00d4c8]' : 'border-[#1a2a3a]'
              }`}
            >
              {selected && <div className="w-2 h-2 rounded-full bg-[#0a0f1a]" />}
            </div>
          </div>
          <p className="text-[#8899aa] text-sm mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
