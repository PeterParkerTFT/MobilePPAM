import React, { useState } from 'react';
import { User, Turno } from '../types/models';
import { EventType } from '../types/enums';
import { HeaderWithTheme } from '../components/HeaderWithTheme';
import { useThemeColors } from '../hooks/useThemeColors';
import { EventBadge } from '../components/EventBadge';
import { TurnoDetailModal } from '../components/TurnoDetailModal'; // [RESTORED]
import { TurnoCard } from '../components/TurnoCard'; // [NEW]

interface TurnosScreenVoluntarioProps {
  user: User;
  onLogout: () => void;
  turnos: Turno[];
  onInscripcion: (turnoId: string, userId: string) => void;
  onNavigateToInformes?: () => void; // Nueva prop
  onNavigateToPendientes?: () => void;
}

export function TurnosScreenVoluntario({
  user,
  onLogout,
  turnos,
  onInscripcion,
  onNavigateToInformes,
  onNavigateToPendientes
}: TurnosScreenVoluntarioProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null); // [NEW] Filter state
  const colors = useThemeColors();

  // Filtrar solo los turnos disponibles (no pasados)
  const availableTurnos = turnos.filter(t => new Date(t.fecha) >= new Date());

  // Apply Category Filter if active
  const filteredTurnos = selectedCategoryFilter
    ? availableTurnos.filter(t => t.tipo === selectedCategoryFilter)
    : availableTurnos;

  // Group for Calendar View
  const groupedTurnosVariable = filteredTurnos.reduce((acc, turno) => {
    if (!acc[turno.fecha]) acc[turno.fecha] = [];
    acc[turno.fecha].push(turno);
    return acc;
  }, {} as Record<string, Turno[]>);

  const sortedDates = Object.keys(groupedTurnosVariable).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());


  // Turnos en los que estoy inscrito (Still good to know for badges, but not separate section anymore)
  // const misTurnos = availableTurnos.filter(t => t.voluntariosInscritos?.includes(user.id));

  // Agrupar turnos por tipo for Filter Count
  const turnosPorTipo = {
    [EventType.Expositores]: availableTurnos.filter(t => (t.tipo as any) === EventType.Expositores),
    [EventType.Guias]: availableTurnos.filter(t => (t.tipo as any) === EventType.Guias),
    [EventType.Escuelas]: availableTurnos.filter(t => (t.tipo as any) === EventType.Escuelas),
    [EventType.Editoriales]: availableTurnos.filter(t => (t.tipo as any) === EventType.Editoriales),
    [EventType.Encuestas]: availableTurnos.filter(t => (t.tipo as any) === EventType.Encuestas),
    [EventType.Bodega]: availableTurnos.filter(t => (t.tipo as any) === EventType.Bodega)
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
  };

  const getCupoColor = (turno: Turno) => {
    if (turno.estado === 'completo') return '#ef4444';
    if (turno.estado === 'limitado') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div
      className="min-h-screen pb-24 theme-transition"
      style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
    >
      {/* Header */}
      <HeaderWithTheme
        title="Servir en PPAM"
        showMenu={showMenu}
        onMenuToggle={() => setShowMenu(!showMenu)}
        user={user}
        onLogout={onLogout}
        onNavigateToInformes={onNavigateToInformes}
      />

      <div className="px-4 py-4">
        {/* Category Filters (Preserved as requested) */}
        <div className="mb-6 overflow-x-auto pb-2">
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: `rgb(${colors.text.primary})` }}>
            Filtrar por Categoría
          </h2>
          <div className="flex gap-3">
            {Object.entries(turnosPorTipo).map(([tipo, turnosDeTipo]) => {
              if (!turnosDeTipo || turnosDeTipo.length === 0) return null;
              const isActive = selectedCategoryFilter === tipo;
              return (
                <button
                  key={tipo}
                  onClick={() => setSelectedCategoryFilter(isActive ? null : tipo)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl min-w-[100px] transition-all border ${isActive ? 'ring-2 ring-offset-1' : ''}`}
                  style={{
                    backgroundColor: isActive ? `rgba(${colors.interactive.primary}, 0.1)` : `rgb(${colors.bg.secondary})`,
                    borderColor: isActive ? `rgb(${colors.interactive.primary})` : `rgb(${colors.ui.border})`
                  }}
                >
                  <EventBadge tipo={tipo} variant="compact" />
                  <span className="text-xs font-medium" style={{ color: `rgb(${colors.text.primary})` }}>
                    {turnosDeTipo.length} Turnos
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Universal Calendar List */}
        <div className="space-y-6">
          {sortedDates.length > 0 ? (
            sortedDates.map(fecha => (
              <div key={fecha}>
                <h3 className="font-medium mb-3 pl-1" style={{ color: `rgb(${colors.text.primary})` }}>
                  {formatDate(fecha)}
                </h3>
                <div className="space-y-3">
                  {groupedTurnosVariable[fecha].map(turno => (
                    <TurnoCard
                      key={turno.id}
                      turno={turno}
                      userRole={user.role}
                      onClick={() => setSelectedTurno(turno)}
                      isInscrito={turno.voluntariosInscritos?.includes(user.id)}
                      showDateTitle={false} // Date is already in header
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-3">📅</div>
              <p style={{ color: `rgb(${colors.text.secondary})` }}>
                No hay turnos disponibles con los filtros actuales
              </p>
            </div>
          )}
        </div>
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