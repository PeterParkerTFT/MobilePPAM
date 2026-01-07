import React from 'react';
import { Calendar, Hand, Users, Settings, UserCheck } from 'lucide-react';
import { UserRole } from '../types';
import { useThemeColors } from '../hooks/useThemeColors';

interface BottomNavProps {
  activeTab: 'turnos' | 'mis-turnos' | 'voluntarios' | 'aprobaciones' | 'ajustes' | 'informes';
  onTabChange: (tab: 'turnos' | 'mis-turnos' | 'voluntarios' | 'aprobaciones' | 'ajustes' | 'informes') => void;
  userRole: UserRole;
}

export function BottomNav({ activeTab, onTabChange, userRole }: BottomNavProps) {
  const colors = useThemeColors();
  
  const tabs = [
    {
      id: 'turnos' as const,
      label: 'Turnos',
      icon: Calendar,
      allowedRoles: ['admin', 'capitan', 'voluntario', 'ultraadmin']
    },
    {
      id: 'mis-turnos' as const,
      label: 'Mis Turnos',
      icon: Hand,
      allowedRoles: ['admin', 'capitan', 'voluntario', 'ultraadmin']
    },
    {
      id: 'voluntarios' as const,
      label: 'Voluntarios',
      icon: Users,
      allowedRoles: ['admin', 'capitan', 'ultraadmin']
    },
    {
      id: 'aprobaciones' as const,
      label: 'Aprobaciones',
      icon: UserCheck,
      allowedRoles: ['admin', 'ultraadmin']
    },
    {
      id: 'ajustes' as const,
      label: 'Ajustes',
      icon: Settings,
      allowedRoles: ['admin', 'ultraadmin']
    }
  ];

  const visibleTabs = tabs.filter(tab => tab.allowedRoles.includes(userRole));

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 border-t z-40 theme-transition"
      style={{ 
        backgroundColor: `rgb(${colors.bg.header})`,
        borderColor: `rgb(${colors.ui.divider})`,
        boxShadow: '0 -1px 3px rgba(0,0,0,0.05)'
      }}
    >
      <div className="max-w-[428px] mx-auto px-2 pb-6 pt-2">
        <div className="flex justify-around items-center">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center gap-1 py-2 px-3 min-w-[70px] transition-all hover:opacity-80"
              >
                <Icon 
                  className="w-6 h-6"
                  style={{ 
                    color: isActive 
                      ? `rgb(${colors.interactive.primary})` 
                      : `rgb(${colors.text.tertiary})`,
                    strokeWidth: isActive ? 2.5 : 2
                  }}
                />
                <span 
                  className="text-xs"
                  style={{ 
                    color: isActive 
                      ? `rgb(${colors.interactive.primary})` 
                      : `rgb(${colors.text.secondary})`,
                    fontWeight: isActive ? '600' : '400'
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* iPhone-style home indicator */}
        <div className="flex justify-center mt-2">
          <div 
            className="w-32 h-1 rounded-full"
            style={{ 
              backgroundColor: `rgb(${colors.ui.disabled})` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}