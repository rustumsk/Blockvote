import { useState } from 'react';
import { ArrowLeft, Clock, Users, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import CandidateCard from '../../components/shared/CandidateCard';
import Button from '../../components/ui/Button';

const MetaMaskIcon = () => (
  <svg width="18" height="18" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M36.2 3L21.9 13.4l2.7-6.3L36.2 3z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.8 3l14.2 10.5-2.6-6.4L3.8 3z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M30.9 28.4l-3.8 5.8 8.1 2.2 2.3-7.9-6.6-.1zM2.6 28.5l2.3 7.9 8.1-2.2-3.8-5.8-6.6.1z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.5 17.8l-2.3 3.4 8.1.4-.3-8.7-5.5 4.9zM27.5 17.8l-5.6-5-2.3 8.7 8.1-.4-2.2-3.3z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const candidates = [
  {
    id: 'c1',
    name: 'Marcus Chen',
    description: 'Experienced leader with 3 years on student council. Advocates for better campus facilities and mental health resources.',
  },
  {
    id: 'c2',
    name: 'Sofia Ramirez',
    description: 'Computer Science junior with a focus on digital transparency and student tech initiatives. Strong community engagement record.',
  },
  {
    id: 'c3',
    name: 'Ethan Brooks',
    description: 'Pre-law student passionate about student rights and transparent governance. Former debate team captain.',
  },
  {
    id: 'c4',
    name: 'Aisha Nwosu',
    description: 'Environmental science major focused on sustainability initiatives and inclusive campus policies.',
  },
];

const VotePage = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex">
      <Sidebar variant="voter" />

      <main className="ml-12 flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/voter/elections"
            className="flex items-center gap-1.5 text-[#8899aa] hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <div className="h-4 w-px bg-[#1a2a3a]" />
          <div>
            <h1 className="text-2xl font-bold text-white">Student Council President 2026</h1>
          </div>
        </div>

        {/* Election Info */}
        <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl p-6 mb-8">
          <p className="text-[#8899aa] text-sm mb-4 leading-relaxed">
            Vote for your preferred candidate for the student council presidency. This election determines the student council president for the 2026 academic year. Your vote is anonymous, secure, and permanently recorded on the blockchain.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[#8899aa] text-sm">
              <Clock size={15} className="text-[#00d4c8]" />
              <span>Closes in <strong className="text-white">5 days, 14 hours</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[#8899aa] text-sm">
              <Users size={15} className="text-[#00d4c8]" />
              <span><strong className="text-white">4</strong> Candidates</span>
            </div>
          </div>
        </div>

        {/* Select Candidate */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Select a Candidate</h2>
          <div className="grid grid-cols-2 gap-4">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                {...candidate}
                selected={selectedId === candidate.id}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </section>

        {/* Cast Vote */}
        <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl p-6">
          <div className="flex items-start gap-4 mb-5">
            <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-[#8899aa] text-sm leading-relaxed">
              <strong className="text-yellow-400">This action is irreversible.</strong> Your vote will be permanently recorded on the blockchain and cannot be changed or deleted.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="primary"
              size="lg"
              disabled={!selectedId}
              className={!selectedId ? 'opacity-40' : ''}
            >
              Cast Vote
            </Button>

            <div className="flex items-center gap-2 text-[#8899aa] text-sm">
              <MetaMaskIcon />
              <span>Your wallet will be prompted to sign this transaction.</span>
            </div>
          </div>

          {selectedId && (
            <p className="mt-3 text-[#00d4c8] text-sm">
              Selected: <strong>{candidates.find((c) => c.id === selectedId)?.name}</strong>
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default VotePage;
