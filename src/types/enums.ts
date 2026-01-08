/**
 * Enums para el sistema PPAM
 * @description Definiciones de tipos enumerados para evitar strings mágicos
 * @architecture SOLID - Single Responsibility Principle
 */

/**
 * Roles de usuario en el sistema
 * @enum {string}
 */
export enum UserRole {
  Voluntario = 'VOLUNTARIO',
  Capitan = 'CAPITAN',
  AdminLocal = 'ADMIN_LOCAL',     // Anciano de congregación específica
  AdminGlobal = 'ADMIN_GLOBAL',   // Ultra Admin con acceso total
}

/**
 * Estados de aprobación de usuarios
 * @enum {string}
 */
export enum UserStatus {
  Pendiente = 'PENDIENTE',
  Aprobado = 'ACTIVO',
  Rechazado = 'INACTIVO',
}

/**
 * Tipos de eventos PPAM
 * @enum {string}
 */
export enum EventType {
  Expositores = 'EXPOSITORES',
  Guias = 'GUIAS',
  Escuelas = 'ESCUELAS',
  Editoriales = 'EDITORIALES',
  Encuestas = 'ENCUESTAS',
  Bodega = 'BODEGA',
}

/**
 * Helper functions para trabajar con enums
 */
export const EnumHelpers = {
  /**
   * Verifica si un usuario es administrador (local o global)
   */
  isAdmin: (role: UserRole): boolean => {
    return role === UserRole.AdminLocal || role === UserRole.AdminGlobal;
  },

  /**
   * Verifica si un usuario es administrador global
   */
  isGlobalAdmin: (role: UserRole): boolean => {
    return role === UserRole.AdminGlobal;
  },

  /**
   * Verifica si un usuario es administrador local
   */
  isLocalAdmin: (role: UserRole): boolean => {
    return role === UserRole.AdminLocal;
  },

  /**
   * Obtiene el label legible de un rol
   */
  getRoleLabel: (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      [UserRole.Voluntario]: 'Voluntario',
      [UserRole.Capitan]: 'Capitán',
      [UserRole.AdminLocal]: 'Administrador Local',
      [UserRole.AdminGlobal]: 'Administrador Global',
    };
    return labels[role];
  },

  /**
   * Obtiene el label legible de un status
   */
  getStatusLabel: (status: UserStatus): string => {
    const labels: Record<UserStatus, string> = {
      [UserStatus.Pendiente]: 'Pendiente',
      [UserStatus.Aprobado]: 'Aprobado',
      [UserStatus.Rechazado]: 'Rechazado',
    };
    return labels[status];
  },

  /**
   * Obtiene el label legible de un tipo de evento
   */
  getEventTypeLabel: (type: EventType): string => {
    const labels: Record<EventType, string> = {
      [EventType.Expositores]: 'Expositores',
      [EventType.Guias]: 'Guías',
      [EventType.Escuelas]: 'Escuelas',
      [EventType.Editoriales]: 'Editoriales',
      [EventType.Encuestas]: 'Encuestas',
      [EventType.Bodega]: 'Bodega',
    };
    return labels[type];
  },
};
