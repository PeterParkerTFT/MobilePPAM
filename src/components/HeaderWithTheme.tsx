import React from 'react';
import { Menu, FileText, AlertCircle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { NotificationButton } from './NotificationButton';
import { useThemeColors } from '../hooks/useThemeColors';
import { User } from '../types';
import { UserRole } from '../types/enums';

interface HeaderWithThemeProps {
  title: string;
  showMenu: boolean;
  onMenuToggle: () => void;
  user: User;
  onLogout: () => void;
  onNavigateToInformes?: () => void; // Nueva prop opcional
  onNavigateToPendientes?: () => void;
}

export function HeaderWithTheme({ title, showMenu, onMenuToggle, user, onLogout, onNavigateToInformes, onNavigateToPendientes }: HeaderWithThemeProps) {
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
            <NotificationButton />
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
              className="px-3 py-3 border-b border-gray-100 dark:border-gray-800"
            >
              <div className="font-semibold text-base">{user.nombre}</div>
              <div
                className="text-xs uppercase tracking-wider font-medium mt-0.5 opacity-70"
              >
                {user.role}
              </div>
            </div>
            {/* Opción "Pendientes" para Admins */}
            {(user.role === UserRole.AdminGlobal || user.role === UserRole.AdminLocal) && onNavigateToPendientes && (
              <button
                onClick={() => {
                  onNavigateToPendientes();
                  onMenuToggle();
                }}
                className="w-full text-left px-3 py-2 hover:opacity-80 rounded text-sm transition-opacity flex items-center gap-2 mt-1"
                style={{ color: `rgb(${colors.interactive.primary})` }}
              >
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="flex-1">Solicitudes Pendientes</span>
                {/* Badge could go here */}
              </button>
            )}

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
                {user.role === UserRole.Voluntario ? '📄 Mis Informes' :
                  user.role === UserRole.Capitan ? '📄 Informes de Mi Grupo' :
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