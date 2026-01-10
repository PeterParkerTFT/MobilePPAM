import React from 'react';
import { User, FileText, X, ChevronRight, AlertCircle } from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';

interface PendingActionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigateToUsers: () => void;
    onNavigateToReports: () => void;
    userCount?: number;
    reportCount?: number;
}

export function PendingActionsModal({
    isOpen,
    onClose,
    onNavigateToUsers,
    onNavigateToReports,
    userCount,
    reportCount
}: PendingActionsModalProps) {
    const colors = useThemeColors();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div
                className="w-full max-w-sm rounded-2xl shadow-2xl transform transition-all scale-100"
                style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
            >
                {/* Header */}
                <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: `rgb(${colors.ui.border})` }}>
                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: `rgb(${colors.text.primary})` }}>
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        Centro de Pendientes
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-black/5 transition-colors"
                    >
                        <X className="w-5 h-5" style={{ color: `rgb(${colors.text.secondary})` }} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    <p className="text-sm mb-2 opacity-70 px-1" style={{ color: `rgb(${colors.text.secondary})` }}>
                        Selecciona qué deseas revisar:
                    </p>

                    {/* Users Option */}
                    <button
                        onClick={onNavigateToUsers}
                        className="w-full p-4 rounded-xl flex items-center justify-between group hover:brightness-95 transition-all"
                        style={{ backgroundColor: `rgb(${colors.bg.secondary})`, border: `1px solid rgb(${colors.ui.border})` }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold" style={{ color: `rgb(${colors.text.primary})` }}>Usuarios Pendientes</div>
                                <div className="text-xs opacity-60" style={{ color: `rgb(${colors.text.primary})` }}>
                                    Solicitudes de acceso o rol
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: `rgb(${colors.text.primary})` }} />
                    </button>

                    {/* Reports Option */}
                    <button
                        onClick={onNavigateToReports}
                        className="w-full p-4 rounded-xl flex items-center justify-between group hover:brightness-95 transition-all"
                        style={{ backgroundColor: `rgb(${colors.bg.secondary})`, border: `1px solid rgb(${colors.ui.border})` }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold" style={{ color: `rgb(${colors.text.primary})` }}>Informes / Reportes</div>
                                <div className="text-xs opacity-60" style={{ color: `rgb(${colors.text.primary})` }}>
                                    Informes por revisar
                                </div>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: `rgb(${colors.text.primary})` }} />
                    </button>
                </div>

                {/* Footer */}
                <div className="p-4 border-t" style={{ borderColor: `rgb(${colors.ui.border})` }}>
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-lg font-medium text-sm transition-colors hover:bg-black/5"
                        style={{ color: `rgb(${colors.text.secondary})` }}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
