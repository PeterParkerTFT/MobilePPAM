import React, { useState } from 'react';
import { EnumHelpers, UserRole } from '../types/enums';
import { User, Turno, Capitan } from '../types/models';
import { ChevronRight, MoreVertical, Plus, MapPin } from 'lucide-react';
import { HeaderWithTheme } from '../components/HeaderWithTheme';
import { TurnoDetailModal } from '../components/TurnoDetailModal';
import { AddTurnoModal } from '../components/AddTurnoModal';
import { EventMapModal } from '../components/EventMapModal';
import { TurnoService } from '../services/TurnoService';
import { EventBadge } from '../components/EventBadge';
import { eventTypes } from '../constants/eventTypes';
import { useThemeColors } from '../hooks/useThemeColors';

interface TurnosScreenProps {
  user: User;
  onLogout: () => void;
  turnos: Turno[];
  capitanes: Capitan[];
  onInscripcion: (turnoId: string, userId: string) => void;
  onNavigateToInformes?: () => void;
  onTurnoCreated?: () => void;
}

export function TurnosScreen({ user, onLogout, turnos, capitanes, onInscripcion, onNavigateToInformes, onTurnoCreated }: TurnosScreenProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>('carrito');
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showPastTurnos, setShowPastTurnos] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const colors = useThemeColors();
  const turnoService = new TurnoService();

  const filteredTurnos = turnos.filter(turno => {
    const isCorrectType = turno.tipo === selectedEvent;

    // [HISTORY FIX] Filter by date based on toggle
    const turnoDate = new Date(turno.fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison
    // Use yesterday 11:59PM as cutoff? Or strictly today.
    // Logic: If !showPastTurnos, only show >= today.

    const isPast = turnoDate < today;
    if (!showPastTurnos && isPast) return false;

    return isCorrectType;
  });

  // Agrupar turnos por fecha
  const groupedTurnos = filteredTurnos.reduce((groups, turno) => {
    const date = turno.fecha;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(turno);
    return groups;
  }, {} as Record<string, Turno[]>);

  const canAddTurno = EnumHelpers.isAdmin(user.role) || user.role === UserRole.Capitan;

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTitle = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div
      className="min-h-screen pb-24 theme-transition"
      style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
    >
      {/* Header con Theme Toggle */}
      <HeaderWithTheme
        title="Turnos"
        showMenu={showMenu}
        onMenuToggle={() => setShowMenu(!showMenu)}
        user={user}
        onLogout={onLogout}
        onNavigateToInformes={onNavigateToInformes}
      />

      <div className="px-4 py-4">
        {/* Add Button - Solo para admin y capitán */}
        {canAddTurno && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
              style={{
                backgroundColor: selectedEvent
                  ? `rgb(${eventTypes.find(e => e.id === selectedEvent)?.color || colors.interactive.primary})`
                  : `rgb(${colors.interactive.primary})`
              }}
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">Agregar</span>
            </button>
          </div>
        )}

        {/* Ver turnos anteriores */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="font-medium"
            style={{ color: `rgb(${colors.text.primary})` }}
          >
            Ver turnos anteriores
          </span>
          <button
            onClick={() => setShowPastTurnos(!showPastTurnos)}
            className="relative w-14 h-7 rounded-full transition-colors"
            style={{
              backgroundColor: showPastTurnos
                ? `rgb(${colors.interactive.primary})`
                : `rgb(${colors.ui.disabled})`
            }}
          >
            <div
              className="absolute top-1 w-5 h-5 rounded-full transition-transform shadow-md"
              style={{
                backgroundColor: `rgb(${colors.bg.secondary})`,
                transform: showPastTurnos ? 'translateX(28px)' : 'translateX(4px)'
              }}
            />
          </button>
        </div>

        {/* Selecciona un Evento */}
        <div className="mb-4">
          <h2
            className="font-semibold mb-3"
            style={{ color: `rgb(${colors.text.primary})` }}
          >
            Selecciona un Evento
          </h2>
          <div className="grid grid-cols-3 gap-2 animate-in fade-in duration-300">
            {eventTypes.slice(0, showAllEvents ? undefined : 6).map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedEvent(type.id)}
                className="px-3 py-2.5 rounded-xl flex flex-col items-center gap-1.5 transition-all"
                style={{
                  backgroundColor: selectedEvent === type.id
                    ? `rgba(${type.color}, 0.15)`
                    : `rgb(${colors.bg.tertiary})`,
                  border: selectedEvent === type.id
                    ? `2px solid rgb(${type.color})`
                    : `1px solid rgb(${colors.ui.border})`,
                }}
              >
                {type.image ? (
                  <div className="w-8 h-8 rounded-lg overflow-hidden">
                    <img
                      src={type.image}
                      alt={type.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <span className="text-xl">{type.icon}</span>
                )}
                <span
                  className={`text-xs ${selectedEvent === type.id ? 'font-semibold' : 'font-medium'}`}
                  style={{
                    color: selectedEvent === type.id
                      ? `rgb(${type.color})`
                      : `rgb(${colors.text.primary})` // Fixed color reference
                  }}
                >
                  {type.label}
                </span>
              </button>
            ))}
          </div>

          {/* Toggle Button */}
          {eventTypes.length > 6 && (
            <button
              onClick={() => setShowAllEvents(!showAllEvents)}
              className="w-full mt-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
              style={{
                color: `rgb(${colors.interactive.primary})`,
                backgroundColor: `rgba(${colors.interactive.primary}, 0.05)`
              }}
            >
              {showAllEvents ? (
                <>Ver menos categorías <ChevronRight className="w-4 h-4 rotate-270" style={{ transform: 'rotate(-90deg)' }} /></>
              ) : (
                <>Ver más categorías ({eventTypes.length - 6}) <ChevronRight className="w-4 h-4" style={{ transform: 'rotate(90deg)' }} /></>
              )}
            </button>
          )}
        </div>

        {/* Título de la categoría seleccionada */}
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-medium capitalize"
            style={{ color: `rgb(${colors.text.primary})` }}
          >
            {eventTypes.find(e => e.id === selectedEvent)?.label}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowMapModal(true)}
              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:opacity-80 transition-opacity text-sm font-medium"
              style={{
                backgroundColor: `rgba(${colors.interactive.primary}, 0.1)`,
                color: `rgb(${colors.interactive.primary})`
              }}
            >
              <MapPin className="w-4 h-4" />
              Ver Mapa
            </button>
            <button
              className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ backgroundColor: `rgba(${colors.bg.tertiary}, 0.5)` }}
            >
              <MoreVertical
                className="w-5 h-5"
                style={{ color: `rgb(${colors.text.secondary})` }}
              />
            </button>
          </div>
        </div>

        {/* Lista de Turnos Agrupados por Fecha */}
        <div className="space-y-6">
          {Object.keys(groupedTurnos).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map((fecha) => (
            <div key={fecha}>
              {/* Fecha Header */}
              <h3
                className="font-medium mb-3"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                {formatDateHeader(fecha)}
              </h3>

              {/* Lista de turnos para esta fecha */}
              <div className="space-y-3">
                {groupedTurnos[fecha].map((turno) => {
                  const isInscrito = turno.voluntariosInscritos.includes(user.id);

                  return (
                    <div
                      key={turno.id}
                      id={filteredTurnos.indexOf(turno) === 0 ? 'tour-turno-card' : undefined}
                      onClick={() => setSelectedTurno(turno)}
                      className="rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:opacity-90 transition-all theme-transition"
                      style={{
                        backgroundColor: `rgb(${colors.bg.secondary})`,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: `1px solid rgb(${colors.ui.border})`
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <EventBadge tipo={turno.tipo || 'fijo'} variant="compact" showImage />
                          {isInscrito && (
                            <span className="text-green-500 text-sm">✓</span>
                          )}
                        </div>
                        <div
                          className="text-sm font-semibold mb-1"
                          style={{ color: `rgb(${colors.text.primary})` }}
                        >
                          {formatDateTitle(turno.fecha)}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: `rgb(${colors.text.secondary})` }}
                        >
                          {turno.horaInicio} → {turno.horaFin} · Voluntarios: {turno.cupoActual}/{turno.cupoMaximo}
                        </div>
                      </div>

                      <ChevronRight
                        className="w-5 h-5 flex-shrink-0"
                        style={{ color: `rgb(${colors.text.tertiary})` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredTurnos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-3">📅</div>
            <p style={{ color: `rgb(${colors.text.secondary})` }}>
              No hay turnos disponibles para esta categoría
            </p>
          </div>
        )}
      </div>

      {/* Offline indicator - Removed for production polish until fully implemented with PWA */}

      {/* Modal de Detalle */}
      {selectedTurno && (
        <TurnoDetailModal
          turno={selectedTurno}
          user={user}
          onClose={() => setSelectedTurno(null)}
          onInscribirse={() => {
            onInscripcion(selectedTurno.id, user.id);
            setSelectedTurno(null);
          }}
        />
      )}

      {/* Modal de Agregar Turno */}
      {showAddModal && (
        <AddTurnoModal
          user={user}
          initialEventType={selectedEvent} // [NEW] Pass context
          onClose={() => setShowAddModal(false)}
          onAdd={async (newTurnoData) => {
            try {
              // Convertir formato de AddTurnoModal a lo que espera TurnoService
              // El modal ya devuelve un objeto "Turno" pero necesitamos adaptarlo si es necesario
              // O simplemente llamar a TurnoService.create

              // @ts-ignore - AddTurnoModal type vs Turno model match check needed
              await turnoService.createTurno(newTurnoData, user.congregacion);
              setShowAddModal(false);
              onTurnoCreated?.();
              alert('Turno creado con éxito.');
            } catch (error) {
              console.error('Error creando turno:', error);
              alert('Error al crear el turno');
            }
          }}
        />
      )}

      {/* Modal de Mapa Contextual */}
      {showMapModal && (
        <EventMapModal
          eventType={selectedEvent}
          eventLabel={eventTypes.find(e => e.id === selectedEvent)?.label || 'Evento'}
          onClose={() => setShowMapModal(false)}
        />
      )}
    </div>
  );
}