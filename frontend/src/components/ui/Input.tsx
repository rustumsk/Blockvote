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
        <label className="block text-xs text-[#556677] uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#556677]">
            {icon}
          </div>
        )}
        <input
          className={`bg-[#0f1929] border border-[#1a2a3a] rounded-lg px-4 py-3 text-white placeholder-[#556677] focus:border-[#00d4c8] focus:outline-none w-full transition-colors duration-200 ${icon ? 'pl-10' : ''} ${rightElement ? 'pr-12' : ''} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default Input;
