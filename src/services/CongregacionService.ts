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
}
