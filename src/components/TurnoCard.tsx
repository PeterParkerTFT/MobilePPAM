import React from 'react';
import { User, Turno } from '../types/models';
import { UserRole } from '../types/enums';
import { EventBadge } from './EventBadge';
import { Clock, MapPin, Users, ChevronRight, MessageCircle } from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';

interface TurnoCardProps {
    turno: Turno;
    userRole: UserRole;
    onClick: (turno: Turno) => void;
    isInscrito?: boolean;
    isCaptainAssigned?: boolean;
    showDateTitle?: boolean; // If true, shows date (e.g. "Viernes 12")
    compact?: boolean; // For "My Events" view maybe?
}

export function TurnoCard({
    turno,
    userRole,
    onClick,
    isInscrito = false,
    isCaptainAssigned = false,
    showDateTitle = true
}: TurnoCardProps) {
    const colors = useThemeColors();

    const getCupoColor = (turno: Turno) => {
        if (turno.estado === 'completo') return '#ef4444'; // Red
        if (turno.estado === 'limitado') return '#f59e0b'; // Amber
        return '#10b981'; // Green
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

    const cupoMax = turno.cupoMaximo || turno.voluntariosMax || 0;
    const progressPercent = Math.min(100, (turno.cupoActual / (cupoMax || 1)) * 100);

    return (
        <div
            onClick={() => onClick(turno)}
            className="rounded-lg p-3 flex flex-col gap-3 cursor-pointer hover:opacity-90 transition-all theme-transition relative"
            style={{
                backgroundColor: `rgb(${colors.bg.secondary})`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: `1px solid rgb(${colors.ui.border})`
            }}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <EventBadge tipo={turno.tipo || 'fijo'} variant="compact" showImage />
                        {isInscrito && (
                            <span className="text-green-500 text-xs font-bold bg-green-100 px-2 py-0.5 rounded-full">
                                INSCRITO ✅
                            </span>
                        )}
                        {isCaptainAssigned && (
                            <span className="text-indigo-500 text-xs font-bold bg-indigo-100 px-2 py-0.5 rounded-full">
                                TU TURNO 🎖️
                            </span>
                        )}
                    </div>

                    {showDateTitle && (
                        <div
                            className="text-sm font-semibold mb-1"
                            style={{ color: `rgb(${colors.text.primary})` }}
                        >
                            {formatDateTitle(turno.fecha)}
                        </div>
                    )}

                    <div
                        className="text-sm flex items-center gap-2"
                        style={{ color: `rgb(${colors.text.secondary})` }}
                    >
                        <Clock className="w-4 h-4" />
                        {turno.horaInicio} - {turno.horaFin}
                    </div>

                    <div className="text-sm flex items-center gap-2 mt-1" style={{ color: `rgb(${colors.text.secondary})` }}>
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-[200px]">{turno.ubicacion}</span>
                    </div>

                </div>

                <ChevronRight
                    className="w-5 h-5 flex-shrink-0 mt-2"
                    style={{ color: `rgb(${colors.text.tertiary})` }}
                />
            </div>

            {/* Cupo Bar */}
            <div className='w-full'>
                <div className="flex justify-between text-xs mb-1" style={{ color: `rgb(${colors.text.tertiary})` }}>
                    <span className='flex items-center gap-1'><Users className="w-3 h-3" /> Voluntarios</span>
                    <span className="font-medium">
                        {turno.cupoActual} / {cupoMax}
                    </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full transition-all duration-300 rounded-full"
                        style={{
                            width: `${progressPercent}%`,
                            backgroundColor: getCupoColor(turno)
                        }}
                    />
                </div>
            </div>

        </div>
    );
}
