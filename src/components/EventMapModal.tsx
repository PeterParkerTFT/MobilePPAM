import React, { useEffect, useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { SharedMapComponent } from './SharedMapComponent';
import { CongregacionService } from '../services/CongregacionService';
import { Sitio } from '../types/models';

interface EventMapModalProps {
    eventType: string; // The selected event ID (e.g. 'caminata' which maps to EXPOSITORES, or direct event type)
    eventLabel: string;
    onClose: () => void;
    congregacionId?: string; // Optional: restrict to congregation
}

export function EventMapModal({ eventType, eventLabel, onClose, congregacionId }: EventMapModalProps) {
    const [sitios, setSitios] = useState<Sitio[]>([]);
    const [loading, setLoading] = useState(true);
    const congregacionService = new CongregacionService();

    useEffect(() => {
        loadSitios();
    }, [eventType]);

    const loadSitios = async () => {
        try {
            setLoading(true);
            const allSitios = await congregacionService.getAllSitios();

            const filtered = allSitios.filter(s => {
                if (s.eventType) {
                    return s.eventType.toLowerCase() === eventType.toLowerCase();
                }
                if (eventType === 'caminata' || eventType === 'expositores') {
                    return s.tipo === 'fijo' || s.tipo === 'caminata';
                }
                return true;
            });

            setSitios(filtered);
        } catch (error) {
            console.error('Error loading sites for map:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between p-4 border-b bg-white z-10 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Mapa: {eventLabel}
                    </h2>
                    <p className="text-xs text-gray-500">{sitios.length} ubicaciones disponibles</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <X className="w-6 h-6 text-gray-700" />
                </button>
            </div>

            <div className="flex-1 relative bg-gray-50">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <SharedMapComponent
                        markers={sitios
                            .filter(s => s.coordenadas)
                            .map(s => ({
                                id: s.id,
                                position: [s.coordenadas!.lat, s.coordenadas!.lng],
                                title: s.nombre,
                                description: s.direccion
                            }))}
                        height="100%"
                    />
                )}
            </div>

            <div className="p-4 bg-white border-t text-xs text-center text-gray-500">
                Mostrando solo puntos para: <b>{eventLabel}</b>
            </div>
        </div>
    );
}
