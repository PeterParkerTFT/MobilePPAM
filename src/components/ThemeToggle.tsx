import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeColors';

interface ThemeToggleProps {
  variant?: 'button' | 'switch';
}

export function ThemeToggle({ variant = 'switch' }: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();
  const colors = useThemeColors();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Theme toggle clicked! Current theme:', theme);
    toggleTheme();
    console.log('Toggle theme called');
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className="p-2 rounded-lg hover:opacity-70 transition-all"
        style={{
          backgroundColor: `rgba(${colors.interactive.primary}, 0.12)`,
          color: `rgb(${colors.interactive.primary})`,
        }}
        aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
        type="button"
      >
        {isDark ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Sun className="w-5 h-5" style={{ color: `rgb(${colors.text.secondary})` }} />
      <button
        onClick={handleClick}
        className="relative w-14 h-7 rounded-full transition-all"
        style={{
          backgroundColor: isDark ? `rgb(${colors.interactive.primary})` : `rgb(${colors.ui.disabled})`,
        }}
        aria-label={`Modo ${isDark ? 'oscuro' : 'claro'} activo. Click para cambiar`}
        type="button"
      >
        <div
          className="absolute top-1 w-5 h-5 rounded-full transition-transform shadow-md"
          style={{
            backgroundColor: `rgb(${colors.bg.secondary})`,
            transform: isDark ? 'translateX(28px)' : 'translateX(4px)',
          }}
        />
      </button>
      <Moon className="w-5 h-5" style={{ color: `rgb(${colors.text.secondary})` }} />
    </div>
  );
}