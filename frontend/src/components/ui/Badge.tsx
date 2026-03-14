import React from 'react';

type BadgeVariant = 'active' | 'upcoming' | 'closed' | 'pending' | 'approved' | 'rejected' | 'admin';

interface BadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  active: 'bg-green-500/20 text-green-400',
  upcoming: 'bg-yellow-500/20 text-yellow-400',
  closed: 'bg-gray-500/20 text-gray-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
  admin: 'bg-[#00d4c8]/20 text-[#00d4c8]',
};

const defaultLabels: Record<BadgeVariant, string> = {
  active: 'ACTIVE',
  upcoming: 'UPCOMING',
  closed: 'CLOSED',
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  admin: 'ADMIN',
};

const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${variantStyles[variant]} ${className}`}
    >
      {children ?? defaultLabels[variant]}
    </span>
  );
};

export default Badge;
