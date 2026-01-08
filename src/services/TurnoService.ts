import { supabase } from '../lib/supabase';
import { TurnoSesion, TurnoBase, ReporteTurno } from '../types/models';
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
        if (!supabase) throw new Error('Supabase no configurado');
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

    /**
     * Obtiene los reportes (asignaciones pasadas) del usuario.
     */
    async getReportesUsuario(userId: string): Promise<ReporteTurno[]> {
        if (!supabase) throw new Error('Supabase no configurado');

        const { data, error } = await supabase
            .from('turno_voluntarios')
            .select(`
                id,
                fecha,
                asistencia,
                comentarios,
                experiencia,
                fecha_reporte,
                turnos (
                    horario_inicio,
                    horario_fin,
                    sitios (
                        nombre,
                        tipo,
                        ubicacion: direccion
                    ),
                    users (
                        id,
                        nombre
                    )
                )
            `)
            .eq('user_id', userId)
            .lt('fecha', new Date().toISOString().split('T')[0]) // Solo pasados
            .order('fecha', { ascending: false });

        if (error) {
            console.error('Error fetching reportes:', error);
            return [];
        }

        return data.map((item: any) => {
            const status = item.fecha_reporte ? 'realizado' : 'pendiente';

            return {
                id: item.id,
                turnoId: item.turnos?.id, // Note: turno_id was not selected but relation was. Adjust query if needed.
                voluntarioId: userId,
                tipo: item.turnos?.sitios?.tipo || 'fijo',
                titulo: `Turno del ${item.fecha}`, // Generar titulo dinámico
                fecha: item.fecha,
                horaInicio: item.turnos?.horario_inicio,
                horaFin: item.turnos?.horario_fin,
                ubicacion: item.turnos?.sitios?.nombre,
                capitanId: item.turnos?.users?.id,
                capitanNombre: item.turnos?.users?.nombre,
                status: status,

                asistio: item.asistencia,
                comentarios: item.comentarios,
                experiencia: item.experiencia,
                fechaReporte: item.fecha_reporte
            } as ReporteTurno;
        });
    }

    /**
     * Obtiene TODAS las asignaciones para admin/stats
     */
    async getAllAsignaciones(): Promise<any[]> {
        if (!supabase) throw new Error('Supabase no configurado');

        const { data, error } = await supabase
            .from('turno_voluntarios')
            .select('id, user_id, fecha, fecha_reporte, asistencia, turno_id');

        if (error) {
            console.error('Error getting all asignaciones:', error);
            return [];
        }
        return data;
    }

    /**
     * Envía (actualiza) un reporte de turno.
     */
    async submitReport(reporte: Partial<ReporteTurno>): Promise<boolean> {
        if (!supabase) throw new Error('Supabase no configurado');
        if (!reporte.id) throw new Error('ID de reporte requerido');

        const { error } = await supabase
            .from('turno_voluntarios')
            .update({
                asistencia: reporte.asistio,
                comentarios: reporte.comentarios,
                experiencia: reporte.experiencia,
                fecha_reporte: new Date().toISOString().split('T')[0] // Set reported date
            })
            .eq('id', reporte.id);

        if (error) {
            console.error('Error submitting report:', error);
            return false;
        }
        return true;
    }

    async getMisTurnos(userId: string): Promise<TurnoSesion[]> {
        if (!supabase) throw new Error('Supabase no configurado');

        const { data, error } = await supabase
            .from('turno_voluntarios')
            .select(`
                fecha,
                turnos (
                    id,
                    horario_inicio,
                    horario_fin,
                    voluntarios_max,
                    sitios (
                        id,
                        nombre,
                        tipo,
                        direccion,
                        congregacion_id
                    ),
                    users (
                        id,
                        nombre,
                        telefono
                    )
                )
            `)
            .eq('user_id', userId)
            .gte('fecha', new Date().toISOString().split('T')[0])
            .order('fecha', { ascending: true });

        if (error) {
            console.error('Error fetching mis turnos:', error);
            return [];
        }

        return data.map((item: any) => ({
            id: item.turnos.id,
            fecha: item.fecha,
            dia: new Date(item.fecha).toLocaleDateString('es-ES', { weekday: 'long' }),
            horarioInicio: item.turnos.horario_inicio.substring(0, 5),
            horarioFin: item.turnos.horario_fin.substring(0, 5),
            sitioId: item.turnos.sitios.id,
            sitioNombre: item.turnos.sitios.nombre,
            capitanId: item.turnos.users?.id,
            capitanNombre: item.turnos.users?.nombre,
            voluntariosMax: item.turnos.voluntarios_max,
            cupoActual: 0, // Placeholder
            estado: 'disponible',
            misTurno: true,

            // UI Fields
            titulo: item.turnos.sitios.nombre,
            descripcion: 'Turno asignado',
            horaInicio: item.turnos.horario_inicio.substring(0, 5),
            horaFin: item.turnos.horario_fin.substring(0, 5),
            tipo: item.turnos.sitios.tipo,
            ubicacion: item.turnos.sitios.direccion || item.turnos.sitios.nombre,
            voluntariosInscritos: [userId],
            cupoMaximo: item.turnos.voluntarios_max,
            grupoWhatsApp: '' // TODO: Add if available
        } as TurnoSesion));
    }
}
