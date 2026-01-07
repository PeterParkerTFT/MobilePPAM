import React, { useState } from 'react';
import { User, Turno } from '../types/models';
import { HeaderWithTheme } from '../components/HeaderWithTheme';
import { useThemeColors } from '../hooks/useThemeColors';
import { EventBadge } from '../components/EventBadge';
import { TurnoDetailModal } from '../components/TurnoDetailModal';
import { Clock, MapPin, Users } from 'lucide-react';

interface TurnosScreenVoluntarioProps {
  user: User;
  onLogout: () => void;
  turnos: Turno[];
  onInscripcion: (turnoId: string, userId: string) => void;
  onNavigateToInformes?: () => void; // Nueva prop
}

export function TurnosScreenVoluntario({ 
  user, 
  onLogout, 
  turnos,
  onInscripcion,
  onNavigateToInformes
}: TurnosScreenVoluntarioProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const colors = useThemeColors();

  // Agrupar turnos por tipo
  const turnosPorTipo = {
    expositores: turnos.filter(t => t.tipo === 'expositores'),
    guias: turnos.filter(t => t.tipo === 'guias'),
    escuelas: turnos.filter(t => t.tipo === 'escuelas'),
    editoriales: turnos.filter(t => t.tipo === 'editoriales'),
    encuestas: turnos.filter(t => t.tipo === 'encuestas'),
    bodega: turnos.filter(t => t.tipo === 'bodega')
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

  const renderTurnoCard = (turno: Turno) => (
    <div
      key={turno.id}
      onClick={() => setSelectedTurno(turno)}
      className="rounded-xl p-4 cursor-pointer hover:opacity-90 transition-all shadow-md theme-transition"
      style={{ 
        backgroundColor: `rgb(${colors.bg.secondary})`,
        border: `1px solid rgb(${colors.ui.border})`
      }}
    >
      {/* Header con fecha y badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div 
            className="text-xs font-semibold mb-1"
            style={{ color: `rgb(${colors.text.secondary})` }}
          >
            {formatDate(turno.fecha)}
          </div>
        </div>
        <EventBadge tipo={turno.tipo} size="sm" />
      </div>

      {/* Horario */}
      <div className="flex items-center gap-2 mb-2">
        <Clock 
          className="w-4 h-4 flex-shrink-0" 
          style={{ color: `rgb(${colors.text.tertiary})` }}
        />
        <span 
          className="text-sm font-medium"
          style={{ color: `rgb(${colors.text.primary})` }}
        >
          {turno.horaInicio} - {turno.horaFin}
        </span>
      </div>

      {/* Ubicación */}
      <div className="flex items-start gap-2 mb-3">
        <MapPin 
          className="w-4 h-4 flex-shrink-0 mt-0.5" 
          style={{ color: `rgb(${colors.text.tertiary})` }}
        />
        <span 
          className="text-xs"
          style={{ color: `rgb(${colors.text.secondary})` }}
        >
          {turno.ubicacion}
        </span>
      </div>

      {/* Cupo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users 
            className="w-4 h-4" 
            style={{ color: getCupoColor(turno) }}
          />
          <span 
            className="text-sm font-semibold"
            style={{ color: getCupoColor(turno) }}
          >
            {turno.cupoActual}/{turno.cupoMaximo}
          </span>
        </div>
        
        {turno.estado === 'completo' ? (
          <span className="text-xs font-medium text-red-500">
            COMPLETO
          </span>
        ) : turno.estado === 'limitado' ? (
          <span className="text-xs font-medium text-orange-500">
            ÚLTIMOS LUGARES
          </span>
        ) : (
          <span className="text-xs font-medium text-green-500">
            DISPONIBLE
          </span>
        )}
      </div>
    </div>
  );

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

        {/* EXPOSITORES */}
        {turnosPorTipo.expositores.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <EventBadge tipo="expositores" size="md" />
              <h3 
                className="font-semibold text-lg"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                Expositores
              </h3>
            </div>
            <div className="space-y-3">
              {turnosPorTipo.expositores.map(renderTurnoCard)}
            </div>
          </div>
        )}

        {/* GUÍAS */}
        {turnosPorTipo.guias.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <EventBadge tipo="guias" size="md" />
              <h3 
                className="font-semibold text-lg"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                Guías
              </h3>
            </div>
            <div className="space-y-3">
              {turnosPorTipo.guias.map(renderTurnoCard)}
            </div>
          </div>
        )}

        {/* ESCUELAS */}
        {turnosPorTipo.escuelas.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <EventBadge tipo="escuelas" size="md" />
              <h3 
                className="font-semibold text-lg"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                Escuelas
              </h3>
            </div>
            <div className="space-y-3">
              {turnosPorTipo.escuelas.map(renderTurnoCard)}
            </div>
          </div>
        )}

        {/* EDITORIALES */}
        {turnosPorTipo.editoriales.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <EventBadge tipo="editoriales" size="md" />
              <h3 
                className="font-semibold text-lg"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                Editoriales
              </h3>
            </div>
            <div className="space-y-3">
              {turnosPorTipo.editoriales.map(renderTurnoCard)}
            </div>
          </div>
        )}

        {/* ENCUESTAS */}
        {turnosPorTipo.encuestas.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <EventBadge tipo="encuestas" size="md" />
              <h3 
                className="font-semibold text-lg"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                Encuestas
              </h3>
            </div>
            <div className="space-y-3">
              {turnosPorTipo.encuestas.map(renderTurnoCard)}
            </div>
          </div>
        )}

        {/* BODEGA */}
        {turnosPorTipo.bodega.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <EventBadge tipo="bodega" size="md" />
              <h3 
                className="font-semibold text-lg"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                Bodega
              </h3>
            </div>
            <div className="space-y-3">
              {turnosPorTipo.bodega.map(renderTurnoCard)}
            </div>
          </div>
        )}

        {turnos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-3">📅</div>
            <p style={{ color: `rgb(${colors.text.secondary})` }}>
              No hay turnos disponibles en este momento
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {selectedTurno && (
        <TurnoDetailModal
          turno={selectedTurno}
          onClose={() => setSelectedTurno(null)}
          onInscribir={() => {
            if (user) {
              onInscripcion(selectedTurno.id, user.id);
              setSelectedTurno(null);
            }
          }}
          userRole={user.role}
        />
      )}
    </div>
  );
}