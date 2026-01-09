import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';
import { toast } from 'sonner';

export interface Notification {
    id: string;
    titulo: string;
    mensaje: string;
    tipo: 'info' | 'success' | 'warning' | 'error';
    leido: boolean;
    created_at: string;
}

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
    sendNotification: (userId: string, titulo: string, mensaje: string, tipo?: 'info' | 'success' | 'warning' | 'error') => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const { currentUser } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const unreadCount = notifications.filter(n => !n.leido).length;

    useEffect(() => {
        if (currentUser) {
            refreshNotifications();

            // Subscribe to real-time changes
            if (supabase) {
                const subscription = supabase
                    .channel('public:notificaciones')
                    .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notificaciones',
                        filter: `user_id=eq.${currentUser.id}`
                    }, (payload) => {
                        const newNotif = payload.new as Notification;
                        setNotifications(prev => [newNotif, ...prev]);

                        // Show toast
                        toast(newNotif.titulo, {
                            description: newNotif.mensaje,
                            // action: {
                            //   label: 'Ver',
                            //   onClick: () => console.log('Undo')
                            // }
                        });
                    })
                    .subscribe();

                return () => {
                    if (supabase) supabase.removeChannel(subscription);
                };
            }
        } else {
            setNotifications([]);
        }
    }, [currentUser]);

    const refreshNotifications = async () => {
        if (!currentUser || !supabase) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('notificaciones')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching notifications:', error);
        } else {
            setNotifications(data || []);
        }
        setLoading(false);
    };

    const markAsRead = async (id: string) => {
        if (!supabase) return;

        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));

        const { error } = await supabase
            .from('notificaciones')
            .update({ leido: true })
            .eq('id', id);

        if (error) {
            console.error('Error marking notification as read:', error);
            // Revert if needed, but low risk
        }
    };

    const markAllAsRead = async () => {
        if (!currentUser || !supabase) return;

        // Optimistic
        setNotifications(prev => prev.map(n => ({ ...n, leido: true })));

        const { error } = await supabase
            .from('notificaciones')
            .update({ leido: true })
            .eq('user_id', currentUser.id)
            .eq('leido', false);

        if (error) console.error(error);
    };

    const sendNotification = async (userId: string, titulo: string, mensaje: string, tipo: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        if (!supabase) return;

        const { error } = await supabase
            .from('notificaciones')
            .insert({
                user_id: userId,
                titulo,
                mensaje,
                tipo
            });

        if (error) console.error('Error sending notification:', error);
    };

    return (
        <NotificationsContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            markAsRead,
            markAllAsRead,
            refreshNotifications,
            sendNotification
        }}>
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
}
