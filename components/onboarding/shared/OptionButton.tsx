import React from 'react';

interface OptionButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  children: React.ReactNode;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  onClick,
  variant = 'primary',
  disabled = false,
  children
}) => {
  const baseClasses = 'rounded-full px-4 py-2 text-sm font-medium shadow-md transition-all';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#E5E0FF] to-[#F4E4FF] text-slate-800 hover:-translate-y-0.5 hover:from-[#D4CEFF] hover:to-[#E8D4FF]',
    secondary: 'bg-white/90 border-2 border-[#C7B9FF] text-slate-800 hover:bg-white',
    ghost: 'bg-transparent border-2 border-gray-300 text-gray-600 hover:border-gray-400'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

