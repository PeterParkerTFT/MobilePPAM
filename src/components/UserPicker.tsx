import React, { useState, useEffect } from 'react';
import { X, Search, User as UserIcon, Shield } from 'lucide-react';
import { User } from '../types/models';
import { UserRole, EnumHelpers } from '../types/enums';
import { getCongregacionNombre } from '../data/congregaciones';
import { useThemeColors } from '../hooks/useThemeColors';
import { supabase } from '../lib/supabase';

interface UserPickerProps {
    onClose: () => void;
    onSelect: (userId: string, userName: string) => void;
    title?: string;
}

export function UserPicker({ onClose, onSelect, title = "Seleccionar Capitán" }: UserPickerProps) {
    const colors = useThemeColors();
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            if (!supabase) return;

            // Filter only Capitan or Admins
            let q = supabase
                .from('users')
                .select('id, nombre, email, role, congregacion, congregacion_nombre')
                .in('role', [UserRole.Capitan, UserRole.AdminLocal, UserRole.AdminGlobal])
                .limit(20);

            if (query.length > 1) {
                q = q.ilike('nombre', `%${query}%`);
            }

            const { data, error } = await q;
            if (!error && data) {
                setUsers(data);
            }
            setLoading(false);
        };

        const debounce = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] animate-in fade-in p-4">
            <div
                className="w-full max-w-sm rounded-2xl shadow-xl overflow-hidden"
                style={{ backgroundColor: `rgb(${colors.bg.primary})` }}
            >
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: `rgb(${colors.ui.divider})` }}>
                    <h3 className="font-bold text-lg">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-3 border-b" style={{ borderColor: `rgb(${colors.ui.divider})` }}>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar capitán..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border border-transparent focus:border-blue-500"
                            style={{ paddingLeft: '3.5rem' }}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="max-h-[300px] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No se encontraron capitanes</div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: `rgb(${colors.ui.divider})` }}>
                            {users.map(u => {
                                const congName = u.congregacion_nombre || getCongregacionNombre(u.congregacion);
                                const displayCong = congName === 'Congregación no encontrada' ? 'Sin congregación asignada' : congName;

                                return (
                                    <button
                                        key={u.id}
                                        onClick={() => onSelect(u.id, u.nombre)}
                                        className="w-full p-3 flex items-center gap-3 hover:bg-black/5 transition-colors text-left group"
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${u.role === UserRole.AdminGlobal ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                                                {u.nombre}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {displayCong}
                                            </div>
                                            {/* Role Label */}
                                            <div className={`text-[10px] uppercase font-bold mt-0.5 ${u.role === UserRole.AdminGlobal ? 'text-purple-600' : 'text-blue-600'
                                                }`}>
                                                {EnumHelpers.getRoleLabel(u.role)}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
