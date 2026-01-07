import { supabase } from '../lib/supabase';
import { TurnoSesion, TurnoBase } from '../types/models';
import { UserRole } from '../types/enums';

export class TurnoService {
    /**
     * Obtiene los turnos disponibles para una fecha o rango.
     * Por simplicidad en MVP, traemos los turnos base y calculamos ocupación.
     */
    async getTurnosDisponibles(congregacionId?: string): Promise<TurnoSesion[]> {
        if (!supabase) throw new Error('Supabase no configurado');

        // 1. Obtener Turnos Base (Horarios)
        // Filtramos por congregación del sitio si es necesario
        let query = supabase
            .from('turnos')
            .select(`
        *,
        sitios!inner (id, nombre, congregacion_id),
        users (id, nombre)
      `);

        if (congregacionId) {
            // Filtro implícito por join con sitios
            query = query.eq('sitios.congregacion_id', congregacionId);
        }

        const { data: turnosData, error: turnosError } = await query;

        if (turnosError) throw turnosError;

        // 2. Mappear a modelo de UI
        // En una app real, aqui cruzariamos con 'turno_voluntarios' para ver cupos en fechas específicas.
        // Para este MVP, asumiremos que mostramos el "Horario General".

        return turnosData.map((t: any) => ({
            id: t.id,
            dia: t.dia,
            horarioInicio: t.horario_inicio,
            horarioFin: t.horario_fin,
            sitioId: t.sitio_id,
            sitioNombre: t.sitios.nombre,
            capitanId: t.capitan_id,
            capitanNombre: t.users?.nombre,
            voluntariosMax: t.voluntarios_max,
            fecha: new Date().toISOString().split('T')[0], // Placeholder: Hoy
            cupoActual: 0, // Placeholder
            estado: 'disponible',

            // Compatibilidad con interfaz vieja 'Turno'
            tipo: t.sitios.tipo || 'fijo',
            titulo: t.sitios.nombre,
            descripcion: `Turno de ${t.dia}`,
            horaInicio: t.horario_inicio.substring(0, 5),
            horaFin: t.horario_fin.substring(0, 5),
            grupoWhatsApp: '',
            ubicacion: t.sitios.nombre,
            voluntariosInscritos: [],
            cupoMaximo: t.voluntarios_max
        } as unknown as TurnoSesion));
    }

    async inscribirse(turnoId: string, userId: string, fecha: string): Promise<boolean> {
        const { error } = await supabase
            .from('turno_voluntarios')
            .insert({
                turno_id: turnoId,
                user_id: userId,
                fecha: fecha
            });

        if (error) {
            console.error(error);
            return false;
        }
        return true;
    }
}
