import React, { useState } from 'react';
import { User, Turno } from '../types/models';
import { EventType } from '../types/enums';
import { Calendar, MapPin, Clock, Users, MessageCircle, Phone, X, ChevronRight, AlertCircle } from 'lucide-react';
import { HeaderWithTheme } from '../components/HeaderWithTheme';
import { EventBadge } from '../components/EventBadge';
import { useThemeColors } from '../hooks/useThemeColors';
import { TurnoService } from '../services/TurnoService';
import { TurnoSesion } from '../types/models';

interface MisTurnosScreenProps {
  user: User;
  onLogout: () => void;
  turnos: Turno[];
  onNavigateToInformes?: () => void; // Nueva prop
}

export function MisTurnosScreen({ user, onLogout, turnos, onNavigateToInformes }: MisTurnosScreenProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const colors = useThemeColors();

  // Filtrar solo los turnos donde el usuario está inscrito
  const [misTurnos, setMisTurnos] = useState<TurnoSesion[]>([]);
  const [loading, setLoading] = useState(true);
  const turnoService = new TurnoService();

  React.useEffect(() => {
    const fetchMisTurnos = async () => {
      setLoading(true);
      try {
        const data = await turnoService.getMisTurnos(user.id);
        setMisTurnos(data);
      } catch (error) {
        console.error('Error fetching mis turnos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMisTurnos();
  }, [user.id]);

  const handleWhatsAppClick = (grupoUrl: string) => {
    window.open(grupoUrl, '_blank');
  };

  return (
    <div
      className="min-h-screen pb-24 theme-transition"
      style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
    >
      {/* Header */}
      <HeaderWithTheme
        title="Mis Turnos"
        user={user}
        onLogout={onLogout}
        showMenu={showMenu}
        onMenuToggle={() => setShowMenu(!showMenu)}
        onNavigateToInformes={onNavigateToInformes}
      />

      <div className="px-4 py-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div
            className="rounded-xl p-4 text-center shadow-sm theme-transition"
            style={{
              backgroundColor: `rgb(${colors.bg.secondary})`,
              border: `1px solid rgb(${colors.ui.border})`
            }}
          >
            <div
              className="text-2xl font-bold mb-1"
              style={{ color: `rgb(${colors.interactive.primary})` }}
            >
              {misTurnos.length}
            </div>
            <div
              className="text-xs font-medium"
              style={{ color: `rgb(${colors.text.tertiary})` }}
            >
              Turnos
            </div>
          </div>
          <div
            className="rounded-xl p-4 text-center shadow-sm theme-transition"
            style={{
              backgroundColor: `rgb(${colors.bg.secondary})`,
              border: `1px solid rgb(${colors.ui.border})`
            }}
          >
            <div className="text-2xl text-green-500 font-bold mb-1">
              {misTurnos.filter(t => new Date(t.fecha) > new Date()).length}
            </div>
            <div
              className="text-xs font-medium"
              style={{ color: `rgb(${colors.text.tertiary})` }}
            >
              Próximos
            </div>
          </div>
          <div
            className="rounded-xl p-4 text-center shadow-sm theme-transition"
            style={{
              backgroundColor: `rgb(${colors.bg.secondary})`,
              border: `1px solid rgb(${colors.ui.border})`
            }}
          >
            <div className="text-2xl text-blue-500 font-bold mb-1">
              {misTurnos.reduce((acc, t) => acc + ((t.cupoMaximo || 0) > 0 ? 1 : 0), 0)}
            </div>
            <div
              className="text-xs font-medium"
              style={{ color: `rgb(${colors.text.tertiary})` }}
            >
              Activos
            </div>
          </div>
        </div>

        {/* Lista de Mis Turnos */}
        <h2
          className="font-medium mb-4"
          style={{ color: `rgb(${colors.text.primary})` }}
        >
          Turnos Asignados
        </h2>

        {misTurnos.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center shadow-sm theme-transition"
            style={{ backgroundColor: `rgb(${colors.bg.secondary})` }}
          >
            <div className="text-6xl mb-3">📅</div>
            <h3
              className="font-medium mb-2"
              style={{ color: `rgb(${colors.text.primary})` }}
            >
              No tienes turnos asignados
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: `rgb(${colors.text.secondary})` }}
            >
              Ve a la sección de Turnos para inscribirte en las actividades disponibles
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {misTurnos.map((turno) => (
              <div
                key={turno.id}
                onClick={() => setSelectedTurno(turno)}
                className="rounded-xl p-4 cursor-pointer hover:opacity-90 transition-all theme-transition"
                style={{
                  backgroundColor: `rgb(${colors.bg.secondary})`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: `1px solid rgb(${colors.ui.border})`
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <EventBadge tipo={turno.tipo || 'Evento'} variant="default" showImage />
                      <span className="text-green-500 text-lg">✓</span>
                    </div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: `rgb(${colors.text.primary})` }}
                    >
                      {turno.titulo || 'Sin título'}
                    </div>
                  </div>

                  <ChevronRight
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: `rgb(${colors.text.tertiary})` }}
                  />
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs" style={{ color: `rgb(${colors.text.secondary})` }}>
                    <Calendar className="w-4 h-4" style={{ color: `rgb(${colors.interactive.primary})` }} />
                    <span>
                      {new Date(turno.fecha).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs" style={{ color: `rgb(${colors.text.secondary})` }}>
                    <Clock className="w-4 h-4" style={{ color: `rgb(${colors.interactive.primary})` }} />
                    <span>{turno.horaInicio} - {turno.horaFin}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs" style={{ color: `rgb(${colors.text.secondary})` }}>
                    <MapPin className="w-4 h-4" style={{ color: `rgb(${colors.interactive.primary})` }} />
                    <span className="truncate">{turno.ubicacion}</span>
                  </div>
                </div>

                <div
                  className="rounded-lg p-3 text-white theme-transition"
                  style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium">Capitán: {turno.capitanNombre}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWhatsAppClick(turno.grupoWhatsApp || '');
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Grupo de WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Información Adicional */}
        {misTurnos.length > 0 && (
          <div
            className="mt-6 rounded-xl p-4 flex gap-3 border theme-transition"
            style={{
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              borderColor: 'rgba(33, 150, 243, 0.3)'
            }}
          >
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Recordatorio</p>
              <p className="text-xs leading-relaxed">
                Asegúrate de estar en el grupo de WhatsApp de cada turno para recibir instrucciones
                y comunicaciones importantes del capitán asignado.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {selectedTurno && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-in fade-in duration-200">
          <div
            className="w-full max-w-[428px] rounded-t-3xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 theme-transition"
            style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
          >
            <div
              className="sticky top-0 text-white p-6 rounded-t-3xl theme-transition"
              style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-medium pr-8">{selectedTurno.titulo}</h2>
                <button
                  onClick={() => setSelectedTurno(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium mb-2" style={{ color: `rgb(${colors.text.primary})` }}>
                  Descripción
                </h3>
                <p className="text-sm" style={{ color: `rgb(${colors.text.secondary})` }}>
                  {selectedTurno.descripcion || 'Sin descripción'}
                </p>
              </div>

              <div
                className="rounded-xl p-4 space-y-3 theme-transition"
                style={{ backgroundColor: `rgb(${colors.bg.tertiary})` }}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5" style={{ color: `rgb(${colors.interactive.primary})` }} />
                  <div>
                    <div className="text-xs" style={{ color: `rgb(${colors.text.tertiary})` }}>Fecha</div>
                    <div className="text-sm" style={{ color: `rgb(${colors.text.primary})` }}>
                      {new Date(selectedTurno.fecha).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" style={{ color: `rgb(${colors.interactive.primary})` }} />
                  <div>
                    <div className="text-xs" style={{ color: `rgb(${colors.text.tertiary})` }}>Horario</div>
                    <div className="text-sm" style={{ color: `rgb(${colors.text.primary})` }}>
                      {selectedTurno.horaInicio} - {selectedTurno.horaFin}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: `rgb(${colors.interactive.primary})` }} />
                  <div>
                    <div className="text-xs" style={{ color: `rgb(${colors.text.tertiary})` }}>Ubicación</div>
                    <div className="text-sm" style={{ color: `rgb(${colors.text.primary})` }}>
                      {selectedTurno.ubicacion}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleWhatsAppClick(selectedTurno.grupoWhatsApp || '')}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Abrir Grupo de WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline indicator - Removed for production polish until fully implemented with PWA */}
    </div>
  );
}