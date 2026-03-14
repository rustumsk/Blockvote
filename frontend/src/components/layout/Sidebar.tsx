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

const COLLAPSED_WIDTH = '3rem';
const EXPANDED_WIDTH = '16rem';

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
  { icon: ScrollText, label: 'Blockchain Logs', path: '/admin/logs' },
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
      transition: 'opacity 0.2s ease-out, width 0.2s ease-out',
      transitionDelay: isExpanded ? delay : '0s',
      whiteSpace: 'nowrap' as const,
    });

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col bg-[#0f1929] border-r border-[#1a2a3a] z-40 overflow-hidden"
      style={{
        width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isExpanded ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className="flex-shrink-0 p-4 border-b border-[#1a2a3a]">
        <Link to="/" className="flex items-center gap-3 min-w-0 text-white no-underline">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
            <Box size={20} className="text-[#0a0f1a]" />
          </div>
          <div className="min-w-0 overflow-hidden">
            <div
              className="font-bold text-base tracking-wide overflow-hidden transition-all duration-200 ease-out"
              style={labelStyle('0.08s', '7.5rem')}
            >
              BLOCKVOTE
            </div>
            {variant === 'admin' && (
              <div
                className="text-[#556677] text-xs mt-0.5 overflow-hidden transition-all duration-200 ease-out"
                style={labelStyle('0.1s', '5.5rem')}
              >
                Admin Panel
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 min-w-0 ${
                isActive
                  ? 'text-[#00d4c8] bg-[#00d4c8]/10 border-l-2 border-[#00d4c8]'
                  : 'text-[#8899aa] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span
                className="overflow-hidden transition-all duration-200 ease-out"
                style={labelStyle('0.1s')}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom — user & wallet */}
      <div className="p-3 border-t border-[#1a2a3a] space-y-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#00d4c8]/20 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-[#00d4c8]" />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <div
              className="text-white text-sm font-medium truncate overflow-hidden transition-all duration-200 ease-out"
              style={labelStyle('0.12s', '8rem')}
            >
              {user?.name ?? 'Guest'}
            </div>
            {variant === 'admin' ? (
              <span className="mt-0.5 block overflow-hidden transition-all duration-200 ease-out" style={labelStyle('0.14s', '3.5rem')}>
                <Badge variant="admin">ADMIN</Badge>
              </span>
            ) : (
              <div
                className="text-[#556677] text-xs font-mono truncate overflow-hidden transition-all duration-200 ease-out"
                style={labelStyle('0.14s', '5.5rem')}
              >
                {walletShort ?? 'No wallet linked'}
              </div>
            )}
          </div>
        </div>
        <div
          className="overflow-hidden transition-all duration-200 ease-out"
          style={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? '100%' : 0, transitionDelay: isExpanded ? '0.14s' : '0s' }}
        >
          <ConnectWalletButton variant="outline" size="sm" fullWidth showIcon={true} />
        </div>
        <button
          type="button"
          className="flex items-center gap-3 w-full text-left text-[#8899aa] hover:text-red-400 text-sm font-medium py-2 rounded-lg hover:bg-white/5 -mx-1 px-3 transition-colors"
          onClick={() => {
            logout();
            navigate('/');
          }}
        >
          <LogOut size={16} className="flex-shrink-0" />
          <span
            className="overflow-hidden transition-all duration-200 ease-out"
            style={labelStyle('0.16s', '3.5rem')}
          >
            Log out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
