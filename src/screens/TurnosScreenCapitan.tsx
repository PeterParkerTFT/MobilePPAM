import React, { useState } from 'react';
import { User, Turno, Capitan } from '../types/models';
import { UserStatus } from '../types/enums';
import { HeaderWithTheme } from '../components/HeaderWithTheme';
import { useThemeColors } from '../hooks/useThemeColors';
import { EventBadge } from '../components/EventBadge';
import { TurnoCard } from '../components/TurnoCard'; // [NEW] Shared Component
import { TurnoDetailModal } from '../components/TurnoDetailModal';
import { Clock, MapPin, Users, Calendar, Search, CheckCircle } from 'lucide-react';

interface TurnosScreenCapitanProps {
  user: User;
  onLogout: () => void;
  turnos: Turno[];
  capitanes: Capitan[];
  onInscripcion: (turnoId: string, userId: string) => void;
  onNavigateToInformes?: () => void; // Nueva prop
  onNavigateToPendientes?: () => void;
}

type TabType = 'mis-eventos' | 'disponibles';

export function TurnosScreenCapitan({
  user,
  onLogout,
  turnos,
  capitanes,
  onInscripcion,
  onNavigateToInformes,
  onNavigateToPendientes
}: TurnosScreenCapitanProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('mis-eventos');
  const colors = useThemeColors();

  // Filtrar solo los turnos donde este capitán está asignado
  const misTurnosComoCapitan = turnos.filter(t =>
    t.capitanId === user.id ||
    capitanes.find(c => c.id === user.id && c.turnosAsignados.includes(t.id))
  );

  // Turnos que necesitan capitán (disponibles para postularse)
  const turnosDisponiblesParaCapitan = turnos.filter(t =>
    !t.capitanId // Use existence check instead of missing property
  );

  // Agrupar por fecha
  const turnosPorFecha = misTurnosComoCapitan.reduce((acc, turno) => {
    if (!acc[turno.fecha]) {
      acc[turno.fecha] = [];
    }
    acc[turno.fecha].push(turno);
    return acc;
  }, {} as Record<string, Turno[]>);

  const fechasOrdenadas = Object.keys(turnosPorFecha).sort();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
  };

  const getCupoColor = (turno: Turno) => {
    if (turno.estado === 'completo') return '#10b981';
    if (turno.estado === 'limitado') return '#f59e0b';
    return '#ef4444';
  };

  const totalVoluntariosInscritos = misTurnosComoCapitan.reduce(
    (sum, t) => sum + t.cupoActual,
    0
  );
  const totalCupo = misTurnosComoCapitan.reduce(
    (sum, t) => sum + (t.cupoMaximo || t.voluntariosMax || 0),
    0
  );

  const handlePostularseComoCapitan = (turnoId: string) => {
    // Aquí iría la lógica para postularse como capitán
    console.log('Postulándose al turno:', turnoId);
    alert('Solicitud enviada al administrador para aprobación');
  };

  return (
    <div
      className="min-h-screen pb-24 theme-transition"
      style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
    >
      {/* Header */}
      <HeaderWithTheme
        title="Gestión de Capitán"
        showMenu={showMenu}
        onMenuToggle={() => setShowMenu(!showMenu)}
        user={user}
        onLogout={onLogout}
        onNavigateToInformes={onNavigateToInformes}
        onNavigateToPendientes={onNavigateToPendientes}
      />

      <div className="px-4 py-4">
        {/* Estadísticas del Capitán */}
        <div
          className="rounded-xl p-4 mb-4 shadow-md theme-transition"
          style={{
            backgroundColor: `rgb(${colors.bg.secondary})`,
            border: `1px solid rgb(${colors.ui.border})`
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-semibold"
              style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
            >
              {user.nombre.charAt(0)}
            </div>
            <div>
              <h2
                className="font-semibold"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                {user.nombre}
              </h2>
              <p
                className="text-xs flex items-center gap-1"
                style={{ color: `rgb(${colors.text.secondary})` }}
              >
                {user.status === UserStatus.Aprobado ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Capitán Aprobado
                  </>
                ) : user.status === UserStatus.Pendiente ? (
                  <>
                    <Clock className="w-3 h-3 text-orange-500" />
                    Pendiente de Aprobación
                  </>
                ) : (
                  'Capitán PPAM'
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center">
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: `rgb(${colors.interactive.primary})` }}
              >
                {misTurnosComoCapitan.length}
              </div>
              <div
                className="text-xs"
                style={{ color: `rgb(${colors.text.secondary})` }}
              >
                Eventos
              </div>
            </div>

            <div className="text-center">
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: `rgb(${colors.interactive.primary})` }}
              >
                {totalVoluntariosInscritos}
              </div>
              <div
                className="text-xs"
                style={{ color: `rgb(${colors.text.secondary})` }}
              >
                Inscritos
              </div>
            </div>

            <div className="text-center">
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: `rgb(${colors.interactive.primary})` }}
              >
                {totalCupo - totalVoluntariosInscritos}
              </div>
              <div
                className="text-xs"
                style={{ color: `rgb(${colors.text.secondary})` }}
              >
                Disponibles
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Mis Eventos vs Disponibles */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('mis-eventos')}
            className="flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all"
            style={{
              backgroundColor: activeTab === 'mis-eventos'
                ? `rgb(${colors.interactive.primary})`
                : `rgb(${colors.bg.tertiary})`,
              color: activeTab === 'mis-eventos'
                ? '#ffffff'
                : `rgb(${colors.text.primary})`,
              border: activeTab === 'mis-eventos'
                ? `2px solid rgb(${colors.interactive.primary})`
                : `1px solid rgb(${colors.ui.border})`
            }}
          >
            Mis Eventos ({misTurnosComoCapitan.length})
          </button>

          <button
            onClick={() => setActiveTab('disponibles')}
            className="flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: activeTab === 'disponibles'
                ? `rgb(${colors.interactive.primary})`
                : `rgb(${colors.bg.tertiary})`,
              color: activeTab === 'disponibles'
                ? '#ffffff'
                : `rgb(${colors.text.primary})`,
              border: activeTab === 'disponibles'
                ? `2px solid rgb(${colors.interactive.primary})`
                : `1px solid rgb(${colors.ui.border})`
            }}
          >
            <Search className="w-4 h-4" />
            Disponibles ({turnosDisponiblesParaCapitan.length})
          </button>
        </div>

        {/* PESTAÑA: MIS EVENTOS */}
        {activeTab === 'mis-eventos' && (
          <>
            {fechasOrdenadas.length > 0 ? (
              <div className="space-y-6">
                {fechasOrdenadas.map(fecha => (
                  <div key={fecha}>
                    {/* Header de Fecha */}
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar
                        className="w-5 h-5"
                        style={{ color: `rgb(${colors.interactive.primary})` }}
                      />
                      <h3
                        className="font-semibold text-lg"
                        style={{ color: `rgb(${colors.text.primary})` }}
                      >
                        {formatDate(fecha)}
                      </h3>
                    </div>

                    {/* Tarjetas de Turnos */}
                    <div className="space-y-3">
                      {turnosPorFecha[fecha].map(turno => (
                        <div
                          key={turno.id}
                          onClick={() => setSelectedTurno(turno)}
                          className="rounded-xl p-4 cursor-pointer hover:opacity-90 transition-all shadow-md theme-transition"
                          style={{
                            backgroundColor: `rgb(${colors.bg.secondary})`,
                            border: `1px solid rgb(${colors.ui.border})`
                          }}
                        >
                          {/* Header con tipo y horario */}
                          <div className="flex items-start justify-between mb-3">
                            <EventBadge tipo={turno.tipo || 'evento'} variant="default" />
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <Clock
                                  className="w-4 h-4"
                                  style={{ color: `rgb(${colors.text.tertiary})` }}
                                />
                                <span
                                  className="text-sm font-medium"
                                  style={{ color: `rgb(${colors.text.primary})` }}
                                >
                                  {turno.horaInicio} - {turno.horaFin}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Ubicación */}
                          <div className="flex items-start gap-2 mb-3">
                            <MapPin
                              className="w-4 h-4 flex-shrink-0 mt-0.5"
                              style={{ color: `rgb(${colors.text.tertiary})` }}
                            />
                            <span
                              className="text-sm"
                              style={{ color: `rgb(${colors.text.secondary})` }}
                            >
                              {turno.ubicacion}
                            </span>
                          </div>

                          {/* Cupo con barra de progreso */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Users
                                  className="w-4 h-4"
                                  style={{ color: getCupoColor(turno) }}
                                />
                                <span
                                  className="text-sm font-semibold"
                                  style={{ color: `rgb(${colors.text.primary})` }}
                                >
                                  {turno.cupoActual}/{turno.cupoMaximo || turno.voluntariosMax || 0} voluntarios
                                </span>
                              </div>

                              <span
                                className="text-xs font-semibold px-2 py-1 rounded-full"
                                style={{
                                  backgroundColor: `${getCupoColor(turno)}20`,
                                  color: getCupoColor(turno)
                                }}
                              >
                                {turno.estado === 'completo' ? '✓ COMPLETO' :
                                  turno.estado === 'limitado' ? '⚠ LIMITADO' : '⚡ NECESITA'}
                              </span>
                            </div>

                            {/* Barra de progreso */}
                            <div
                              className="w-full h-2 rounded-full overflow-hidden"
                              style={{ backgroundColor: `rgb(${colors.bg.tertiary})` }}
                            >
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${(turno.cupoActual / (turno.cupoMaximo || turno.voluntariosMax || 1)) * 100}%`,
                                  backgroundColor: getCupoColor(turno)
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-3">📋</div>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  No tienes eventos asignados
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: `rgb(${colors.text.secondary})` }}
                >
                  Explora los turnos disponibles para postularte como capitán
                </p>
                <button
                  onClick={() => setActiveTab('disponibles')}
                  className="px-6 py-2.5 rounded-lg font-medium text-white text-sm"
                  style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
                >
                  Ver Disponibles
                </button>
              </div>
            )}
          </>
        )}

        {/* PESTAÑA: TURNOS DISPONIBLES */}
        {activeTab === 'disponibles' && (
          <>
            {user.status === UserStatus.Pendiente && (
              <div
                className="rounded-xl p-4 mb-4 flex items-start gap-3 theme-transition"
                style={{
                  backgroundColor: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)'
                }}
              >
                <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-600 mb-1">
                    Cuenta Pendiente de Aprobación
                  </p>
                  <p className="text-sm text-orange-700">
                    Un administrador debe aprobar tu cuenta antes de que puedas postularte a turnos.
                  </p>
                </div>
              </div>
            )}

            {turnosDisponiblesParaCapitan.length > 0 ? (
              <div className="space-y-6">
                {/* Group by Date Logic Inline or Pre-calc */}
                {(() => {
                  const groupedDisponibles = turnosDisponiblesParaCapitan.reduce((acc, turno) => {
                    if (!acc[turno.fecha]) acc[turno.fecha] = [];
                    acc[turno.fecha].push(turno);
                    return acc;
                  }, {} as Record<string, Turno[]>);
                  const sortedDatesCap = Object.keys(groupedDisponibles).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

                  return sortedDatesCap.map(fecha => (
                    <div key={fecha}>
                      <h3 className="font-medium mb-3 pl-1" style={{ color: `rgb(${colors.text.primary})` }}>
                        {formatDate(fecha)}
                      </h3>
                      <div className="space-y-3">
                        {groupedDisponibles[fecha].map(turno => (
                          <TurnoCard
                            key={turno.id}
                            turno={turno}
                            userRole={user.role}
                            onClick={() => setSelectedTurno(turno)}
                            showDateTitle={false}
                            isCaptainAssigned={false}
                          />
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-3">✅</div>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: `rgb(${colors.text.primary})` }}
                >
                  No hay turnos disponibles
                </h3>
                <p
                  className="text-sm"
                  style={{ color: `rgb(${colors.text.secondary})` }}
                >
                  Todos los turnos tienen capitanes asignados
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Detalle */}
      {selectedTurno && (
        <TurnoDetailModal
          turno={selectedTurno}
          user={user}
          onClose={() => setSelectedTurno(null)}
          onInscribirse={() => {
            if (user) {
              onInscripcion(selectedTurno.id, user.id);
              setSelectedTurno(null);
            }
          }}
        />
      )}
    </div>
  );
}