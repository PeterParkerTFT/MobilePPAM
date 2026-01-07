/**
 * Types Index - Punto de entrada único para tipos
 * @description Exporta los modelos y enums de la arquitectura SOLID
 */

export * from './enums';
export * from './models';

// Deprecated: Mantener solo si es estrictamente necesario para librerías externas
// pero idealmente deberíamos eliminar todo rastro de "Legacy"
export type UserRoleLegacy = 'admin' | 'capitan' | 'voluntario' | 'ultraadmin';
export type UserStatusLegacy = 'pendiente' | 'aprobado' | 'rechazado';
export type EventTypeLegacy = 'expositores' | 'guias' | 'escuelas' | 'editoriales' | 'encuestas' | 'bodega';