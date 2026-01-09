import React, { useEffect, useState } from 'react';
import { SharedMapComponent, MapMarker } from '../components/SharedMapComponent';
import { CongregacionService } from '../services/CongregacionService';
import { Map, MapPin, Navigation } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';

const congregacionService = new CongregacionService();

export function UbicacionesScreen() {
    const [markers, setMarkers] = useState<MapMarker[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = async () => {
        try {
            // First get all sites
            const sitios = await congregacionService.getAllSitios();

            // Map sites to markers
            const siteMarkers: MapMarker[] = sitios
                .filter(s => s.coordenadas && s.coordenadas.lat && s.coordenadas.lng)
                .map(s => ({
                    id: s.id,
                    position: [s.coordenadas!.lat, s.coordenadas!.lng],
                    title: s.nombre,
                    description: s.direccion
                }));

            // Also get congregations (often they are the same location, but let's see)
            // Ideally we might want to show congregation meeting places too if they differ from 'sitios'
            // For now, let's stick to 'sitios' as they have coordinates defined in the service interface

            setMarkers(siteMarkers);
        } catch (error) {
            console.error("Error loading locations:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#FAFAFA] pb-20">
            {/* Header */}
            <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100 shadow-sm z-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[#594396]/10 rounded-lg">
                        <Map className="w-6 h-6 text-[#594396]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#333333]">Ubicaciones</h1>
                </div>
                <p className="text-[#666666] text-sm font-light pl-1">
                    Explora los puntos de predicación y congregaciones
                </p>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {/* Map Section */}
                    <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                        <SharedMapComponent
                            markers={markers}
                            height="400px"
                            className="rounded-lg z-0"
                        />
                    </div>

                    {/* List Section */}
                    <div>
                        <h2 className="text-lg font-semibold text-[#333333] mb-4 flex items-center gap-2 px-2">
                            <Navigation className="w-5 h-5 text-[#594396]" />
                            Sitios Disponibles ({markers.length})
                        </h2>

                        {loading ? (
                            <div className="text-center py-8 text-gray-400">Cargando ubicaciones...</div>
                        ) : markers.length === 0 ? (
                            <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-400">No hay ubicaciones registradas con coordenadas</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {markers.map(marker => (
                                    <div key={marker.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-[#594396] mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-medium text-[#333333]">{marker.title}</h3>
                                            <p className="text-sm text-[#666666] mt-1">{marker.description || 'Sin dirección registrada'}</p>
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                    {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
