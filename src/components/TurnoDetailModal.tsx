import React, { useState } from 'react';
import { X, MapPin, Clock, Users, User as UserIcon, MessageCircle, Check, Phone, ChevronRight, Share2, AlertCircle, Navigation, Trash2, Edit } from 'lucide-react';
import { EventBadge } from './EventBadge';
import { getEventType } from '../constants/eventTypes';
import { useThemeColors } from '../hooks/useThemeColors';
import { User, Turno } from '../types/models';
import { EnumHelpers, UserRole } from '../types/enums';
import { TurnoService } from '../services/TurnoService';
import { UserPicker } from './UserPicker';

interface TurnoDetailModalProps {
  turno: Turno;
  user: User;
  onClose: () => void;
  onInscribirse: () => void;
  onTurnoUpdated?: () => void; // Refresh list
}

export function TurnoDetailModal({ turno, user, onClose, onInscribirse, onTurnoUpdated }: TurnoDetailModalProps) {
  const colors = useThemeColors();
  const isInscrito = turno.voluntariosInscritos.includes(user.id);
  const cupoMaximo = turno.cupoMaximo || 0;
  const isFull = turno.cupoActual >= cupoMaximo;
  const canInscribirse = !isInscrito && !isFull;

  const [showUserPicker, setShowUserPicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [volunteers, setVolunteers] = useState<User[]>([]);

  // Fetch volunteers on mount
  React.useEffect(() => {
    const fetchVolunteers = async () => {
      const turnoService = new TurnoService();
      // Ensure we use the instance-specific date (fecha prop from TurnoSesion)
      if (turno.fecha) {
        const vols = await turnoService.getVolunteersForTurn(turno.id, turno.fecha as string);
        setVolunteers(vols);
      }
    };
    fetchVolunteers();
  }, [turno.id, turno.fecha]);

  const handleRemoveVolunteer = async (userId: string, userName: string) => {
    if (!confirm(`¿Desasignar a ${userName} de este turno?`)) return;

    try {
      const turnoService = new TurnoService();
      const success = await turnoService.removeVolunteer(turno.id, userId, turno.fecha as string);
      if (success) {
        // Refresh local list and parent
        setVolunteers(prev => prev.filter(v => v.id !== userId));
        if (onTurnoUpdated) onTurnoUpdated();
      } else {
        alert('No se pudo desasignar al voluntario.');
      }
    } catch (e) {
      console.error(e);
      alert('Error al desasignar.');
    }
  };

  // Permission Check
  // Admins are Global or Local. Coordinators are Captains. 
  // Managers can delete? Usually Admins.
  const isAdminOrCoord = EnumHelpers.isAdmin(user.role);
  // If captains can also manage their own turn:
  const isMyTurno = turno.capitanId === user.id;
  const canManage = isAdminOrCoord || isMyTurno;

  const turnoService = new TurnoService(); // Should use context/prop ideally

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este turno? Esta acción no se puede deshacer.')) return;

    setIsDeleting(true);
    try {
      await turnoService.deleteTurno(turno.id);
      if (onTurnoUpdated) onTurnoUpdated();
      onClose();
    } catch (e) {
      alert('Error al eliminar el turno');
      console.error(e);
      setIsDeleting(false);
    }
  };

  const handleAssignCaptain = async (userId: string) => {
    try {
      await turnoService.assignCaptain(turno.id, userId);
      if (onTurnoUpdated) onTurnoUpdated();
      setShowUserPicker(false);
    } catch (e) {
      alert('Error al asignar capitán');
    }
  };

  const getSemaforoText = () => {
    switch (turno.estado) {
      case 'disponible':
        return 'Cupos Disponibles';
      case 'limitado':
        return 'Cupos Limitados';
      case 'completo':
        return 'Turno Completo';
      default:
        return '';
    }
  };

  const getSemaforoColor = () => {
    switch (turno.estado) {
      case 'disponible':
        return { bg: 'rgba(76, 175, 80, 0.1)', text: 'rgb(76, 175, 80)', border: 'rgba(76, 175, 80, 0.3)', dot: 'rgb(76, 175, 80)' };
      case 'limitado':
        return { bg: 'rgba(255, 152, 0, 0.1)', text: 'rgb(255, 152, 0)', border: 'rgba(255, 152, 0, 0.3)', dot: 'rgb(255, 152, 0)' };
      case 'completo':
        return { bg: 'rgba(244, 67, 54, 0.1)', text: 'rgb(244, 67, 54)', border: 'rgba(244, 67, 54, 0.3)', dot: 'rgb(244, 67, 54)' };
      default:
        return { bg: 'rgba(158, 158, 158, 0.1)', text: 'rgb(158, 158, 158)', border: 'rgba(158, 158, 158, 0.3)', dot: 'rgb(158, 158, 158)' };
    }
  };

  const semaforo = getSemaforoColor();

  const handleWhatsAppClick = () => {
    window.open(turno.grupoWhatsApp, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-in fade-in duration-200">
      <div
        className="w-full max-w-[428px] rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300 theme-transition"
        style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
      >
        {/* Header */}
        <div
          className="sticky top-0 text-white p-6 rounded-t-3xl theme-transition shadow-lg"
          style={{
            backgroundColor: `rgb(${(getEventType(turno.tipo as any)?.color) || colors.interactive.primary})`
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="mb-3">
                <EventBadge tipo={turno.tipo as any} variant="large" showImage />
              </div>
              <h2 className="text-xl font-semibold mb-2">{turno.titulo}</h2>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                style={{
                  backgroundColor: semaforo.bg,
                  borderColor: semaforo.border,
                  color: semaforo.text
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: semaforo.dot }}
                ></div>
                <span className="text-xs font-semibold">{getSemaforoText()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {/* Delete Button (Admin Only) */}
              {isAdminOrCoord && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full transition-colors text-white"
                  title="Eliminar Turno"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {isInscrito && (
            <div className="bg-green-500 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium">
              <Check className="w-5 h-5" />
              <span>Ya estás inscrito en este turno</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Descripción */}
          <div>
            <h3
              className="font-medium mb-2"
              style={{ color: `rgb(${colors.text.primary})` }}
            >
              Descripción
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: `rgb(${colors.text.secondary})` }}
            >
              {turno.descripcion}
            </p>
          </div>

          {/* Lista de Voluntarios (Admin/Capitán + Info Pública) */}
          <div>
            <h3
              className="font-medium mb-3"
              style={{ color: `rgb(${colors.text.primary})` }}
            >
              Voluntarios Inscritos
            </h3>
            <div className="space-y-2">
              {volunteers.length === 0 ? (
                <div className="text-sm text-gray-400 italic">No hay voluntarios inscritos aún.</div>
              ) : (
                volunteers.map((vol) => (
                  <div
                    key={vol.id}
                    className="flex items-center justify-between p-3 rounded-lg border theme-transition"
                    style={{
                      borderColor: `rgb(${colors.ui.divider})`,
                      backgroundColor: `rgb(${colors.bg.tertiary})`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                        ${vol.role === UserRole.AdminGlobal ? 'bg-purple-100 text-purple-600' :
                          vol.role === UserRole.Capitan ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-600'}`}
                      >
                        {vol.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: `rgb(${colors.text.primary})` }}>
                          {vol.nombre}
                        </div>
                        <div className="text-xs" style={{ color: `rgb(${colors.text.tertiary})` }}>
                          {EnumHelpers.getRoleLabel(vol.role)}
                        </div>
                      </div>
                    </div>

                    {/* Remove Button (Only for Managers) */}
                    {canManage && (
                      <button
                        onClick={() => handleRemoveVolunteer(vol.id, vol.nombre)}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Desasignar voluntario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Detalles del Turno */}
          <div>
            <h3
              className="font-medium mb-3"
              style={{ color: `rgb(${colors.text.primary})` }}
            >
              Detalles del Turno
            </h3>

            <div
              className="rounded-xl p-4 space-y-3 theme-transition"
              style={{ backgroundColor: `rgb(${colors.bg.tertiary})` }}
            >
              <div className="flex items-start gap-3">
                <MapPin
                  className="w-5 h-5 mt-0.5"
                  style={{ color: `rgb(${colors.interactive.primary})` }}
                />
                <div className="flex-1">
                  <div
                    className="text-xs mb-0.5"
                    style={{ color: `rgb(${colors.text.tertiary})` }}
                  >
                    Ubicación
                  </div>
                  <div
                    className="text-sm mb-1"
                    style={{ color: `rgb(${colors.text.primary})` }}
                  >
                    {turno.ubicacion}
                  </div>
                  {turno.coordenadas && (
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${turno.coordenadas?.lat},${turno.coordenadas?.lng}`, '_blank')}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                      style={{
                        backgroundColor: `rgba(${colors.interactive.primary}, 0.1)`,
                        color: `rgb(${colors.interactive.primary})`
                      }}
                    >
                      <Navigation className="w-3 h-3" />
                      Navegar
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock
                  className="w-5 h-5 mt-0.5"
                  style={{ color: `rgb(${colors.interactive.primary})` }}
                />
                <div className="flex-1">
                  <div
                    className="text-xs mb-0.5"
                    style={{ color: `rgb(${colors.text.tertiary})` }}
                  >
                    Horario
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: `rgb(${colors.text.primary})` }}
                  >
                    {turno.horaInicio} - {turno.horaFin}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users
                  className="w-5 h-5 mt-0.5"
                  style={{ color: `rgb(${colors.interactive.primary})` }}
                />
                <div className="flex-1">
                  <div
                    className="text-xs mb-0.5"
                    style={{ color: `rgb(${colors.text.tertiary})` }}
                  >
                    Cupos
                  </div>
                  <div
                    className="text-sm mb-2"
                    style={{ color: `rgb(${colors.text.primary})` }}
                  >
                    {turno.cupoActual} de {cupoMaximo} ocupados
                  </div>
                  <div
                    className="w-full rounded-full h-2"
                    style={{ backgroundColor: `rgb(${colors.ui.divider})` }}
                  >
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(turno.cupoActual / (cupoMaximo || 1)) * 100}%`,
                        backgroundColor: turno.estado === 'completo' ? semaforo.dot :
                          turno.estado === 'limitado' ? semaforo.dot : semaforo.dot
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Capitán */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3
                className="font-medium"
                style={{ color: `rgb(${colors.text.primary})` }}
              >
                Capitán Asignado
              </h3>
              {canManage && (
                <button
                  onClick={() => setShowUserPicker(true)}
                  className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline"
                >
                  <Edit className="w-3 h-3" />
                  {turno.capitanNombre ? 'Cambiar' : 'Asignar'}
                </button>
              )}
            </div>

            <div
              className="rounded-xl p-4 text-white theme-transition"
              style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-medium">{turno.capitanNombre || 'Sin asignar'}</div>
                  <div className="text-xs text-blue-100">Coordinador del Turno</div>
                </div>
              </div>

              {isInscrito && turno.grupoWhatsApp && (
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Unirse al Grupo de WhatsApp</span>
                </button>
              )}
            </div>
          </div>

          {/* Nota Informativa */}
          {!isInscrito && (
            <div
              className="rounded-xl p-4 flex gap-3 border theme-transition"
              style={{
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                borderColor: 'rgba(33, 150, 243, 0.3)'
              }}
            >
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Asignación Automática</p>
                <p className="text-xs leading-relaxed">
                  Al inscribirte en este turno, serás automáticamente asignado al grupo del {turno.capitanNombre}
                  y recibirás el enlace para unirte al grupo de WhatsApp correspondiente.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {canInscribirse ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-xl font-medium hover:opacity-90 transition-all theme-transition"
                  style={{
                    backgroundColor: `rgb(${colors.bg.tertiary})`,
                    color: `rgb(${colors.text.primary})`
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={onInscribirse}
                  className="flex-1 text-white py-3.5 rounded-xl font-medium hover:opacity-90 transition-all"
                  style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
                >
                  Inscribirme Ahora
                </button>
              </>
            ) : isFull ? (
              <button
                onClick={onClose}
                className="flex-1 text-white py-3.5 rounded-xl font-medium cursor-not-allowed opacity-50"
                style={{ backgroundColor: `rgb(${colors.ui.disabled})` }}
                disabled
              >
                Turno Completo
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 text-white py-3.5 rounded-xl font-medium"
                style={{ backgroundColor: `rgb(${colors.interactive.primary})` }}
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>

      {showUserPicker && (
        <UserPicker
          onClose={() => setShowUserPicker(false)}
          onSelect={(id, name) => handleAssignCaptain(id)}
          title="Asignar Capitán"
        />
      )}
    </div>
  );
}