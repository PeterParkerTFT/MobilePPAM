import { supabase } from '../lib/supabase';
import { TurnoSesion, TurnoBase, ReporteTurno } from '../types/models';
import { UserRole } from '../types/enums';
import { eventTypes } from '../constants/eventTypes';

export class TurnoService {
    /**
     * Obtiene los turnos disponibles para una fecha o rango.
     * Por simplicidad en MVP, traemos los turnos base y calculamos ocupación.
     */
    async getTurnosDisponibles(congregacionId?: string): Promise<TurnoSesion[]> {
        if (!supabase) throw new Error('Supabase no configurado');

        // 1. Obtener Templates (Turnos definidos en la semana)
        let query = supabase
            .from('turnos')
            .select(`
        *,
        sitios!inner (id, nombre, congregacion_id, coordenadas, tipo, event_type),
        users (id, nombre)
      `);

        if (congregacionId) {
            // [FIX] Allow Global Sites (null) + My Congregation
            // Usamos syntax explícita para tabla foránea 'sitios'
            query = query.or(`congregacion_id.eq.${congregacionId},congregacion_id.is.null`, { foreignTable: 'sitios' });
        }

        const { data: turnosTemplates, error: turnosError } = await query;
        if (turnosError) throw turnosError;

        console.log(`[DEBUG] Turnos fetched: ${turnosTemplates?.length}`, turnosTemplates);
        if (turnosTemplates?.length > 0) {
            console.log('[DEBUG] First template sample:', turnosTemplates[0]);
            console.log('[DEBUG] Template CongID:', turnosTemplates[0].sitios?.congregacion_id, 'Global:', turnosTemplates[0].sitios?.congregacion_id === null);
        }

        // 2. Generar instancias para rango ampliado (Pasado y Futuro)
        // [HISTORY FIX] Fetch past 30 days + next 7 days
        const PAST_DAYS = 30;
        const FUTURE_DAYS = 7;
        const upcomingTurnos: TurnoSesion[] = [];
        const today = new Date();
        const datesToCheck: string[] = [];

        // Generate range: Today - 30 -> Today + 7
        for (let i = -PAST_DAYS; i < FUTURE_DAYS; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            datesToCheck.push(date.toISOString().split('T')[0]);
        }

        // 3. Obtener inscripciones para todo el rango de fechas
        // Optimización: Una sola query para todas las fechas requeridas
        const { data: allInscripciones, error: inscError } = await supabase
            .from('turno_voluntarios')
            .select('turno_id, user_id, fecha')
            .in('fecha', datesToCheck);

        if (inscError) console.error("Error fetching inscriptions", inscError);

        // Map para búsqueda rápida: date_string -> { turno_id -> [user_ids] }
        const inscripcionesPorFecha: Record<string, Record<string, string[]>> = {};
        allInscripciones?.forEach((ins: any) => {
            if (!inscripcionesPorFecha[ins.fecha]) inscripcionesPorFecha[ins.fecha] = {};
            if (!inscripcionesPorFecha[ins.fecha][ins.turno_id]) inscripcionesPorFecha[ins.fecha][ins.turno_id] = [];
            inscripcionesPorFecha[ins.fecha][ins.turno_id].push(ins.user_id);
        });

        // 4. Construir lista plana de turnos iterando días
        for (const dateStr of datesToCheck) {
            // Determinar día de la semana para esta fecha (ej: 'lunes')
            // Ajustar zona horaria si es necesario, asumimos local date string 'YYYY-MM-DD' corresponde
            // Para obtener nombre de día seguro: crear fecha desde partes para evitar timezone drift
            const [y, m, d] = dateStr.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d); // Mes 0-indexed

            // Normalizar a minúsculas y quitar acentos si es necesario, dependiendo de cómo guarde la BD
            // BD guarda: 'lunes', 'martes', etc. (toLocaleDateString suele dar minúsculas)
            const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();

            // [SENIOR FIX] Robust String Normalization Helper
            const normalizeString = (str: string) => {
                return str.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                    .trim();
            };

            // Filtrar templates que caen en este día de la semana
            const matchingTemplates = turnosTemplates.filter((t: any) => {
                const templateDay = t.dia || '';
                const match = normalizeString(templateDay) === normalizeString(dayName);
                if (!match && dateStr.includes('2026')) {
                    console.log(`[DEBUG] No Match: TPL=${normalizeString(templateDay)} vs DAY=${normalizeString(dayName)} (${dateStr})`);
                }
                return match;
            });

            console.log(`[DEBUG] Date ${dateStr} (${dayName}): Matches ${matchingTemplates.length}`);

            matchingTemplates.forEach((t: any) => {
                const inscritos = inscripcionesPorFecha[dateStr]?.[t.id] || [];
                const cupoActual = inscritos.length;
                const cupoMax = t.voluntarios_max;

                let estado: 'disponible' | 'limitado' | 'completo' = 'disponible';
                if (cupoActual >= cupoMax) estado = 'completo';
                else if (cupoActual >= cupoMax * 0.8) estado = 'limitado';

                upcomingTurnos.push({
                    id: t.id,
                    dia: t.dia,
                    horarioInicio: t.horario_inicio,
                    horarioFin: t.horario_fin,
                    sitioId: t.sitio_id,
                    sitioNombre: t.sitios.nombre,
                    capitanId: t.capitan_id,
                    capitanNombre: t.users?.nombre,
                    voluntariosMax: cupoMax,
                    fecha: dateStr, // [CRITICAL] Instance specific date
                    cupoActual: cupoActual,
                    estado: estado,

                    // Frontend compatibility
                    tipo: t.sitios.event_type || t.sitios.tipo || 'fijo',
                    titulo: t.sitios.nombre,
                    descripcion: `${t.sitios.nombre} (${t.dia})`,
                    horaInicio: t.horario_inicio.substring(0, 5),
                    horaFin: t.horario_fin.substring(0, 5),
                    grupoWhatsApp: '',
                    ubicacion: t.sitios.nombre,
                    coordenadas: t.sitios.coordenadas,
                    voluntariosInscritos: inscritos,
                    cupoMaximo: cupoMax,
                    territorios: t.territorios
                } as unknown as TurnoSesion);
            });
        }

        return upcomingTurnos;
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

    async getSitios(congregacionId: string): Promise<any[]> {
        if (!supabase) throw new Error('Supabase no configurado');

        const { data, error } = await supabase
            .from('sitios')
            .select('*')
            // Fetch sites for this congregation OR global sites (null congregation)
            .or(`congregacion_id.eq.${congregacionId},congregacion_id.is.null`)
            .order('nombre');

        if (error) {
            console.error('Error fetching sitios:', error);
            return [];
        }
        return data;
    }

    /**
     * Crea un nuevo turno.
     * Estrategia: Crea un Sitio "Ad-Hoc" implícito para este turno para mantener integridad referencial sin cambiar esquema.
     */
    async createTurno(turno: any, congregacionId: string): Promise<boolean> {
        if (!supabase) throw new Error('Supabase no configurado');

        let sitioId = turno.sitioId;

        // 1. Crear el Sitio Implícito SI NO se seleccionó uno existente
        if (!sitioId) {
            const { data: sitioData, error: sitioError } = await supabase
                .from('sitios')
                .insert({
                    nombre: turno.ubicacion || 'Ubicación Personalizada',
                    direccion: turno.ubicacion,
                    tipo: 'fijo', // Default legacy type
                    event_type: turno.tipo, // [NEW] Save specific event type
                    congregacion_id: congregacionId,
                    coordenadas: turno.coordenadas ? { lat: turno.coordenadas.lat, lng: turno.coordenadas.lng } : null
                })
                .select()
                .single();

            if (sitioError) {
                console.error('Error creating linked site:', sitioError);
                throw sitioError;
            }
            sitioId = sitioData.id;
        }

        // 2. Crear el Turno
        const { error: turnoError } = await supabase
            .from('turnos')
            .insert({
                sitio_id: sitioId,
                // [FIX] Timezone-safe weekday calculation
                dia: (() => {
                    const [y, m, d] = turno.fecha.split('-').map(Number);
                    const date = new Date(y, m - 1, d);
                    return date.toLocaleDateString('es-ES', { weekday: 'long' });
                })(),
                horario_inicio: turno.horaInicio,
                horario_fin: turno.horaFin,
                voluntarios_max: turno.maxVoluntarios,
                capitan_id: null,
                territorios: turno.territorios // [NEW] Save territories
            });

        if (turnoError) {
            console.error('Error creating turno:', turnoError);
            throw turnoError;
        }

        return true;
    }
}
