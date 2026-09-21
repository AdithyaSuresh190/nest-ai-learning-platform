import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-soft border border-gray-100 p-5 ${hover ? 'card-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${className}`}>
      {children}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max = 100, className = '', color = 'bg-nest-blue-400', showLabel = false }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-semibold text-gray-600 mt-1 block">{pct}%</span>
      )}
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  icon?: ReactNode;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  icon,
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary: 'bg-nest-blue-400 hover:bg-nest-blue-500 text-white shadow-soft',
    secondary: 'bg-nest-lavender-300 hover:bg-nest-lavender-400 text-white shadow-soft',
    success: 'bg-nest-green-400 hover:bg-nest-green-500 text-white shadow-soft',
    warning: 'bg-nest-peach-400 hover:bg-nest-peach-500 text-white shadow-soft',
    outline: 'border-2 border-nest-blue-300 text-nest-blue-700 hover:bg-nest-blue-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-press inline-flex items-center justify-center gap-2 rounded-xl font-semibold ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

interface ModalProps {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}

export function Modal({ children, open, onClose, title, className = '' }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-3xl shadow-card max-w-2xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
        {title && (
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className = '', label }: SpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="w-10 h-10 border-4 border-nest-blue-200 border-t-nest-blue-400 rounded-full animate-spin" />
      {label && <p className="text-gray-500 font-medium">{label}</p>}
    </div>
  );
}

interface EmptyStateProps {
  emoji: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ emoji, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-6xl mb-4 animate-float">{emoji}</div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">{title}</h3>
      {description && <p className="text-gray-500 max-w-md mb-4">{description}</p>}
      {action}
    </div>
  );
}
