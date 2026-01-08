/**
 * User Service - Lógica de negocio para gestión de usuarios
 * @description Servicio que encapsula la lógica de filtrado y aprobación de usuarios
 * @architecture SOLID - Dependency Inversion Principle
 */

import { User, PendingUser, UserFilters, OperationResult, AuditMetadata } from '../types/models';
import { UserRole, UserStatus, EnumHelpers } from '../types/enums';

/**
 * Interface para el repositorio de usuarios (abstracción)
 * Permite cambiar la implementación (mock, API, Supabase) sin afectar el servicio
 */
export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
  create(data: Omit<User, 'id'>, password?: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  authenticate?(email: string, password: string): Promise<User | null>;
}

/**
 * Servicio de gestión de usuarios
 */
export class UserService {
  constructor(private repository: IUserRepository) { }

  /**
   * Autentica un usuario por email y contraseña
   */
  async login(email: string, password: string): Promise<User | null> {
    if (this.repository.authenticate) {
      return this.repository.authenticate(email, password);
    }

    // Fallback for MockRepository if not implemented
    const user = await this.repository.findByEmail(email);
    if (!user) return null;
    return user;
  }

  /**
   * Actualiza el perfil de un usuario
   * @param id ID del usuario
   * @param data Datos a actualizar
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    return this.repository.update(id, data);
  }

  /**
   * Registra un nuevo usuario en el sistema
   */
  async registerUser(userData: Omit<User, 'id'>, password?: string): Promise<User> {
    return this.repository.create(userData, password);
  }

  /**
   * Obtiene usuarios pendientes de aprobación según el rol del usuario actual
   * @description Implementa lógica de seguridad basada en roles
   * 
   * SECURITY RULES:
   * - AdminGlobal: Ve TODOS los usuarios pendientes
   * - AdminLocal: Ve SOLO usuarios de SU congregación
   * - Otros roles: No tienen acceso
   * 
   * @param currentUser Usuario que realiza la consulta
   * @returns Lista de usuarios pendientes filtrados según permisos
   */
  async fetchPendingUsers(currentUser: User): Promise<PendingUser[]> {
    // Validar permisos
    if (!EnumHelpers.isAdmin(currentUser.role)) {
      throw new Error('UNAUTHORIZED: Solo administradores pueden ver solicitudes');
    }

    // Obtener todos los usuarios
    const allUsers = await this.repository.findAll();

    // Filtrar usuarios pendientes
    let pendingUsers = allUsers.filter(user =>
      user.status === UserStatus.Pendiente &&
      user.role === UserRole.Capitan // Solo capitanes requieren aprobación
    );

    // Aplicar filtro de seguridad según rol
    if (EnumHelpers.isLocalAdmin(currentUser.role)) {
      // AdminLocal: Solo ve su congregación
      if (!currentUser.congregacion) {
        throw new Error('INVALID_STATE: Admin Local debe tener congregación asignada');
      }

      pendingUsers = pendingUsers.filter(user =>
        user.congregacion === currentUser.congregacion
      );
    }
    // AdminGlobal: Ve todos (no se filtra)

    // Mapear a formato simplificado para la vista
    return pendingUsers.map(user => ({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      telefono: user.telefono,
      role: user.role,
      congregacion: user.congregacion || '',
      congregacionNombre: user.congregacionNombre || 'Sin congregación',
      fechaSolicitud: user.createdAt || new Date().toISOString(),
    }));
  }

  /**
   * Aprueba un usuario (capitán) con trazabilidad completa
   * @description Inyecta metadata de auditoría en la aprobación
   * 
   * @param userId ID del usuario a aprobar
   * @param currentUser Usuario que ejecuta la aprobación
   * @returns Resultado de la operación con metadata
   */
  async approveUser(
    userId: string,
    currentUser: User
  ): Promise<OperationResult<User>> {
    try {
      // Validar permisos
      if (!EnumHelpers.isAdmin(currentUser.role)) {
        return {
          success: false,
          error: 'UNAUTHORIZED: Solo administradores pueden aprobar usuarios',
        };
      }

      // Obtener usuario a aprobar
      const userToApprove = await this.repository.findById(userId);

      if (!userToApprove) {
        return {
          success: false,
          error: 'NOT_FOUND: Usuario no encontrado',
        };
      }

      // Validar que sea capitán pendiente
      if (userToApprove.role !== UserRole.Capitan) {
        return {
          success: false,
          error: 'INVALID_OPERATION: Solo capitanes requieren aprobación',
        };
      }

      if (userToApprove.status !== UserStatus.Pendiente) {
        return {
          success: false,
          error: 'INVALID_STATE: Usuario no está pendiente de aprobación',
        };
      }

      // Validar permisos de congregación (AdminLocal)
      if (EnumHelpers.isLocalAdmin(currentUser.role)) {
        if (userToApprove.congregacion !== currentUser.congregacion) {
          return {
            success: false,
            error: 'FORBIDDEN: No tiene permisos para aprobar usuarios de otra congregación',
          };
        }
      }

      // Crear metadata de auditoría
      const auditMetadata: AuditMetadata = {
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.nombre,
        action: `Aprobación de capitán por ${EnumHelpers.getRoleLabel(currentUser.role)}`,
      };

      // Actualizar usuario
      const updatedUser = await this.repository.update(userId, {
        status: UserStatus.Aprobado,
        approvedBy: auditMetadata,
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        data: updatedUser,
        metadata: auditMetadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Rechaza un usuario (capitán) con trazabilidad completa
   * @description Inyecta metadata de auditoría en el rechazo
   * 
   * @param userId ID del usuario a rechazar
   * @param currentUser Usuario que ejecuta el rechazo
   * @param reason Razón del rechazo (opcional)
   * @returns Resultado de la operación con metadata
   */
  async rejectUser(
    userId: string,
    currentUser: User,
    reason?: string
  ): Promise<OperationResult<User>> {
    try {
      // Validar permisos (misma lógica que aprobar)
      if (!EnumHelpers.isAdmin(currentUser.role)) {
        return {
          success: false,
          error: 'UNAUTHORIZED: Solo administradores pueden rechazar usuarios',
        };
      }

      const userToReject = await this.repository.findById(userId);

      if (!userToReject) {
        return {
          success: false,
          error: 'NOT_FOUND: Usuario no encontrado',
        };
      }

      // Validar permisos de congregación (AdminLocal)
      if (EnumHelpers.isLocalAdmin(currentUser.role)) {
        if (userToReject.congregacion !== currentUser.congregacion) {
          return {
            success: false,
            error: 'FORBIDDEN: No tiene permisos para rechazar usuarios de otra congregación',
          };
        }
      }

      // Crear metadata de auditoría
      const auditMetadata: AuditMetadata = {
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.nombre,
        action: reason
          ? `Rechazo de capitán por ${EnumHelpers.getRoleLabel(currentUser.role)}: ${reason}`
          : `Rechazo de capitán por ${EnumHelpers.getRoleLabel(currentUser.role)}`,
      };

      // Actualizar usuario
      const updatedUser = await this.repository.update(userId, {
        status: UserStatus.Rechazado,
        rejectedBy: auditMetadata,
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        data: updatedUser,
        metadata: auditMetadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Busca usuarios con filtros
   * @description Aplica filtros de seguridad automáticamente
   */
  async searchUsers(
    filters: UserFilters,
    currentUser: User
  ): Promise<User[]> {
    const allUsers = await this.repository.findAll();

    let filteredUsers = allUsers;

    // Aplicar filtro de seguridad por congregación
    if (EnumHelpers.isLocalAdmin(currentUser.role) && currentUser.congregacion) {
      filteredUsers = filteredUsers.filter(u => u.congregacion === currentUser.congregacion);
    }

    // Aplicar filtros adicionales
    if (filters.role) {
      filteredUsers = filteredUsers.filter(u => u.role === filters.role);
    }

    if (filters.status) {
      filteredUsers = filteredUsers.filter(u => u.status === filters.status);
    }

    if (filters.congregacion) {
      filteredUsers = filteredUsers.filter(u => u.congregacion === filters.congregacion);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(u =>
        u.nombre.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      );
    }

    return filteredUsers;
  }
}

/**
 * Mock Repository para desarrollo
 * En producción, se reemplazaría por SupabaseUserRepository
 */
export class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }

  async create(data: Omit<User, 'id'>, password?: string): Promise<User> {
    const newUser: User = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
    };
    this.users.push(newUser);
    return newUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    // Mock auth: accepts any password if user exists
    return this.findByEmail(email);
  }

  // Helper para tests
  seed(users: User[]): void {
    this.users = users;
  }
}
