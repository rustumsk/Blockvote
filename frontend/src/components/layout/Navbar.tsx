import { Link } from 'react-router-dom';
import { Box, Search, LayoutDashboard, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const dashboardHref = user?.role === 'ADMIN' ? '/admin/dashboard' : '/voter/dashboard';
  const isAuthenticated = Boolean(token && user);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3.5 bg-bv-bg/80 backdrop-blur-xl border-b border-bv-border">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-bv-accent rounded-lg flex items-center justify-center">
          <Box size={16} className="text-bv-bg" />
        </div>
        <span className="text-bv-ink font-bold text-base tracking-wide">BLOCKVOTE</span>
      </Link>

      <div className="flex items-center gap-8">
        <a
          href="#how-it-works"
          className="text-bv-ink-secondary hover:text-bv-ink transition-colors text-sm"
        >
          How it works
        </a>
        <Link
          to="/elections"
          className="text-bv-ink-secondary hover:text-bv-ink transition-colors text-sm"
        >
          Elections
        </Link>
        <Link
          to="/published-elections"
          className="text-bv-ink-secondary hover:text-bv-ink transition-colors text-sm"
        >
          Published Results
        </Link>
        <Link
          to="/verify"
          className="inline-flex items-center gap-1.5 text-bv-ink-secondary hover:text-bv-ink transition-colors text-sm"
        >
          <Search size={14} />
          Verify
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link to={dashboardHref}>
              <Button variant="outline" size="sm">
                <LayoutDashboard size={14} />
                Dashboard
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut size={14} />
              Log out
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Register
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
