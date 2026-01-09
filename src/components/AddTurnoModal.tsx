import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Calendar, Clock } from 'lucide-react';
import { User } from '../types/models';
import { LocationPicker } from './LocationPicker';
import { TurnoService } from '../services/TurnoService';
import { CongregacionService } from '../services/CongregacionService'; // [NEW]
import { eventTypes as globalEventTypes, getEventColor, getEventType } from '../constants/eventTypes';

type EventType = 'predicacion' | 'construccion' | 'congreso' | 'mantenimiento' | 'expositores' | 'limpieza' | 'hospitalidad' | string;

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
  territorios?: string;
}

interface AddTurnoModalProps {
  onClose: () => void;
  onAdd: (turno: Turno) => void;
  user: User;
  initialEventType?: string;
}

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
    territorios: ''
  });

  const [availableSitios, setAvailableSitios] = useState<any[]>([]);
  const [useSavedLocation, setUseSavedLocation] = useState(true);

  // Services
  // const turnoService = new TurnoService(); // We use this for creating, but cong service for creating sites or fetching sites now
  const congregacionService = new CongregacionService();

  useEffect(() => {
    // Load ALL sites to ensure consistency with Map view
    congregacionService.getAllSitios().then(setAvailableSitios);
  }, []);

  // Filter sites logic - robust fuzzy matching
  const filteredSitios = availableSitios.filter(s => {
    if (s.eventType) {
      if (s.eventType === formData.tipo) return true;
      const currentEvent = globalEventTypes.find(e => e.id === formData.tipo);
      if (currentEvent) {
        const normalize = (str: string) => str.toLowerCase().trim();
        const siteType = normalize(s.eventType);
        if (normalize(currentEvent.label).includes(siteType) || siteType.includes(normalize(currentEvent.label))) return true;
        if (formData.tipo === 'expositores' && (siteType === 'ppam' || siteType.includes('expositor'))) return true;
        if (formData.tipo === 'predicacion' && siteType.includes('publica')) return true;
        if (formData.tipo === 'carrito' && siteType.includes('testigo')) return true;
      }
      return false;
    }
    return true; // Show legacy sites
  });

  // [UX IMPROVEMENT] Auto-switch to "Nuevo Sitio" if no saved sites match
  useEffect(() => {
    if (availableSitios.length > 0 && filteredSitios.length === 0) {
      setUseSavedLocation(false);
    }
  }, [availableSitios.length, filteredSitios.length]);

  const handleSitioSelect = (sitioId: string) => {
    const sitio = availableSitios.find(s => s.id === sitioId);
    if (sitio) {
      setFormData({
        ...formData,
        sitioId: sitio.id,
        ubicacion: sitio.nombre,
        coordenadas: sitio.coordenadas,
      });
    } else {
      setFormData({ ...formData, sitioId: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalSitioId = formData.sitioId;

    // Logic to save NEW site if created
    if (!useSavedLocation && formData.ubicacion) {
      try {
        const newSitio = await congregacionService.createSitio({
          nombre: formData.ubicacion,
          direccion: '', // Optional
          tipo: 'fijo', // [FIX] Use a valid type from the model (caminata | fijo) - 'Punto de Encuentro' was invalid
          eventType: formData.tipo as any, // [FIX] Cast string to expected generic type
          // We don't have coords from input unless we add logic, but coords are in formData.coordenadas
          coordenadas: formData.coordenadas
        });

        if (newSitio) {
          finalSitioId = newSitio.id;
        }
      } catch (error) {
        console.error("Error saving new site automatically:", error);
        // Continue anyway, just without linking a persistent site ID (fallback to string location)
      }
    }

    const newTurno: Turno = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      sitioId: finalSitioId, // Use the newly created ID
      voluntarios: 0,
      coordinador: user.nombre,
      inscritos: []
    };

    onAdd(newTurno);
  };

  // UI Helpers
  const currentEventLabel = globalEventTypes.find(e => e.id === formData.tipo)?.label || 'Actividad';
  const headerColor = getEventColor(formData.tipo);
  const rgbColor = headerColor; // Assuming getEventColor returns "R, G, B" string

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center z-50 animate-in fade-in duration-200">

      {/* Main Container - Fixed Height Layout */}
      <div className="w-full max-w-[428px] bg-white rounded-t-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">

        {/* FIXED HEADER (Outside Scroll) */}
        <div
          className="relative px-6 py-5 rounded-t-3xl shadow-md z-20 flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, rgb(${rgbColor}) 0%, rgba(${rgbColor}, 0.8) 100%)`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="text-white">
              <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-0.5">Nueva Actividad</p>
              <h2 className="text-2xl font-bold tracking-tight">{currentEventLabel}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-md"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE FORM CONTENT */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6 bg-gray-50/50">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Fecha y Horarios - Modern Card */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Fecha
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full p-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-[rgb(var(--color-primary))] text-gray-900 font-medium outline-none transition-all"
                  style={{ '--color-primary': rgbColor } as any}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Inicio
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    className="w-full p-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-[rgb(var(--color-primary))] text-gray-900 font-medium outline-none transition-all text-center"
                    style={{ '--color-primary': rgbColor } as any}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Fin
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.horaFin}
                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                    className="w-full p-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-[rgb(var(--color-primary))] text-gray-900 font-medium outline-none transition-all text-center"
                    style={{ '--color-primary': rgbColor } as any}
                  />
                </div>
              </div>
            </div>

            {/* Ubicación Section */}
            <div>
              <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setUseSavedLocation(true)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all shadow-sm ${useSavedLocation
                    ? 'bg-white text-gray-900 shadow'
                    : 'bg-transparent text-gray-500 hover:text-gray-700 shadow-none'
                    }`}
                >
                  <Navigation className={`w-4 h-4 inline-block mr-1.5 -mt-0.5 ${useSavedLocation ? 'text-[rgb(var(--color-primary))]' : ''}`} style={{ '--color-primary': rgbColor } as any} />
                  Sitio Guardado
                </button>
                <button
                  type="button"
                  onClick={() => setUseSavedLocation(false)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all shadow-sm ${!useSavedLocation
                    ? 'bg-white text-gray-900 shadow'
                    : 'bg-transparent text-gray-500 hover:text-gray-700 shadow-none'
                    }`}
                >
                  <MapPin className={`w-4 h-4 inline-block mr-1.5 -mt-0.5 ${!useSavedLocation ? 'text-[rgb(var(--color-primary))]' : ''}`} style={{ '--color-primary': rgbColor } as any} />
                  Nuevo Sitio
                </button>
              </div>

              {useSavedLocation ? (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <div className="relative">
                    <select
                      value={formData.sitioId}
                      onChange={(e) => handleSitioSelect(e.target.value)}
                      className="w-full pl-4 pr-10 py-4 border-0 bg-white shadow-sm ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-[rgb(var(--color-primary))] outline-none appearance-none font-medium text-gray-700 transition-all"
                      style={{ '--color-primary': rgbColor } as any}
                    >
                      <option value="">Seleccionar ubicación...</option>
                      {filteredSitios.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                  </div>

                  {filteredSitios.length === 0 && (
                    <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
                      No se encontraron sitios guardados específicos para {currentEventLabel}. Puedes crear uno nuevo.
                    </p>
                  )}
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-200 space-y-4">
                  <input
                    type="text"
                    required
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value, sitioId: '' })}
                    className="w-full px-4 py-3 border-0 bg-white shadow-sm ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-[rgb(var(--color-primary))] outline-none transition-all"
                    style={{ '--color-primary': rgbColor } as any}
                    placeholder="Nombre del lugar (Ej: Plaza Principal)"
                  />
                  <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 ring-4 ring-white">
                    <LocationPicker
                      onLocationSelect={(loc) => setFormData({ ...formData, coordenadas: loc, sitioId: '' })}
                      height="200px"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3" /> Arrastra el marcador a la ubicación exacta
                  </p>
                </div>
              )}
            </div>

            {/* Optional Fields Group */}
            <div className="space-y-4">
              {/* Territorios */}
              {formData.tipo !== 'congreso' && (
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Territorio / Notas</label>
                  <input
                    type="text"
                    value={formData.territorios}
                    onChange={(e) => setFormData({ ...formData, territorios: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-0 shadow-sm ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-[rgb(var(--color-primary))] outline-none transition-all"
                    style={{ '--color-primary': rgbColor } as any}
                    placeholder="Ej: Mapas 12, 14 y 15 (Opcional)"
                  />
                </div>
              )}

              {/* Voluntarios */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Cupo Máximo</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.maxVoluntarios}
                  onChange={(e) => setFormData({ ...formData, maxVoluntarios: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white border-0 shadow-sm ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-[rgb(var(--color-primary))] outline-none transition-all"
                  style={{ '--color-primary': rgbColor } as any}
                />
              </div>

              {/* Título (Hidden/Auto unless user wants to edit?) - Keeping visible for freedom */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">Título Personalizado</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-0 ring-1 ring-gray-200 rounded-xl focus:ring-2 focus:ring-[rgb(var(--color-primary))] outline-none transition-all"
                  style={{ '--color-primary': rgbColor } as any}
                  placeholder={formData.ubicacion ? formData.ubicacion : `Turno ${currentEventLabel}`}
                />
              </div>
            </div>

            {/* Spacer for button */}
            <div className="h-4"></div>

          </form>
        </div>

        {/* FOOTER BUTTONS (Fixed at bottom of modal) */}
        <div className="p-4 bg-white border-t border-gray-100 rounded-b-3xl">
          <button
            onClick={(e) => handleSubmit(e as any)}
            type="button"
            className="w-full text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(to right, rgb(${rgbColor}), rgba(${rgbColor}, 0.8))`
            }}
          >
            Crear Actividad
          </button>
        </div>
      </div>
    </div>
  );
}
