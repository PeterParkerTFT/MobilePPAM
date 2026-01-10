import React, { useEffect } from 'react'; // [FIX] Add useEffect
import { User } from '../types/models';
import { UserStatus } from '../types/enums';
import { ShieldAlert, LogOut, Clock } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';

interface PendingApprovalScreenProps {
    user: User;
    onLogout: () => void;
}

export function PendingApprovalScreen({ user, onLogout }: PendingApprovalScreenProps) {
    const { refreshUser } = useUser();

    // [LAYER 3] Realtime Auto-Unlock
    useEffect(() => {
        if (!supabase || !user.id) return;

        const channel = supabase
            .channel('public:users')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users',
                    filter: `id=eq.${user.id}`,
                },
                async (payload) => {
                    console.log('[PendingScreen] Received Realtime Update:', payload);
                    const newUser = payload.new as User;
                    // Check for Status 'ACTIVO' (Mapped to UserStatus.Aprobado)
                    if (newUser.status === UserStatus.Aprobado) {
                        console.log('[PendingScreen] User approved! Refreshing context...');
                        await refreshUser();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase?.removeChannel(channel);
        };
    }, [user.id]); // Removed refreshUser from deps loop to be safe, usually stable from context
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-yellow-500 p-6 flex justify-center">
                    <div className="bg-white/20 p-4 rounded-full">
                        <Clock className="w-12 h-12 text-white" strokeWidth={2} />
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Solicitud Pendiente
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Hola <span className="font-semibold text-gray-900">{user.nombre}</span>, tu cuenta ha sido creada exitosamente pero aún requiere aprobación.
                    </p>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-8 text-left">
                        <div className="flex gap-3">
                            <ShieldAlert className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800">
                                    Estado: En Revisión
                                </p>
                                <p className="text-xs text-yellow-700 mt-1">
                                    Los administradores de tu congregación ({user.congregacionNombre || 'Asignada'}) revisarán tu solicitud pronto. Recibirás una notificación cuando sea aprobada.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onLogout}
                        className="flex items-center justify-center w-full gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* Footer */}
            <p className="fixed bottom-6 text-xs text-gray-400">
                Sistema PPAM
            </p>
        </div>
    );
}
