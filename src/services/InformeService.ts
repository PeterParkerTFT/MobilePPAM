import { supabase } from '../lib/supabase';
import { Informe } from '../types/models';

export class InformeService {
    async getMyInformes(userId: string): Promise<Informe[]> {
        if (!supabase) throw new Error('Supabase no configurado');

        const { data, error } = await supabase
            .from('informes')
            .select('*')
            .eq('user_id', userId)
            .order('anio', { ascending: false })
            .order('mes', { ascending: false });

        if (error) {
            console.error('Error fetching informes:', error);
            return [];
        }

        return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            mes: item.mes,
            anio: item.anio,
            horas: item.horas,
            publicaciones: item.publicaciones,
            videos: item.videos,
            revisitas: item.revisitas,
            cursos: item.cursos,
            observaciones: item.observaciones,
            estado: item.estado
        }));
    }

    async saveInforme(informe: Omit<Informe, 'id'>): Promise<boolean> {
        if (!supabase) throw new Error('Supabase no configurado');

        // Upsert based on user_id, mes, anio constraint
        const { error } = await supabase
            .from('informes')
            .upsert({
                user_id: informe.userId,
                mes: informe.mes,
                anio: informe.anio,
                horas: informe.horas,
                publicaciones: informe.publicaciones,
                videos: informe.videos,
                revisitas: informe.revisitas,
                cursos: informe.cursos,
                observaciones: informe.observaciones,
                estado: informe.estado
            }, { onConflict: 'user_id, mes, anio' });

        if (error) {
            console.error('Error saving informe:', error);
            return false;
        }

        return true;
    }
}
