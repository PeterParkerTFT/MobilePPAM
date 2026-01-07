import React, { useState } from 'react';
import { User } from '../types/models';
import { HeaderWithTheme } from '../components/HeaderWithTheme';
import { useThemeColors } from '../hooks/useThemeColors';
import { UserCheck, X, Check, Clock, AlertCircle, Church } from 'lucide-react';
import { getCongregacionNombre } from '../data/congregaciones';

interface AprobacionesScreenProps {
  user: User;
  onLogout: () => void;
  onNavigateToInformes?: () => void; // Nueva prop
}

interface SolicitudCapitan {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  fechaSolicitud: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  especialidad?: string;
  congregacion: string; // ID de la congregación
}

export function AprobacionesScreen({ user, onLogout, onNavigateToInformes }: AprobacionesScreenProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [solicitudes, setSolicitudes] = useState<SolicitudCapitan[]>([
    {
      id: 'sol1',
      nombre: 'Pedro Ramírez González',
      email: 'pedro.ramirez@ejemplo.com',
      telefono: '+52 555 111 2222',
      fechaSolicitud: '2025-01-03',
      status: 'pendiente',
      especialidad: 'Guías',
      congregacion: 'cong-001' // Villa Guerrero
    },
    {
      id: 'sol2',
      nombre: 'María Fernández Torres',
      email: 'maria.fernandez@ejemplo.com',
      telefono: '+52 555 222 3333',
      fechaSolicitud: '2025-01-02',
      status: 'pendiente',
      especialidad: 'Expositores',
      congregacion: 'cong-002' // Lomas de Polanco
    },
    {
      id: 'sol3',
      nombre: 'Carlos López Martínez',
      email: 'carlos.lopez@ejemplo.com',
      telefono: '+52 555 333 4444',
      fechaSolicitud: '2025-01-01',
      status: 'aprobado',
      especialidad: 'Escuelas',
      congregacion: 'cong-001' // Villa Guerrero
    },
    {
      id: 'sol4',
      nombre: 'Ana García Pérez',
      email: 'ana.garcia@ejemplo.com',
      telefono: '+52 555 444 5555',
      fechaSolicitud: '2025-01-04',
      status: 'pendiente',
      especialidad: 'Editoriales',
      congregacion: 'cong-004' // La Calma
    }
  ]);

  const colors = useThemeColors();

  // Solo admin y ultraadmin pueden ver esta pantalla
  if (user.role !== 'admin' && user.role !== 'ultraadmin') {
    return (
      <div 
        className="min-h-screen pb-24 flex items-center justify-center p-4 theme-transition"
        style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="mb-2" style={{ color: `rgb(${colors.text.primary})` }}>Acceso Restringido</h2>
          <p style={{ color: `rgb(${colors.text.secondary})` }}>
            Solo administradores pueden acceder a esta sección
          </p>
        </div>
      </div>
    );
  }

  // Filtrar solicitudes según el tipo de admin
  const solicitudesFiltradas = user.role === 'ultraadmin' 
    ? solicitudes // Ultra admin ve todas las solicitudes
    : solicitudes.filter(s => s.congregacion === user.congregacion); // Admin normal solo ve de su congregación

  const handleAprobar = (id: string) => {
    setSolicitudes(prev => prev.map(s => 
      s.id === id ? { ...s, status: 'aprobado' as const } : s
    ));
  };

  const handleRechazar = (id: string) => {
    setSolicitudes(prev => prev.map(s => 
      s.id === id ? { ...s, status: 'rechazado' as const } : s
    ));
  };

  const solicitudesPendientes = solicitudesFiltradas.filter(s => s.status === 'pendiente');
  const solicitudesAprobadas = solicitudesFiltradas.filter(s => s.status === 'aprobado');
  const solicitudesRechazadas = solicitudesFiltradas.filter(s => s.status === 'rechazado');

  const formatFecha = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  };

  return (
    <div 
      className="min-h-screen pb-24 theme-transition"
      style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
    >
      {/* Header */}
      <HeaderWithTheme
        title="Aprobaciones"
        showMenu={showMenu}
        onMenuToggle={() => setShowMenu(!showMenu)}
        user={user}
        onLogout={onLogout}
        onNavigateToInformes={onNavigateToInformes}
      />

      <div className="px-4 py-4">
        {/* Badge de tipo de Admin */}
        <div className="mb-4 flex items-center justify-between">
          <div 
            className="px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5"
            style={{ 
              backgroundColor: user.role === 'ultraadmin' 
                ? 'rgba(220, 38, 38, 0.15)' 
                : 'rgba(107, 87, 184, 0.15)',
              color: user.role === 'ultraadmin' ? '#dc2626' : `rgb(${colors.interactive.primary})`
            }}
          >
            {user.role === 'ultraadmin' ? (
              <>
                <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
                Ultra Admin - Todas las Congregaciones
              </>
            ) : (
              <>
                <Church className="w-3.5 h-3.5" strokeWidth={2} />
                {getCongregacionNombre(user.congregacion || '')}
              </>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div 
          className="rounded-xl p-4 mb-6 shadow-md theme-transition"
          style={{ 
            backgroundColor: `rgb(${colors.bg.secondary})`,
            border: `1px solid rgb(${colors.ui.border})`
          }}
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: '#f59e0b' }}
              >
                {solicitudesPendientes.length}
              </div>
              <div 
                className="text-xs"
                style={{ color: `rgb(${colors.text.secondary})` }}
              >
                Pendientes
              </div>
            </div>
            
            <div className="text-center">
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: '#10b981' }}
              >
                {solicitudesAprobadas.length}
              </div>
              <div 
                className="text-xs"
                style={{ color: `rgb(${colors.text.secondary})` }}
              >
                Aprobados
              </div>
            </div>
            
            <div className="text-center">
              <div 
                className="text-2xl font-bold mb-1"
                style={{ color: '#ef4444' }}
              >
                {solicitudesRechazadas.length}
              </div>
              <div 
                className="text-xs"
                style={{ color: `rgb(${colors.text.secondary})` }}
              >
                Rechazados
              </div>
            </div>
          </div>
        </div>

        {/* SOLICITUDES PENDIENTES */}
        {solicitudesPendientes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3 
                className="font-semibold text-lg"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                Pendientes de Aprobación ({solicitudesPendientes.length})
              </h3>
            </div>

            <div className="space-y-3">
              {solicitudesPendientes.map((solicitud) => (
                <div
                  key={solicitud.id}
                  className="rounded-xl p-4 shadow-md theme-transition"
                  style={{ 
                    backgroundColor: `rgb(${colors.bg.secondary})`,
                    border: '2px solid rgba(251, 191, 36, 0.3)'
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0"
                      style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
                    >
                      {solicitud.nombre.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="font-semibold mb-0.5"
                        style={{ color: `rgb(${colors.text.primary})` }}
                      >
                        {solicitud.nombre}
                      </div>
                      <div 
                        className="text-xs mb-1"
                        style={{ color: `rgb(${colors.text.secondary})` }}
                      >
                        {solicitud.email}
                      </div>
                      <div 
                        className="text-xs"
                        style={{ color: `rgb(${colors.text.tertiary})` }}
                      >
                        {solicitud.telefono}
                      </div>
                    </div>
                    <div className="text-right">
                      <span 
                        className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600 font-medium"
                      >
                        {formatFecha(solicitud.fechaSolicitud)}
                      </span>
                    </div>
                  </div>

                  {/* Congregación */}
                  <div 
                    className="text-xs mb-2 flex items-center gap-1.5"
                    style={{ color: `rgb(${colors.text.secondary})` }}
                  >
                    <Church className="w-3.5 h-3.5" strokeWidth={2} />
                    <span className="font-semibold" style={{ color: `rgb(${colors.interactive.primary})` }}>
                      {getCongregacionNombre(solicitud.congregacion)}
                    </span>
                  </div>

                  {/* Especialidad */}
                  {solicitud.especialidad && (
                    <div 
                      className="text-xs mb-3 flex items-center gap-1"
                      style={{ color: `rgb(${colors.text.secondary})` }}
                    >
                      <UserCheck className="w-3 h-3" />
                      Especialidad: <span className="font-semibold">{solicitud.especialidad}</span>
                    </div>
                  )}

                  {/* Botones de Acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRechazar(solicitud.id)}
                      className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 border"
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: '#ef4444',
                        color: '#ef4444'
                      }}
                    >
                      <X className="w-4 h-4" />
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleAprobar(solicitud.id)}
                      className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 text-white"
                      style={{ backgroundColor: '#10b981' }}
                    >
                      <Check className="w-4 h-4" />
                      Aprobar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SOLICITUDES APROBADAS */}
        {solicitudesAprobadas.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-5 h-5 text-green-500" />
              <h3 
                className="font-semibold text-lg"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                Aprobados ({solicitudesAprobadas.length})
              </h3>
            </div>

            <div className="space-y-2">
              {solicitudesAprobadas.map((solicitud) => (
                <div
                  key={solicitud.id}
                  className="rounded-lg p-3 theme-transition"
                  style={{ 
                    backgroundColor: `rgb(${colors.bg.secondary})`,
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div 
                        className="font-medium text-sm"
                        style={{ color: `rgb(${colors.text.primary})` }}
                      >
                        {solicitud.nombre}
                      </div>
                      <div 
                        className="text-xs"
                        style={{ color: `rgb(${colors.text.secondary})` }}
                      >
                        {solicitud.email}
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-medium">
                      Aprobado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SOLICITUDES RECHAZADAS */}
        {solicitudesRechazadas.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <X className="w-5 h-5 text-red-500" />
              <h3 
                className="font-semibold text-lg"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                Rechazados ({solicitudesRechazadas.length})
              </h3>
            </div>

            <div className="space-y-2">
              {solicitudesRechazadas.map((solicitud) => (
                <div
                  key={solicitud.id}
                  className="rounded-lg p-3 theme-transition"
                  style={{ 
                    backgroundColor: `rgb(${colors.bg.secondary})`,
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div 
                        className="font-medium text-sm"
                        style={{ color: `rgb(${colors.text.primary})` }}
                      >
                        {solicitud.nombre}
                      </div>
                      <div 
                        className="text-xs"
                        style={{ color: `rgb(${colors.text.secondary})` }}
                      >
                        {solicitud.email}
                      </div>
                    </div>
                    <span className="text-xs text-red-600 font-medium">
                      Rechazado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {solicitudesPendientes.length === 0 && solicitudesAprobadas.length === 0 && solicitudesRechazadas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-3">✅</div>
            <h3 
              className="font-semibold mb-2"
              style={{ color: `rgb(${colors.text.primary})` }}
            >
              No hay solicitudes
            </h3>
            <p 
              className="text-sm"
              style={{ color: `rgb(${colors.text.secondary})` }}
            >
              Todas las solicitudes de capitanes están procesadas
            </p>
          </div>
        )}
      </div>

      {/* Offline indicator */}
      <div 
        className="fixed bottom-24 left-4 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-2 shadow-lg"
        style={{ backgroundColor: 'rgb(51, 51, 51)' }}
      >
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        Offline
      </div>
    </div>
  );
}