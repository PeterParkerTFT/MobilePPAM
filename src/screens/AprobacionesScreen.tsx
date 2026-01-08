import React, { useState, useEffect } from 'react';
import { User, PendingUser } from '../types/models';
import { UserRole } from '../types/enums';
import { HeaderWithTheme } from '../components/HeaderWithTheme';
import { useThemeColors } from '../hooks/useThemeColors';
import { UserCheck, X, Check, Clock, AlertCircle, Building2, Loader2, RefreshCw } from 'lucide-react';
import { getCongregacionNombre } from '../data/congregaciones';
import { useUser } from '../contexts/UserContext';

interface AprobacionesScreenProps {
  user: User;
  onLogout: () => void;
  onNavigateToInformes?: () => void;
}

export function AprobacionesScreen({ user, onLogout, onNavigateToInformes }: AprobacionesScreenProps) {
  const { userService } = useUser();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [solicitudes, setSolicitudes] = useState<PendingUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const colors = useThemeColors();

  // Load pending users on mount
  useEffect(() => {
    loadSolicitudes();
  }, [user]);

  const loadSolicitudes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.fetchPendingUsers(user);
      setSolicitudes(data);
    } catch (err) {
      console.error('Error loading pending users:', err);
      setError('No se pudieron cargar las solicitudes. Por favor intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Solo admin y ultraadmin pueden ver esta pantalla
  if (user.role !== UserRole.AdminLocal && user.role !== UserRole.AdminGlobal) {
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

  const handleAprobar = async (id: string) => {
    if (isProcessing) return;
    setIsProcessing(id);
    try {
      const result = await userService.approveUser(id, user);
      if (result.success) {
        // Remove from list
        setSolicitudes(prev => prev.filter(s => s.id !== id));
        // Optional: Show success toast
      } else {
        alert('Error al aprobar: ' + result.error);
      }
    } catch (err) {
      console.error('Error approving user:', err);
      alert('Ocurrió un error inesperado al aprobar');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRechazar = async (id: string) => {
    if (!window.confirm('¿Está seguro de rechazar esta solicitud?')) return;

    if (isProcessing) return;
    setIsProcessing(id);
    try {
      const result = await userService.rejectUser(id, user, 'Rechazado por administrador');
      if (result.success) {
        // Remove from list
        setSolicitudes(prev => prev.filter(s => s.id !== id));
      } else {
        alert('Error al rechazar: ' + result.error);
      }
    } catch (err) {
      console.error('Error rejecting user:', err);
      alert('Ocurrió un error inesperado al rechazar');
    } finally {
      setIsProcessing(null);
    }
  };

  const formatFecha = (dateStr: string) => {
    if (!dateStr) return 'Fecha desc.';
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
              backgroundColor: user.role === UserRole.AdminGlobal
                ? 'rgba(220, 38, 38, 0.15)'
                : 'rgba(107, 87, 184, 0.15)',
              color: user.role === UserRole.AdminGlobal ? '#dc2626' : `rgb(${colors.interactive.primary})`
            }}
          >
            {user.role === UserRole.AdminGlobal ? (
              <>
                <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />
                Ultra Admin - Todas las Congregaciones
              </>
            ) : (
              <>
                <Building2 className="w-3.5 h-3.5" strokeWidth={2} />
                {getCongregacionNombre(user.congregacion || '')}
              </>
            )}
          </div>

          <button
            onClick={loadSolicitudes}
            disabled={isLoading}
            className="p-1.5 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-[#594396]" />
            <p className="text-sm text-gray-500">Cargando solicitudes...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && solicitudes.length === 0 && (
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


        {/* SOLICITUDES LIST */}
        {!isLoading && !error && solicitudes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-orange-500" />
              <h3
                className="font-semibold text-lg"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                Pendientes de Aprobación ({solicitudes.length})
              </h3>
            </div>

            <div className="space-y-3">
              {solicitudes.map((solicitud) => (
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
                    <Building2 className="w-3.5 h-3.5" strokeWidth={2} />
                    <span className="font-semibold" style={{ color: `rgb(${colors.interactive.primary})` }}>
                      {getCongregacionNombre(solicitud.congregacion)}
                    </span>
                  </div>

                  {/* Especialidad (if existed in PendingUser, currently likely mapped but maybe undefined) */}
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
                      disabled={isProcessing === solicitud.id}
                      className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 border disabled:opacity-50"
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: '#ef4444',
                        color: '#ef4444'
                      }}
                    >
                      {isProcessing === solicitud.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleAprobar(solicitud.id)}
                      disabled={isProcessing === solicitud.id}
                      className="flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 text-white disabled:opacity-50"
                      style={{ backgroundColor: '#10b981' }}
                    >
                      {isProcessing === solicitud.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Aprobar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}