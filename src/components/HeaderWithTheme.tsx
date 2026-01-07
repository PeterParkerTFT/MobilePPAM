import React from 'react';
import { Menu, FileText } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useThemeColors } from '../hooks/useThemeColors';
import { User } from '../types';

interface HeaderWithThemeProps {
  title: string;
  showMenu: boolean;
  onMenuToggle: () => void;
  user: User;
  onLogout: () => void;
  onNavigateToInformes?: () => void; // Nueva prop opcional
}

export function HeaderWithTheme({ title, showMenu, onMenuToggle, user, onLogout, onNavigateToInformes }: HeaderWithThemeProps) {
  const colors = useThemeColors();

  return (
    <>
      <div 
        className="px-4 pt-14 pb-4 relative theme-transition"
        style={{ 
          backgroundColor: `rgb(${colors.bg.header})`,
          borderBottom: `1px solid rgb(${colors.ui.divider})`
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={onMenuToggle}
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <Menu className="w-6 h-6" style={{ color: `rgb(${colors.text.primary})` }} />
          </button>
          <h1 
            className="text-lg font-bold"
            style={{ color: `rgb(${colors.text.primary})` }}
          >
            {title}
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="button" />
          </div>
        </div>

        {showMenu && (
          <div 
            className="absolute top-20 left-4 rounded-lg shadow-xl p-3 z-50 min-w-[220px] theme-transition"
            style={{ 
              backgroundColor: `rgb(${colors.bg.secondary})`,
              color: `rgb(${colors.text.primary})`,
              border: `1px solid rgb(${colors.ui.border})`
            }}
          >
            <div 
              className="px-3 py-2 border-b"
              style={{ borderColor: `rgb(${colors.ui.border})` }}
            >
              <div 
                className="text-xs"
                style={{ color: `rgb(${colors.text.tertiary})` }}
              >
                Usuario
              </div>
              <div className="font-medium text-sm">{user.nombre}</div>
              <div 
                className="text-xs capitalize mt-1"
                style={{ color: `rgb(${colors.text.accent})` }}
              >
                {user.role}
              </div>
            </div>
            {/* Opción "Mis Informes" para todos los roles */}
            {onNavigateToInformes && (
              <button
                onClick={() => {
                  onNavigateToInformes();
                  onMenuToggle(); // Cerrar menú después de navegar
                }}
                className="w-full text-left px-3 py-2 hover:opacity-80 rounded text-sm transition-opacity flex items-center gap-2 mt-1"
                style={{ color: `rgb(${colors.interactive.primary})` }}
              >
                <FileText className="w-4 h-4" />
                {user.role === 'voluntario' ? '📄 Mis Informes' : 
                 user.role === 'capitan' ? '📄 Informes de Mi Grupo' : 
                 '📄 Todos los Informes'}
              </button>
            )}
            <button
              onClick={onLogout}
              className="w-full text-left px-3 py-2 hover:opacity-80 rounded text-sm text-red-600 mt-1 transition-opacity"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </>
  );
}