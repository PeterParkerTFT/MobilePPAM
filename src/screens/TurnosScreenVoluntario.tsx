import React, { useState } from 'react';
import { User, Turno } from '../types/models';
import { EventType } from '../types/enums';
import { HeaderWithTheme } from '../components/HeaderWithTheme';
import { useThemeColors } from '../hooks/useThemeColors';
import { EventBadge } from '../components/EventBadge';
import { TurnoDetailModal } from '../components/TurnoDetailModal';
import { Clock, MapPin, Users, MessageCircle } from 'lucide-react';

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
  const colors = useThemeColors();

  // Filtrar solo los turnos disponibles (no pasados)
  const availableTurnos = turnos.filter(t => new Date(t.fecha) >= new Date());

  // Turnos en los que estoy inscrito
  const misTurnos = availableTurnos.filter(t => t.voluntariosInscritos?.includes(user.id));

  // Agrupar turnos por tipo
  const turnosPorTipo = {
    [EventType.Expositores]: availableTurnos.filter(t => t.tipo === EventType.Expositores),
    [EventType.Guias]: availableTurnos.filter(t => t.tipo === EventType.Guias),
    [EventType.Escuelas]: availableTurnos.filter(t => t.tipo === EventType.Escuelas),
    [EventType.Editoriales]: availableTurnos.filter(t => t.tipo === EventType.Editoriales),
    [EventType.Encuestas]: availableTurnos.filter(t => t.tipo === EventType.Encuestas),
    [EventType.Bodega]: availableTurnos.filter(t => t.tipo === EventType.Bodega)
  };

  // Helper functions restored
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
        {/* Mensaje de bienvenida */}
        <div
          className="rounded-xl p-4 mb-6 theme-transition"
          style={{
            backgroundColor: `rgba(${colors.interactive.primary}, 0.1)`,
            border: `1px solid rgba(${colors.interactive.primary}, 0.2)`
          }}
        >
          <h2
            className="font-semibold mb-2"
            style={{ color: `rgb(${colors.interactive.primary})` }}
          >
            ¡Bienvenido, {user.nombre.split(' ')[0]}! 👋
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: `rgb(${colors.text.primary})` }}
          >
            Selecciona el tipo de servicio en el que te gustaría participar.
            Puedes inscribirte en múltiples turnos según tu disponibilidad.
          </p>
        </div>
        <div className="px-4 py-6 pb-24 space-y-8">
          {/* Mis Eventos Próximos */}
          {misTurnos.length > 0 && (
            <div className="mb-6">
              <h2
                className="text-lg font-semibold mb-4 flex items-center gap-2"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                <span className="text-2xl">📅</span>
                Mis Próximos Eventos
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {misTurnos.map(turno => (
                  <div
                    key={turno.id}
                    onClick={() => setSelectedTurno(turno)}
                    className="rounded-xl p-4 shadow-sm border border-l-4 active:scale-[0.98] transition-transform"
                    style={{
                      backgroundColor: `rgb(${colors.bg.secondary})`,
                      borderColor: `rgb(${colors.ui.border})`,
                      borderLeftColor: `rgb(${colors.interactive.primary})`
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3
                          className="font-semibold"
                          style={{ color: `rgb(${colors.text.primary})` }}
                        >
                          {turno.titulo || 'Turno Asignado'}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: `rgb(${colors.text.secondary})` }}
                        >
                          {formatDate(turno.fecha)} • {turno.horaInicio}
                        </p>
                      </div>
                      {turno.grupoWhatsApp && (
                        <MessageCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm mt-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span style={{ color: `rgb(${colors.text.secondary})` }}>
                        {turno.ubicacion}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categorías (Dynamic Render) */}
          {Object.entries(turnosPorTipo).map(([tipo, turnosDeTipo]) => {
            // Skip empty categories
            if (!turnosDeTipo || turnosDeTipo.length === 0) return null;

            return (
              <div key={tipo} className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <EventBadge tipo={tipo} variant="compact" />
                  <span className="text-sm font-medium text-gray-500">
                    ({turnosDeTipo.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {turnosDeTipo.map(turno => (
                    <div
                      key={turno.id}
                      onClick={() => setSelectedTurno(turno)}
                      className="rounded-xl p-4 shadow-sm border active:scale-[0.98] transition-transform"
                      style={{
                        backgroundColor: `rgb(${colors.bg.secondary})`,
                        borderColor: `rgb(${colors.ui.border})`
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3
                            className="font-semibold"
                            style={{ color: `rgb(${colors.text.primary})` }}
                          >
                            {formatDate(turno.fecha)}
                          </h3>
                          <p
                            className="text-sm"
                            style={{ color: `rgb(${colors.text.secondary})` }}
                          >
                            {turno.horaInicio} - {turno.horaFin}
                          </p>
                        </div>
                        <EventBadge tipo={turno.tipo || 'evento'} variant="compact" />
                      </div>

                      <div className="flex items-center gap-2 text-sm mb-3">
                        <MapPin
                          className="w-4 h-4"
                          style={{ color: `rgb(${colors.text.tertiary})` }}
                        />
                        <span
                          className="truncate"
                          style={{ color: `rgb(${colors.text.secondary})` }}
                        >
                          {turno.ubicacion}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Users
                            className="w-4 h-4"
                            style={{ color: `rgb(${colors.text.tertiary})` }}
                          />
                          <span
                            className="text-sm font-medium"
                            style={{ color: `rgb(${colors.text.primary})` }}
                          >
                            {turno.cupoActual}/{turno.cupoMaximo || turno.voluntariosMax || 0}
                          </span>
                        </div>

                        {turno.estado === 'completo' ? (
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
                            AGOTADO
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                            DISPONIBLE
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {(availableTurnos.length === 0 && misTurnos.length === 0) && (
        <div className="text-center py-12">
          <div className="text-6xl mb-3">📅</div>
          <p style={{ color: `rgb(${colors.text.secondary})` }}>
            No hay turnos disponibles en este momento
          </p>
        </div>
      )}

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