import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, error, icon, rightElement, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs text-bv-ink-muted uppercase tracking-wider mb-1.5 font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bv-ink-muted">
            {icon}
          </div>
        )}
        <input
          className={`bg-bv-bg border border-bv-border rounded-xl px-4 py-3 text-bv-ink placeholder-bv-ink-muted text-sm focus:border-bv-accent focus:ring-1 focus:ring-bv-accent/30 focus:outline-none w-full transition-all duration-150 ${icon ? 'pl-10' : ''} ${rightElement ? 'pr-12' : ''} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
