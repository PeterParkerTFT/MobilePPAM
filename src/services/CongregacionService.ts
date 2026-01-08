import { supabase } from '../lib/supabase';
import { Congregacion, Sitio } from '../types/models';

export class CongregacionService {
    async findAll(): Promise<Congregacion[]> {
        if (!supabase) throw new Error('Supabase no configurado');

        const { data, error } = await supabase
            .from('congregaciones')
            .select('*')
            .order('nombre');

        if (error) {
            console.error('Error fetching congregaciones:', error);
            return [];
        }

        // Map database fields to model if necessary (snake_case -> camelCase)
        // assuming SQL uses lowercase naming which matches the DB schema I provided
        return data.map((item: any) => ({
            id: item.id,
            nombre: item.nombre,
            circuito: item.circuito,
            ciudad: item.ciudad,
            // Map 'estado' if it exists in DB schema but I defined 'ciudad' mostly
            // In my previous schema I didn't verify 'estado' column but 'ciudad' is there.
            // The Combobox uses 'estado' as well in filtering, I should probably add it to the DB schema or logic.
            // Looking at the SQL: "ciudad text". No "estado". I'll default it or map it.
            estado: 'NL' // Placeholder if not in DB
        } as any));
    }

    async getSitios(congregacionId: string): Promise<Sitio[]> {
        if (!supabase) throw new Error('Supabase no configurado');

        const { data, error } = await supabase
            .from('sitios')
            .select('*')
            .eq('congregacion_id', congregacionId);

        if (error) {
            console.error('Error fetching sitios:', error);
            return [];
        }

        return data.map((item: any) => ({
            id: item.id,
            nombre: item.nombre,
            direccion: item.direccion,
            coordenadas: item.coordenadas,
            tipo: item.tipo,
            congregacionId: item.congregacion_id
        }));
    }

    async getAllSitios(): Promise<Sitio[]> {
        if (!supabase) throw new Error('Supabase no configurado');

        const { data, error } = await supabase.from('sitios').select('*');

        if (error) {
            console.error('Error fetching all sitios:', error);
            return [];
        }

        return data.map((item: any) => ({
            id: item.id,
            nombre: item.nombre,
            direccion: item.direccion,
            coordenadas: item.coordenadas,
            tipo: item.tipo,
            congregacionId: item.congregacion_id
        }));
    }

    async create(congregacion: Omit<Congregacion, 'id'>): Promise<Congregacion | null> {
        if (!supabase) throw new Error('Supabase no configurado');

        const { data, error } = await supabase
            .from('congregaciones')
            .insert({
                nombre: congregacion.nombre,
                circuito: congregacion.circuito,
                ciudad: congregacion.ciudad
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating congregacion:', error);
            return null;
        }

        return {
            id: data.id,
            nombre: data.nombre,
            circuito: data.circuito,
            ciudad: data.ciudad,
            estado: 'NL'
        };
    }

    async update(id: string, congregacion: Partial<Congregacion>): Promise<Congregacion | null> {
        if (!supabase) throw new Error('Supabase no configurado');

        const updates: any = {};
        if (congregacion.nombre) updates.nombre = congregacion.nombre;
        if (congregacion.circuito) updates.circuito = congregacion.circuito;
        if (congregacion.ciudad) updates.ciudad = congregacion.ciudad;

        const { data, error } = await supabase
            .from('congregaciones')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating congregacion:', error);
            return null;
        }

        return {
            id: data.id,
            nombre: data.nombre,
            circuito: data.circuito,
            ciudad: data.ciudad,
            estado: 'NL'
        };
    }

    async delete(id: string): Promise<boolean> {
        if (!supabase) throw new Error('Supabase no configurado');

        const { error } = await supabase
            .from('congregaciones')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting congregacion:', error);
            return false;
        }

        return true;
    }

    async createSitio(sitio: Omit<Sitio, 'id'>): Promise<Sitio | null> {
        if (!supabase) throw new Error('Supabase no configurado');

        const { data, error } = await supabase
            .from('sitios')
            .insert({
                nombre: sitio.nombre,
                direccion: sitio.direccion,
                tipo: sitio.tipo,
                congregacion_id: sitio.congregacionId,
                coordenadas: sitio.coordenadas
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating sitio:', error);
            return null;
        }

        return {
            id: data.id,
            nombre: data.nombre,
            direccion: data.direccion,
            coordenadas: data.coordenadas,
            tipo: data.tipo,
            congregacionId: data.congregacion_id
        };
    }

    async updateSitio(id: string, sitio: Partial<Sitio>): Promise<Sitio | null> {
        if (!supabase) throw new Error('Supabase no configurado');

        const updates: any = {};
        if (sitio.nombre) updates.nombre = sitio.nombre;
        if (sitio.direccion) updates.direccion = sitio.direccion;
        if (sitio.tipo) updates.tipo = sitio.tipo;
        if (sitio.congregacionId) updates.congregacion_id = sitio.congregacionId;
        if (sitio.coordenadas) updates.coordenadas = sitio.coordenadas;

        const { data, error } = await supabase
            .from('sitios')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating sitio:', error);
            return null;
        }

        return {
            id: data.id,
            nombre: data.nombre,
            direccion: data.direccion,
            coordenadas: data.coordenadas,
            tipo: data.tipo,
            congregacionId: data.congregacion_id
        };
    }

    async deleteSitio(id: string): Promise<boolean> {
        if (!supabase) throw new Error('Supabase no configurado');

        const { error } = await supabase
            .from('sitios')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting sitio:', error);
            return false;
        }

        return true;
    }
}
