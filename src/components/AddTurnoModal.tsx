import React, { useState } from 'react';
import { X, MapPin, Navigation } from 'lucide-react';
import { User } from '../types/models';
import { LocationPicker } from './LocationPicker';
import { TurnoService } from '../services/TurnoService';
import { eventTypes as globalEventTypes } from '../constants/eventTypes'; // Import global types config if needed, or keep local

type EventType = 'predicacion' | 'construccion' | 'congreso' | 'mantenimiento' | 'limpieza' | 'hospitalidad' | string;

interface Turno {
  id: string;
  tipo: EventType;
  titulo: string;
  descripcion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  voluntarios: number;
  maxVoluntarios: number;
  coordinador?: string;
  ubicacion: string;
  coordenadas?: { lat: number; lng: number };
  requisitos?: string;
  inscritos?: string[];
  sitioId?: string;
  territorios?: string; // [NEW] Optional
}

interface AddTurnoModalProps {
  onClose: () => void;
  onAdd: (turno: Turno) => void;
  user: User;
  initialEventType?: string; // [NEW] Context aware
}

const eventTypes: { type: EventType; label: string; icon: string }[] = [
  { type: 'predicacion', label: 'Predicación', icon: '📖' },
  { type: 'expositores', label: 'PPAM', icon: '🎤' }, // Updated match
  { type: 'construccion', label: 'Construcción', icon: '🏗️' },
  { type: 'congreso', label: 'Congresos', icon: '🏟️' },
  { type: 'mantenimiento', label: 'Mantenimiento', icon: '🔧' },
  { type: 'limpieza', label: 'Limpieza', icon: '🧹' },
  { type: 'hospitalidad', label: 'Hospitalidad', icon: '🏠' }
];

export function AddTurnoModal({ onClose, onAdd, user, initialEventType }: AddTurnoModalProps) {
  const [formData, setFormData] = useState({
    tipo: (initialEventType || 'predicacion') as EventType,
    titulo: '',
    descripcion: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    maxVoluntarios: 10,
    ubicacion: '',
    coordenadas: undefined as { lat: number; lng: number } | undefined,
    requisitos: '',
    sitioId: '',
    territorios: '' // [NEW]
  });

  const [availableSitios, setAvailableSitios] = useState<any[]>([]);
  const [useSavedLocation, setUseSavedLocation] = useState(true); // Default to saved location as per user preference
  const turnoService = new TurnoService();

  React.useEffect(() => {
    // If we have an initial event, we likely want to default to "use saved location"
    // and Pre-fill title/description if generic
    if (user.congregacion) {
      turnoService.getSitios(user.congregacion).then(setAvailableSitios);
    }
  }, [user.congregacion]);

  // Filter sites based on selected type
  // Match "expositores" (PPAM ID) with sites that have event_type='expositores' OR 'caminata'
  // Also show sites with NO event type (legacy/generic)
  const filteredSitios = availableSitios.filter(s => {
    if (!s.event_type) return true; // Show generic sites everywhere ?? Or maybe strictly? User wants to see THEIR sites.
    // If user selected PPAM (expositores), show sites marked as such
    if (formData.tipo === 'expositores' && (s.event_type === 'caminata' || s.event_type === 'expositores' || s.tipo === 'caminata')) return true;
    return s.event_type === formData.tipo;
  });

  const handleSitioSelect = (sitioId: string) => {
    const sitio = availableSitios.find(s => s.id === sitioId);
    if (sitio) {
      setFormData({
        ...formData,
        sitioId: sitio.id,
        ubicacion: sitio.nombre,
        coordenadas: sitio.coordenadas,
        // Don't override main type if we are in a specific context, unless explicit
        // tipo: sitio.tipo || formData.tipo 
      });
    } else {
      setFormData({ ...formData, sitioId: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTurno: Turno = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      voluntarios: 0,
      coordinador: user.nombre,
      inscritos: []
    };

    onAdd(newTurno);
  };

  // Resolve label for header
  const currentEventLabel = eventTypes.find(e => e.type === formData.tipo)?.label || globalEventTypes.find(e => e.id === formData.tipo)?.label || 'Actividad';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-[428px] bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-[#4A5D7C] to-[#5B7FA6] text-white p-6 rounded-t-3xl shadow-lg z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Nueva Actividad</h2>
              <p className="text-white/80 text-sm font-medium">{currentEventLabel}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Tipo - Only show if NO initial context was provided */}
          {!initialEventType && (
            <div className="animate-in fade-in slide-in-from-top-4">
              <label className="block text-gray-700 font-medium mb-3">Tipo de Actividad</label>
              <div className="grid grid-cols-2 gap-2">
                {eventTypes.map((event) => (
                  <button
                    key={event.type}
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: event.type })}
                    className={`p-3 rounded-xl border-2 transition-all ${formData.tipo === event.type
                      ? 'border-[#4A5D7C] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="text-2xl mb-1">{event.icon}</div>
                    <div className="text-sm text-gray-700">{event.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fecha y Horarios (Agrupados para ahorrar espacio visual) */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Fecha</label>
              <input
                type="date"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4A5D7C] outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Inicio</label>
                <input
                  type="time"
                  required
                  value={formData.horaInicio}
                  onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4A5D7C] outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Fin</label>
                <input
                  type="time"
                  required
                  value={formData.horaFin}
                  onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4A5D7C] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setUseSavedLocation(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${useSavedLocation
                  ? 'bg-[#4A5D7C] text-white shadow-md'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
                  }`}
              >
                <Navigation className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                Sitio Guardado
              </button>
              <button
                type="button"
                onClick={() => setUseSavedLocation(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${!useSavedLocation
                  ? 'bg-[#4A5D7C] text-white shadow-md'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
                  }`}
              >
                <MapPin className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                Nuevo Sitio
              </button>
            </div>

            {useSavedLocation ? (
              <div className="animate-in fade-in">
                <select
                  value={formData.sitioId}
                  onChange={(e) => handleSitioSelect(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A5D7C] focus:border-transparent outline-none bg-white font-medium text-gray-700"
                >
                  <option value="">-- Elija una ubicación para {currentEventLabel} --</option>
                  {filteredSitios.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                  {filteredSitios.length === 0 && (
                    <option disabled>No hay sitios registrados para esta categoría</option>
                  )}
                </select>
                {formData.sitioId && (
                  <p className="text-sm text-green-600 mt-2 flex items-center gap-1 font-medium bg-green-50 p-2 rounded-lg">
                    ✓ Ubicación seleccionada
                  </p>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in space-y-3">
                <input
                  type="text"
                  required={!useSavedLocation}
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value, sitioId: '' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A5D7C] focus:border-transparent outline-none"
                  placeholder="Ej: Plaza Principal"
                />
                <div className="rounded-xl overflow-hidden border border-gray-300">
                  <LocationPicker
                    onLocationSelect={(loc) => setFormData({ ...formData, coordenadas: loc, sitioId: '' })}
                    height="180px"
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">Arrastra el pin para ajustar</p>
              </div>
            )}
          </div>

          {/* Territorios (NUEVO) */}
          {formData.tipo !== 'congreso' && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">Territorio / Notas (Opcional)</label>
              <input
                type="text"
                value={formData.territorios}
                onChange={(e) => setFormData({ ...formData, territorios: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A5D7C] focus:border-transparent outline-none"
                placeholder="Ej: Mapas 12, 14 y 15"
              />
            </div>
          )}

          {/* Información Adicional Collapsible o Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Voluntarios</label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxVoluntarios}
                onChange={(e) => setFormData({ ...formData, maxVoluntarios: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A5D7C] outline-none"
              />
            </div>
            {/* Note: Titulo/Descripcion are less critical if site is selected, but kept for custom overrides */}
          </div>

          {/* Título (Auto-filled but editable) - Moving down as it's secondary to Location/Time */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">Título del Turno</label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A5D7C] outline-none bg-gray-50"
              placeholder={formData.ubicacion ? formData.ubicacion : "Ej: Predicación Pública"}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#4A5D7C] to-[#5B7FA6] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all transform active:scale-95"
            >
              Crear Actividad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
