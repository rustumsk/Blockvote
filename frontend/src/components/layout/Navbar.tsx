import { Link } from 'react-router-dom';
import { Box } from 'lucide-react';
import Button from '../ui/Button';
import ConnectWalletButton from '../wallet/ConnectWalletButton';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#0a0f1a]/80 backdrop-blur-md border-b border-[#1a2a3a]">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
          <Box size={18} className="text-[#0a0f1a]" />
        </div>
        <span className="text-white font-bold text-lg tracking-wide">BLOCKVOTE</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-6">
        <a
          href="#how-it-works"
          className="text-[#8899aa] hover:text-white transition-colors text-sm font-medium"
        >
          How it works
        </a>
        <Link
          to="/elections"
          className="text-[#8899aa] hover:text-white transition-colors text-sm font-medium"
        >
          Elections
        </Link>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <ConnectWalletButton variant="outline" size="sm" showIcon />
        <Link to="/register">
          <Button variant="primary" size="sm">
            Register
          </Button>
        </Link>
        <Link to="/login">
          <Button variant="outline" size="sm">
            Log in
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
