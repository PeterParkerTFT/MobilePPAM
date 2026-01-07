/**
 * Ejemplos de uso del UserService
 * @description Demostraciones de cómo usar el servicio con diferentes roles
 */

import { UserService, MockUserRepository } from '../services/userService';
import { User } from '../types/models';
import { UserRole, UserStatus } from '../types/enums';

/**
 * EJEMPLO 1: Admin Local consulta solicitudes pendientes
 */
async function ejemploAdminLocal() {
  console.log('=== EJEMPLO 1: Admin Local ===\n');

  // Setup
  const repository = new MockUserRepository();
  const service = new UserService(repository);

  // Seed data
  const mockUsers: User[] = [
    {
      id: 'user-1',
      nombre: 'Pedro Ramírez',
      email: 'pedro@ejemplo.com',
      telefono: '+52 555 111 2222',
      role: UserRole.Capitan,
      status: UserStatus.Pendiente,
      congregacion: 'cong-001',
      congregacionNombre: 'Villa Guerrero',
      createdAt: '2025-01-03T10:00:00Z',
    },
    {
      id: 'user-2',
      nombre: 'María Fernández',
      email: 'maria@ejemplo.com',
      telefono: '+52 555 222 3333',
      role: UserRole.Capitan,
      status: UserStatus.Pendiente,
      congregacion: 'cong-002',
      congregacionNombre: 'Lomas de Polanco',
      createdAt: '2025-01-02T10:00:00Z',
    },
    {
      id: 'user-3',
      nombre: 'Carlos López',
      email: 'carlos@ejemplo.com',
      telefono: '+52 555 333 4444',
      role: UserRole.Capitan,
      status: UserStatus.Pendiente,
      congregacion: 'cong-001',
      congregacionNombre: 'Villa Guerrero',
      createdAt: '2025-01-01T10:00:00Z',
    },
  ];

  repository.seed(mockUsers);

  // Usuario actual: Admin Local de Villa Guerrero
  const adminLocal: User = {
    id: 'admin-1',
    nombre: 'Elder González',
    email: 'elder.gonzalez@ejemplo.com',
    telefono: '+52 555 000 0000',
    role: UserRole.AdminLocal,
    status: UserStatus.Aprobado,
    congregacion: 'cong-001',
    congregacionNombre: 'Villa Guerrero',
  };

  // Fetch pending users
  const pendingUsers = await service.fetchPendingUsers(adminLocal);

  console.log(`Admin Local: ${adminLocal.nombre}`);
  console.log(`Congregación: ${adminLocal.congregacionNombre}\n`);
  console.log(`Solicitudes pendientes visibles: ${pendingUsers.length}`);
  console.log('---');
  
  pendingUsers.forEach(user => {
    console.log(`✓ ${user.nombre} - ${user.congregacionNombre}`);
  });

  console.log('\nResultado esperado:');
  console.log('- Ve SOLO Pedro y Carlos (Villa Guerrero)');
  console.log('- NO ve María (Lomas de Polanco)\n');
}

/**
 * EJEMPLO 2: Admin Global consulta solicitudes pendientes
 */
async function ejemploAdminGlobal() {
  console.log('=== EJEMPLO 2: Admin Global ===\n');

  const repository = new MockUserRepository();
  const service = new UserService(repository);

  // Seed data (mismo que ejemplo 1)
  const mockUsers: User[] = [
    {
      id: 'user-1',
      nombre: 'Pedro Ramírez',
      email: 'pedro@ejemplo.com',
      telefono: '+52 555 111 2222',
      role: UserRole.Capitan,
      status: UserStatus.Pendiente,
      congregacion: 'cong-001',
      congregacionNombre: 'Villa Guerrero',
      createdAt: '2025-01-03T10:00:00Z',
    },
    {
      id: 'user-2',
      nombre: 'María Fernández',
      email: 'maria@ejemplo.com',
      telefono: '+52 555 222 3333',
      role: UserRole.Capitan,
      status: UserStatus.Pendiente,
      congregacion: 'cong-002',
      congregacionNombre: 'Lomas de Polanco',
      createdAt: '2025-01-02T10:00:00Z',
    },
    {
      id: 'user-3',
      nombre: 'Carlos López',
      email: 'carlos@ejemplo.com',
      telefono: '+52 555 333 4444',
      role: UserRole.Capitan,
      status: UserStatus.Pendiente,
      congregacion: 'cong-001',
      congregacionNombre: 'Villa Guerrero',
      createdAt: '2025-01-01T10:00:00Z',
    },
  ];

  repository.seed(mockUsers);

  // Usuario actual: Admin Global
  const adminGlobal: User = {
    id: 'admin-global-1',
    nombre: 'Supervisor Nacional',
    email: 'supervisor@ejemplo.com',
    telefono: '+52 555 999 9999',
    role: UserRole.AdminGlobal,
    status: UserStatus.Aprobado,
    // Sin congregación asignada
  };

  // Fetch pending users
  const pendingUsers = await service.fetchPendingUsers(adminGlobal);

  console.log(`Admin Global: ${adminGlobal.nombre}`);
  console.log(`Congregación: Todas\n`);
  console.log(`Solicitudes pendientes visibles: ${pendingUsers.length}`);
  console.log('---');
  
  pendingUsers.forEach(user => {
    console.log(`✓ ${user.nombre} - ${user.congregacionNombre}`);
  });

  console.log('\nResultado esperado:');
  console.log('- Ve TODOS: Pedro, María y Carlos');
  console.log('- Sin filtro de congregación\n');
}

/**
 * EJEMPLO 3: Aprobar usuario con trazabilidad
 */
async function ejemploAprobacion() {
  console.log('=== EJEMPLO 3: Aprobar Usuario con Trazabilidad ===\n');

  const repository = new MockUserRepository();
  const service = new UserService(repository);

  // Seed data
  const mockUsers: User[] = [
    {
      id: 'user-1',
      nombre: 'Pedro Ramírez',
      email: 'pedro@ejemplo.com',
      telefono: '+52 555 111 2222',
      role: UserRole.Capitan,
      status: UserStatus.Pendiente,
      congregacion: 'cong-001',
      congregacionNombre: 'Villa Guerrero',
      createdAt: '2025-01-03T10:00:00Z',
    },
  ];

  repository.seed(mockUsers);

  // Admin que aprueba
  const adminLocal: User = {
    id: 'admin-1',
    nombre: 'Elder González',
    email: 'elder.gonzalez@ejemplo.com',
    telefono: '+52 555 000 0000',
    role: UserRole.AdminLocal,
    status: UserStatus.Aprobado,
    congregacion: 'cong-001',
    congregacionNombre: 'Villa Guerrero',
  };

  console.log('Usuario a aprobar:');
  console.log(`- Nombre: Pedro Ramírez`);
  console.log(`- Status: PENDIENTE`);
  console.log(`- Congregación: Villa Guerrero\n`);

  console.log('Aprobado por:');
  console.log(`- Nombre: ${adminLocal.nombre}`);
  console.log(`- Rol: Admin Local`);
  console.log(`- Congregación: ${adminLocal.congregacionNombre}\n`);

  // Aprobar usuario
  const result = await service.approveUser('user-1', adminLocal);

  if (result.success && result.data && result.metadata) {
    console.log('✅ APROBACIÓN EXITOSA\n');
    console.log('Metadata de auditoría:');
    console.log(`- Timestamp: ${result.metadata.timestamp}`);
    console.log(`- Aprobado por ID: ${result.metadata.userId}`);
    console.log(`- Aprobado por Nombre: ${result.metadata.userName}`);
    console.log(`- Acción: ${result.metadata.action}`);
    console.log(`\nNuevo status: ${result.data.status}`);
    console.log(`approvedBy registrado: ✓`);
  } else {
    console.log('❌ ERROR:', result.error);
  }

  console.log('\nResultado esperado:');
  console.log('- Status cambia a APROBADO');
  console.log('- approvedBy contiene metadata completa');
  console.log('- timestamp, userId, userName registrados\n');
}

/**
 * EJEMPLO 4: Intentar aprobar sin permisos
 */
async function ejemploSinPermisos() {
  console.log('=== EJEMPLO 4: Intentar Aprobar Sin Permisos ===\n');

  const repository = new MockUserRepository();
  const service = new UserService(repository);

  // Usuario de otra congregación
  const mockUsers: User[] = [
    {
      id: 'user-1',
      nombre: 'Pedro Ramírez',
      email: 'pedro@ejemplo.com',
      telefono: '+52 555 111 2222',
      role: UserRole.Capitan,
      status: UserStatus.Pendiente,
      congregacion: 'cong-001',
      congregacionNombre: 'Villa Guerrero',
      createdAt: '2025-01-03T10:00:00Z',
    },
  ];

  repository.seed(mockUsers);

  // Admin de OTRA congregación
  const adminOtraCongregacion: User = {
    id: 'admin-2',
    nombre: 'Elder Martínez',
    email: 'elder.martinez@ejemplo.com',
    telefono: '+52 555 000 0001',
    role: UserRole.AdminLocal,
    status: UserStatus.Aprobado,
    congregacion: 'cong-002', // Lomas de Polanco
    congregacionNombre: 'Lomas de Polanco',
  };

  console.log('Intento de aprobación:');
  console.log(`- Usuario a aprobar: Pedro (Villa Guerrero)`);
  console.log(`- Admin que intenta: Elder Martínez (Lomas de Polanco)\n`);

  // Intentar aprobar
  const result = await service.approveUser('user-1', adminOtraCongregacion);

  if (!result.success) {
    console.log('❌ APROBACIÓN RECHAZADA (como se esperaba)\n');
    console.log(`Error: ${result.error}`);
  }

  console.log('\nResultado esperado:');
  console.log('- Error FORBIDDEN');
  console.log('- Admin Local solo puede aprobar de SU congregación\n');
}

/**
 * EJEMPLO 5: Admin Global puede aprobar cualquier congregación
 */
async function ejemploAdminGlobalAprueba() {
  console.log('=== EJEMPLO 5: Admin Global Aprueba Cualquier Congregación ===\n');

  const repository = new MockUserRepository();
  const service = new UserService(repository);

  const mockUsers: User[] = [
    {
      id: 'user-1',
      nombre: 'Pedro Ramírez',
      email: 'pedro@ejemplo.com',
      telefono: '+52 555 111 2222',
      role: UserRole.Capitan,
      status: UserStatus.Pendiente,
      congregacion: 'cong-001',
      congregacionNombre: 'Villa Guerrero',
      createdAt: '2025-01-03T10:00:00Z',
    },
  ];

  repository.seed(mockUsers);

  const adminGlobal: User = {
    id: 'admin-global-1',
    nombre: 'Supervisor Nacional',
    email: 'supervisor@ejemplo.com',
    telefono: '+52 555 999 9999',
    role: UserRole.AdminGlobal,
    status: UserStatus.Aprobado,
  };

  console.log('Aprobación global:');
  console.log(`- Usuario: Pedro (Villa Guerrero)`);
  console.log(`- Admin: Supervisor Nacional (Admin Global)\n`);

  const result = await service.approveUser('user-1', adminGlobal);

  if (result.success && result.metadata) {
    console.log('✅ APROBACIÓN EXITOSA\n');
    console.log('Admin Global puede aprobar de CUALQUIER congregación');
    console.log(`Aprobado por: ${result.metadata.userName}`);
  }

  console.log('\nResultado esperado:');
  console.log('- Admin Global aprueba sin restricción de congregación\n');
}

/**
 * Ejecutar todos los ejemplos
 */
export async function runAllExamples() {
  await ejemploAdminLocal();
  await ejemploAdminGlobal();
  await ejemploAprobacion();
  await ejemploSinPermisos();
  await ejemploAdminGlobalAprueba();
}

// Para ejecutar en desarrollo:
// import { runAllExamples } from './examples/userServiceExample';
// runAllExamples();
