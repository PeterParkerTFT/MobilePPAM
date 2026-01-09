import React, { useEffect, useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { SharedMapComponent } from './SharedMapComponent';
import { CongregacionService } from '../services/CongregacionService';
import { Sitio } from '../types/models';
import { getEventColor } from '../constants/eventTypes';

interface EventMapModalProps {
    eventType: string; // The selected event ID
    eventLabel: string;
    onClose: () => void;
    congregacionId?: string;
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
                // If the site has an explicit event type, check it
                if (s.eventType) {
                    return s.eventType.toLowerCase() === eventType.toLowerCase();
                }
                // Fallback for legacy sites (only if viewing PPAM/Expositores)
                if (eventType === 'caminata' || eventType === 'expositores') {
                    // Match sites that look like meeting points but have no event type
                    return s.tipo === 'fijo' || s.tipo === 'caminata' || s.tipo === 'Punto de Encuentro';
                }
                return false;
            });

            console.log(`Loaded ${filtered.length} sites for ${eventType}`);
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
                        <MapPin className="w-5 h-5" style={{ color: `rgb(${getEventColor(eventType)})` }} />
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: `rgb(${getEventColor(eventType)})` }}></div>
                    </div>
                ) : (
                    <SharedMapComponent
                        markers={sitios
                            .filter(s => {
                                // Robust check for coordinates
                                const coords = s.coordenadas;
                                if (!coords) return false;
                                // Handle string or number inputs safely
                                const lat = typeof coords.lat === 'string' ? parseFloat(coords.lat) : coords.lat;
                                const lng = typeof coords.lng === 'string' ? parseFloat(coords.lng) : coords.lng;
                                return !isNaN(lat) && !isNaN(lng);
                            })
                            .map(s => {
                                const lat = typeof s.coordenadas!.lat === 'string' ? parseFloat(s.coordenadas!.lat as any) : s.coordenadas!.lat;
                                const lng = typeof s.coordenadas!.lng === 'string' ? parseFloat(s.coordenadas!.lng as any) : s.coordenadas!.lng;
                                return {
                                    id: s.id,
                                    position: [lat, lng],
                                    title: s.nombre,
                                    description: s.direccion,
                                    color: `rgb(${getEventColor(s.eventType || eventType)})` // Resolve real color
                                };
                            })}
                        height="100%"
                        centerCoordinates={sitios.length > 0 && sitios[0].coordenadas ? [
                            typeof sitios[0].coordenadas.lat === 'string' ? parseFloat(sitios[0].coordenadas.lat as any) : sitios[0].coordenadas.lat,
                            typeof sitios[0].coordenadas.lng === 'string' ? parseFloat(sitios[0].coordenadas.lng as any) : sitios[0].coordenadas.lng
                        ] : undefined}
                    />
                )}
            </div>

            <div className="p-4 bg-white border-t text-xs text-center text-gray-500">
                Mostrando solo puntos para: <b>{eventLabel}</b>
            </div>
        </div>
    );
}
