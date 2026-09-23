import { useState } from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = '••••',
  autoFocus = false,
  className = '',
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full px-3 py-3 pr-12 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        title={visible ? 'Masquer' : 'Afficher'}
        tabIndex={-1}
      >
        {visible ? '🙈' : '👁️'}
      </button>
    </div>
  );
}