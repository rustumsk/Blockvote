import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children, className = '' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={`bg-[#0f1929] border border-[#1a2a3a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto teal-glow ${className}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#1a2a3a]">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8899aa] hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
