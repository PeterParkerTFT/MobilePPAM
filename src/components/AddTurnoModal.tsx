import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User } from '../App';

type EventType = 'predicacion' | 'construccion' | 'congreso' | 'mantenimiento' | 'limpieza' | 'hospitalidad';

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
  requisitos?: string;
  inscritos?: string[];
}

interface AddTurnoModalProps {
  onClose: () => void;
  onAdd: (turno: Turno) => void;
  user: User;
}

const eventTypes: { type: EventType; label: string; icon: string }[] = [
  { type: 'predicacion', label: 'Predicación', icon: '📖' },
  { type: 'construccion', label: 'Construcción', icon: '🏗️' },
  { type: 'congreso', label: 'Congresos', icon: '🎤' },
  { type: 'mantenimiento', label: 'Mantenimiento', icon: '🔧' },
  { type: 'limpieza', label: 'Limpieza', icon: '🧹' },
  { type: 'hospitalidad', label: 'Hospitalidad', icon: '🏠' }
];

export function AddTurnoModal({ onClose, onAdd, user }: AddTurnoModalProps) {
  const [formData, setFormData] = useState({
    tipo: 'predicacion' as EventType,
    titulo: '',
    descripcion: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    maxVoluntarios: 10,
    ubicacion: '',
    requisitos: ''
  });

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-[428px] bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-[#4A5D7C] to-[#5B7FA6] text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Nueva Actividad</h2>
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
          {/* Tipo */}
          <div>
            <label className="block text-gray-700 font-medium mb-3">Tipo de Actividad</label>
            <div className="grid grid-cols-2 gap-2">
              {eventTypes.map((event) => (
                <button
                  key={event.type}
                  type="button"
                  onClick={() => setFormData({ ...formData, tipo: event.type })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.tipo === event.type
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

          {/* Título */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Título</label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A5D7C] focus:border-transparent outline-none"
              placeholder="Ej: Predicación Pública - Centro"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Descripción</label>
            <textarea
              required
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A5D7C] focus:border-transparent outline-none min-h-[100px]"
              placeholder="Describe la actividad..."
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Fecha</label>
            <input
              type="date"
              required
              value={formData.fecha}
              onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A5D7C] focus:border-transparent outline-none"
            />
          </div>

          {/* Horarios */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Hora Inicio</label>
              <input
                type="time"
                required
                value={formData.horaInicio}
                onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A5D7C] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Hora Fin</label>
              <input
                type="time"
                required
                value={formData.horaFin}
                onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A5D7C] focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Ubicación</label>
            <input
              type="text"
              required
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A5D7C] focus:border-transparent outline-none"
              placeholder="Ej: Salón del Reino Central"
            />
          </div>

          {/* Max Voluntarios */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Máximo de Voluntarios</label>
            <input
              type="number"
              required
              min="1"
              value={formData.maxVoluntarios}
              onChange={(e) => setFormData({ ...formData, maxVoluntarios: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A5D7C] focus:border-transparent outline-none"
            />
          </div>

          {/* Requisitos */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Requisitos (Opcional)</label>
            <textarea
              value={formData.requisitos}
              onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4A5D7C] focus:border-transparent outline-none"
              placeholder="Ej: Traer ropa de trabajo"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#4A5D7C] to-[#5B7FA6] text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Crear Actividad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
