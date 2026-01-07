import { IUserRepository } from './userService';
import { User, PendingUser } from '../types/models';
import { supabase } from '../lib/supabase';
import { UserRole, UserStatus } from '../types/enums';

export class SupabaseUserRepository implements IUserRepository {
    async findByEmail(email: string): Promise<User | null> {
        if (!supabase) throw new Error('Supabase no está configurado');

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Error buscando usuario por email:', error);
            return null;
        }

        return this.mapToUser(data);
    }

    async findById(id: string): Promise<User | null> {
        if (!supabase) throw new Error('Supabase no está configurado');

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('Error buscando usuario por ID:', error);
            return null;
        }

        return this.mapToUser(data);
    }

    async findAll(): Promise<User[]> {
        if (!supabase) throw new Error('Supabase no está configurado');

        const { data, error } = await supabase
            .from('users')
            .select('*');

        if (error) {
            console.error('Error buscando todos los usuarios:', error);
            return [];
        }

        return data.map(this.mapToUser);
    }

    async search(query: { role?: UserRole; congregacion?: string; status?: UserStatus }): Promise<User[]> {
        if (!supabase) throw new Error('Supabase no está configurado');

        let dbQuery = supabase.from('users').select('*');

        if (query.role) dbQuery = dbQuery.eq('role', query.role);
        if (query.congregacion) dbQuery = dbQuery.eq('congregacion', query.congregacion);
        if (query.status) dbQuery = dbQuery.eq('status', query.status);

        const { data, error } = await dbQuery;

        if (error) {
            console.error('Error buscando usuarios:', error);
            return [];
        }

        return data.map(this.mapToUser);
    }

    async create(user: Omit<User, 'id'>): Promise<User> {
        if (!supabase) throw new Error('Supabase no está configurado');

        const { data, error } = await supabase
            .from('users')
            .insert(user)
            .select()
            .single();

        if (error) {
            console.error('Error creando usuario:', error);
            throw error;
        }

        return this.mapToUser(data);
    }

    async update(id: string, updates: Partial<User>): Promise<User> {
        if (!supabase) throw new Error('Supabase no está configurado');

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error actualizando usuario:', error);
            throw error;
        }

        return this.mapToUser(data);
    }

    async delete(id: string): Promise<boolean> {
        if (!supabase) throw new Error('Supabase no está configurado');

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error eliminando usuario:', error);
            return false;
        }
        return true;
    }

    async createPending(user: Omit<PendingUser, 'id' | 'fechaSolicitud' | 'status'>): Promise<PendingUser> {
        if (!supabase) throw new Error('Supabase no está configurado');

        const newPending = {
            ...user,
            status: UserStatus.Pendiente,
            fechaSolicitud: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('pending_users')
            .insert(newPending)
            .select()
            .single();

        if (error) {
            console.error('Error creando solicitud pendiente:', error);
            throw error;
        }

        return data as PendingUser;
    }

    async checkPendingStatus(email: string): Promise<'pending' | 'rejected' | null> {
        if (!supabase) throw new Error('Supabase no está configurado');

        const { data, error } = await supabase
            .from('pending_users')
            .select('status')
            .eq('email', email)
            .maybeSingle();

        if (error || !data) return null;

        if (data.status === UserStatus.Pendiente) return 'pending';
        if (data.status === UserStatus.Rechazado) return 'rejected';
        return null;
    }

    private mapToUser(dbUser: any): User {
        return {
            id: dbUser.id,
            nombre: dbUser.nombre,
            email: dbUser.email,
            telefono: dbUser.telefono,
            role: dbUser.role as UserRole,
            status: dbUser.status as UserStatus,
            congregacion: dbUser.congregacion,
            congregacionNombre: dbUser.congregacion_nombre,
        };
    }
}
