import { Box } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0f1929] border-t border-[#1a2a3a] py-10 px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
            <Box size={16} className="text-[#0a0f1a]" />
          </div>
          <span className="text-white font-bold text-base tracking-wide">BLOCKVOTE</span>
        </Link>
        <p className="text-[#556677] text-sm">
          © 2026 Blockvote. Secure blockchain-based voting.
        </p>
        <div className="flex items-center gap-6 text-sm text-[#8899aa]">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
