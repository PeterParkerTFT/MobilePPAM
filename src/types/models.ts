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
export interface Turno {
  id: string;
  tipo: EventType;
  titulo: string;
  descripcion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  cupoMaximo: number;
  cupoActual: number;
  capitanId: string | null;
  capitanNombre: string | null;
  grupoWhatsApp: string;
  ubicacion: string;
  voluntariosInscritos: string[];
  estado: 'disponible' | 'limitado' | 'completo';
  necesitaCapitan?: boolean;
}

/**
 * Resultado de operaciones administrativas
 */
export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: AuditMetadata;
}