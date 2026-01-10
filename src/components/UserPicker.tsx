import React, { useState, useEffect } from 'react';
import { X, Search, User as UserIcon } from 'lucide-react';
import { User } from '../types/models';
import { UserService } from '../services/userService'; // Assuming you have a UserService exported or accessible
import { CongregacionService } from '../services/CongregacionService'; // Or wherever you get users
import { useThemeColors } from '../hooks/useThemeColors';

// NOTE: Ideally import an instantiated service or use a hook
// For MVP we might instantiate locally if not passed effectively
import { supabase } from '../lib/supabase';

interface UserPickerProps {
    onClose: () => void;
    onSelect: (userId: string, userName: string) => void;
    title?: string;
}

export function UserPicker({ onClose, onSelect, title = "Seleccionar Usuario" }: UserPickerProps) {
    const colors = useThemeColors();
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Quick fetch logic - Replace with UserService.searchUsers if robust
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            if (!supabase) return;

            let q = supabase.from('users').select('id, nombre, email').limit(20);

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
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* List */}
                <div className="max-h-[300px] overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-400 text-sm">Cargando...</div>
                    ) : users.length === 0 ? (
                        <div className="p-4 text-center text-gray-400 text-sm">No se encontraron usuarios</div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: `rgb(${colors.ui.divider})` }}>
                            {users.map(u => (
                                <button
                                    key={u.id}
                                    onClick={() => onSelect(u.id, u.nombre)}
                                    className="w-full p-3 flex items-center gap-3 hover:bg-black/5 transition-colors text-left"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <UserIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{u.nombre}</div>
                                        <div className="text-xs text-gray-500">{u.email}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
