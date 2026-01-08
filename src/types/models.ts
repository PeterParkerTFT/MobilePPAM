/**
 * Modelos de datos para el sistema PPAM
 * @description Interfaces y tipos para las entidades del dominio
 * @architecture SOLID - Interface Segregation Principle
 */

import { UserRole, UserStatus, EventType } from './enums';

/**
 * Metadata de auditoría para acciones administrativas
 */
export interface AuditMetadata {
  timestamp: string;        // ISO 8601 format
  userId: string;           // ID del usuario que ejecutó la acción
  userName: string;         // Nombre del usuario para referencia
  action: string;           // Descripción de la acción
}

/**
 * Usuario base del sistema
 */
export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  role: UserRole;
  status: UserStatus;
  congregacion: string;              // ID de congregación (REQUERIDO - incluso Ultra Admin tiene congregación de origen)
  congregacionNombre?: string;       // Nombre de congregación (denormalizado para performance)
  grupoAsignado?: string;
  capitanId?: string;

  // Auditoría
  createdAt?: string;
  updatedAt?: string;
  approvedBy?: AuditMetadata;     // Metadata de aprobación
  rejectedBy?: AuditMetadata;     // Metadata de rechazo
}

/**
 * Usuario pendiente de aprobación (vista simplificada)
 */
export interface PendingUser {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  role: UserRole;
  congregacion: string;
  congregacionNombre: string;
  especialidad?: string;
  fechaSolicitud: string;
}

/**
 * Filtros para consultas de usuarios
 */
export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  congregacion?: string;
  search?: string;
}

/**
 * Capitán del sistema
 */
export interface Capitan {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  congregacion: string;
  grupoWhatsApp: string;
  turnosAsignados: string[];
  especialidad: EventType;
}

/**
 * Turno/Evento PPAM
 */
// Old Turno interface removed


/**
 * Resultado de operaciones administrativas
 */
export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: AuditMetadata;
}

// ==========================================
// NUEVOS MODELOS (DATA ARCHITECTURE)
// ==========================================

export interface Congregacion {
  id: string;
  nombre: string;
  circuito?: string;
  ciudad?: string;
  estado: string; // [NEW] Added for UI compatibility
}

export interface Sitio {
  id: string;
  nombre: string;
  direccion?: string;
  coordenadas?: { lat: number; lng: number }; // Changed from string to object
  tipo: 'caminata' | 'fijo';
  congregacionId: string;
}

/**
 * Representa el horario "maestro" de un turno
 * (Ej: Lunes 8am, Plaza)
 */
export interface TurnoBase {
  id: string;
  dia: string; // 'Lunes', 'Martes'...
  horarioInicio: string; // '08:00'
  horarioFin: string; // '10:00'
  sitioId: string;
  sitioNombre?: string; // Denormalizado para UI
  capitanId?: string;
  capitanNombre?: string;
  voluntariosMax: number;
}

/**
 * Representa un turno en un día específico con asignaciones
 */
export interface TurnoSesion extends TurnoBase {
  fecha: string; // '2024-10-25'
  cupoActual: number;
  estado: 'disponible' | 'limitado' | 'completo'; // Added 'limitado'
  misTurno?: boolean; // Si el usuario actual está inscrito

  // UI / Compatibilidad Legacy
  voluntariosInscritos: string[];
  cupoMaximo?: number; // Alias de voluntariosMax
  titulo?: string;
  descripcion?: string;
  horaInicio?: string;
  horaFin?: string;
  tipo?: 'caminata' | 'fijo';
  ubicacion?: string;
  grupoWhatsApp?: string;
}

// Alias para compatibilidad con componentes existentes
// Alias para compatibilidad con componentes existentes
export type Turno = TurnoSesion;

export interface Informe {
  id: string;
  userId: string;
  mes: number;
  anio: number;
  horas: number;
  publicaciones: number;
  videos: number;
  revisitas: number;
  cursos: number;
  observaciones?: string;
  estado: 'borrador' | 'enviado' | 'aprobado';
}

/**
 * Reporte de un turno específico (Feedback del voluntario)
 */
export interface ReporteTurno {
  id: string; // ID de la asignación (turno_voluntarios.id)
  turnoId: string;
  voluntarioId: string;
  voluntarioNombre?: string;
  tipo: 'caminata' | 'fijo' | string; // Permitir string para flexibilidad
  titulo: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  ubicacion: string;
  capitanId?: string;
  capitanNombre?: string;
  status: 'pendiente' | 'realizado';

  // Datos del reporte
  asistio?: boolean;
  comentarios?: string;
  experiencia?: string;
  fechaReporte?: string;
}