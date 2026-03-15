import { Box } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-bv-bg border-t border-bv-border py-8 px-8">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-bv-accent rounded flex items-center justify-center">
            <Box size={13} className="text-bv-bg" />
          </div>
          <span className="text-bv-ink font-semibold text-sm tracking-wide">BLOCKVOTE</span>
        </Link>
        <p className="text-bv-ink-muted text-xs">
          &copy; 2026 Blockvote. Secure blockchain-based voting.
        </p>
        <div className="flex items-center gap-6 text-xs text-bv-ink-secondary">
          <a href="#" className="hover:text-bv-ink transition-colors">Privacy</a>
          <a href="#" className="hover:text-bv-ink transition-colors">Terms</a>
          <a href="#" className="hover:text-bv-ink transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
