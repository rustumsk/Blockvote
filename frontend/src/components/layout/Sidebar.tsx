import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  LayoutDashboard,
  Vote,
  Receipt,
  Search,
  User,
  Users,
  ScrollText,
  Settings,
  LogOut,
} from 'lucide-react';
import Badge from '../ui/Badge';
import ConnectWalletButton from '../wallet/ConnectWalletButton';
import { useAuth } from '../../context/AuthContext';

type SidebarVariant = 'voter' | 'admin';

interface SidebarProps {
  variant?: SidebarVariant;
}

const COLLAPSED_WIDTH = '3.5rem';
const EXPANDED_WIDTH = '15rem';

const voterNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/voter/dashboard' },
  { icon: Vote, label: 'Elections', path: '/voter/elections' },
  { icon: Receipt, label: 'My Votes', path: '/voter/receipt' },
  { icon: Search, label: 'Verify Vote', path: '/voter/verify' },
  { icon: User, label: 'Profile', path: '/voter/profile' },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Vote, label: 'Elections', path: '/admin/elections' },
  { icon: Users, label: 'Voters', path: '/admin/voters' },
  { icon: ScrollText, label: 'Logs', path: '/admin/logs' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ variant = 'voter' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const navItems = variant === 'admin' ? adminNavItems : voterNavItems;

  const walletShort = user?.walletAddress
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : null;

  const labelStyle = (delay: string, expandedWidth: string = '6rem') =>
    ({
      opacity: isExpanded ? 1 : 0,
      width: isExpanded ? expandedWidth : 0,
      overflow: 'hidden',
      transition: 'opacity 0.15s ease-out, width 0.15s ease-out',
      transitionDelay: isExpanded ? delay : '0s',
      whiteSpace: 'nowrap' as const,
    });

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col bg-bv-bg border-r border-bv-border z-40 overflow-hidden"
      style={{
        width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex-shrink-0 p-3 border-b border-bv-border">
        <Link to="/" className="flex items-center gap-2.5 min-w-0 text-bv-ink no-underline">
          <div className="w-8 h-8 rounded-lg bg-bv-accent flex items-center justify-center flex-shrink-0">
            <Box size={16} className="text-bv-bg" />
          </div>
          <div className="min-w-0 overflow-hidden">
            <div
              className="font-bold text-sm tracking-wide overflow-hidden transition-all duration-150 ease-out"
              style={labelStyle('0.06s', '7rem')}
            >
              BLOCKVOTE
            </div>
            {variant === 'admin' && (
              <div
                className="text-bv-ink-muted text-[10px] mt-0.5 overflow-hidden transition-all duration-150 ease-out"
                style={labelStyle('0.08s', '5rem')}
              >
                Admin Panel
              </div>
            )}
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 min-w-0 ${
                isActive
                  ? 'text-bv-accent bg-bv-accent-muted'
                  : 'text-bv-ink-secondary hover:text-bv-ink hover:bg-bv-surface'
              }`}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span
                className="overflow-hidden transition-all duration-150 ease-out"
                style={labelStyle('0.08s')}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2.5 border-t border-bv-border space-y-2">
        <div className="flex items-center gap-2.5 min-w-0 px-1">
          <div className="w-7 h-7 rounded-lg bg-bv-accent-muted flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-bv-accent" />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div
              className="text-bv-ink text-[13px] font-medium truncate overflow-hidden transition-all duration-150 ease-out"
              style={labelStyle('0.1s', '8rem')}
            >
              {user?.name ?? 'Guest'}
            </div>
            {variant === 'admin' ? (
              <span className="mt-0.5 block overflow-hidden transition-all duration-150 ease-out" style={labelStyle('0.12s', '3.5rem')}>
                <Badge variant="admin">Admin</Badge>
              </span>
            ) : (
              <div
                className="text-bv-ink-muted text-[10px] font-mono truncate overflow-hidden transition-all duration-150 ease-out"
                style={labelStyle('0.12s', '5.5rem')}
              >
                {walletShort ?? 'No wallet'}
              </div>
            )}
          </div>
        </div>
        <div
          className="overflow-hidden transition-all duration-150 ease-out"
          style={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? '100%' : 0, transitionDelay: isExpanded ? '0.12s' : '0s' }}
        >
          <ConnectWalletButton variant="outline" size="sm" fullWidth showIcon={true} />
        </div>
        <button
          type="button"
          className="flex items-center gap-2.5 w-full text-left text-bv-ink-muted hover:text-red-400 text-[13px] font-medium py-2 rounded-xl hover:bg-red-500/5 px-3 transition-colors"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          <LogOut size={15} className="flex-shrink-0" />
          <span
            className="overflow-hidden transition-all duration-150 ease-out"
            style={labelStyle('0.14s', '3.5rem')}
          >
            Log out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
