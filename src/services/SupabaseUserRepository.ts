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
            .maybeSingle();

        if (error) {
            console.error('Error buscando usuario por email:', error);
            return null;
        }

        return data ? this.mapToUser(data) : null;
    }

    async authenticate(email: string, password: string): Promise<User | null> {
        if (!supabase) throw new Error('Supabase no está configurado');

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Error de autenticación:', error);
            return null;
        }

        if (data.user) {
            // Fetch profile
            return this.findById(data.user.id);
        }

        return null;
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

    async create(user: Omit<User, 'id'>, password?: string): Promise<User> {
        if (!supabase) throw new Error('Supabase no está configurado');
        if (!password) throw new Error('Password requerido para crear usuario en Supabase');

        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: user.email,
            password: password,
            options: {
                data: {
                    nombre: user.nombre,
                    role: user.role,
                    congregacion: user.congregacion
                }
            }
        });

        if (authError) {
            console.error('Error creando Auth User:', authError);
            throw authError; // This will now be caught by LoginScreen and message shown
        }

        if (!authData.user) throw new Error('No se pudo crear el usuario');

        // 2. Insert into public.users
        const newUserProfile = {
            id: authData.user.id,
            ...user,
            congregacion: user.congregacion,
            congregacion_nombre: user.congregacionNombre
        };

        const { data: dbData, error: dbError } = await supabase
            .from('users')
            .upsert(newUserProfile)
            .select()
            .single();

        if (dbError) {
            console.error('Error creando perfil de usuario:', dbError);
            throw dbError;
        }

        return this.mapToUser(dbData);
    }

    async update(id: string, updates: Partial<User>): Promise<User> {
        if (!supabase) throw new Error('Supabase no está configurado');

        // Map camelCase to snake_case if needed
        const dbUpdates: any = { ...updates };
        if (updates.congregacionNombre) {
            dbUpdates.congregacion_nombre = updates.congregacionNombre;
            delete dbUpdates.congregacionNombre;
        }

        const { data, error } = await supabase
            .from('users')
            .update(dbUpdates)
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
        console.warn('Delete not fully implemented for Auth Users. Only removing profile.');

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
