# 🏗️ Arquitectura SOLID - Sistema PPAM

## 📐 Refactorización Completa del Sistema de Roles

Se ha refactorizado el sistema completo siguiendo **principios SOLID** para mejorar mantenibilidad, testabilidad y escalabilidad.

---

## 🎯 Principios SOLID Aplicados

### **S - Single Responsibility Principle**
```
Cada clase/módulo tiene una única responsabilidad:
✅ UserService     → Lógica de negocio de usuarios
✅ IUserRepository → Abstracción de persistencia
✅ EnumHelpers     → Utilidades para trabajar con enums
✅ CongregationCombobox → UI de selección de congregación
```

### **O - Open/Closed Principle**
```
Abierto para extensión, cerrado para modificación:
✅ Nuevos roles se agregan al enum sin modificar código existente
✅ Nuevos repositorios implementan IUserRepository
✅ CongregationCombobox acepta congregaciones sin código duro
```

### **L - Liskov Substitution Principle**
```
Los subtipos pueden reemplazar a sus tipos base:
✅ MockUserRepository y SupabaseUserRepository son intercambiables
✅ Ambos implementan IUserRepository correctamente
```

### **I - Interface Segregation Principle**
```
Interfaces específicas en lugar de genéricas:
✅ IUserRepository solo métodos de usuario
✅ PendingUser interfaz simplificada para vistas
✅ AuditMetadata interfaz específica para auditoría
```

### **D - Dependency Inversion Principle**
```
Depender de abstracciones, no de implementaciones:
✅ UserService depende de IUserRepository (abstracción)
✅ No depende de MockUserRepository o SupabaseUserRepository
✅ Inyección de dependencias en el constructor
```

---

## 📁 Estructura de Archivos

```
/types/
  ├── enums.ts          ← Enumeraciones (UserRole, UserStatus, EventType)
  ├── models.ts         ← Interfaces del dominio (User, PendingUser, etc.)
  └── index.ts          ← Re-exportaciones (backward compatibility)

/services/
  └── userService.ts    ← Lógica de negocio + Repository pattern

/components/
  └── CongregationCombobox.tsx  ← UI component con búsqueda

/examples/
  └── userServiceExample.ts     ← Ejemplos de uso del servicio

/data/
  └── congregaciones.ts         ← Data seed de congregaciones

/ARQUITECTURA_SOLID.md          ← Este archivo
```

---

## 🔢 1. ENUMS en lugar de Strings Mágicos

### **Antes (❌ Anti-pattern):**
```typescript
// Strings mágicos - propenso a errores
type UserRole = 'admin' | 'capitan' | 'voluntario' | 'ultraadmin';

// Fácil escribir mal
if (user.role === 'admin') { } // ✓ OK
if (user.role === 'Admin') { } // ✗ Error silencioso
if (user.role === 'adminn') { } // ✗ Error silencioso
```

### **Después (✅ Best practice):**
```typescript
// Enum - type-safe y autocomplete
export enum UserRole {
  Voluntario = 'VOLUNTARIO',
  Capitan = 'CAPITAN',
  AdminLocal = 'ADMIN_LOCAL',
  AdminGlobal = 'ADMIN_GLOBAL',
}

// Imposible escribir mal
if (user.role === UserRole.AdminLocal) { } // ✓ OK
if (user.role === UserRole.Admin) { }       // ✗ Error en compilación
```

### **Beneficios:**

✅ **Type Safety**: El compilador detecta errores  
✅ **Autocomplete**: IDE sugiere valores válidos  
✅ **Refactoring**: Renombrar es seguro  
✅ **Documentación**: Self-documenting code  
✅ **Validación**: Fácil validar valores  

---

## 🛡️ 2. Seguridad con Filtrado en el Servicio

### **fetchPendingUsers - Filtrado Automático por Rol**

```typescript
async fetchPendingUsers(currentUser: User): Promise<PendingUser[]> {
  // 1. Validar permisos
  if (!EnumHelpers.isAdmin(currentUser.role)) {
    throw new Error('UNAUTHORIZED');
  }

  // 2. Obtener todos los usuarios
  const allUsers = await this.repository.findAll();

  // 3. Filtrar pendientes
  let pendingUsers = allUsers.filter(user => 
    user.status === UserStatus.Pendiente &&
    user.role === UserRole.Capitan
  );

  // 4. Aplicar filtro de seguridad por ROL ⭐
  if (EnumHelpers.isLocalAdmin(currentUser.role)) {
    // Admin Local: Solo su congregación
    pendingUsers = pendingUsers.filter(user => 
      user.congregacion === currentUser.congregacion
    );
  }
  // Admin Global: Ve todos (sin filtrar)

  return pendingUsers;
}
```

### **Flujo de Seguridad:**

```
┌─────────────────────────────────────┐
│  ADMIN LOCAL REQUEST                │
│  user.role = AdminLocal             │
│  user.congregacion = 'cong-001'     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  1. Validar: ¿Es admin?             │
│     ✓ AdminLocal es admin           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  2. Fetch: Todos los usuarios       │
│     [User1, User2, User3, ...]      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  3. Filtrar: Status pendiente       │
│     [User1, User2, User3]           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  4. Filtrar: Solo su congregación ⭐ │
│     User1 (cong-001) ✓              │
│     User2 (cong-002) ✗ REMOVIDO     │
│     User3 (cong-001) ✓              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  RESULTADO: [User1, User3]          │
│  Solo usuarios de cong-001          │
└─────────────────────────────────────┘
```

### **Comparación Admin Local vs Global:**

| Aspecto | Admin Local | Admin Global |
|---------|-------------|--------------|
| **Validación** | ✅ isAdmin() | ✅ isAdmin() |
| **Fetch Data** | Todos los usuarios | Todos los usuarios |
| **Filtro de Status** | Pendientes | Pendientes |
| **Filtro de Congregación** | ✅ **SÍ APLICA** | ❌ **NO APLICA** |
| **Resultado** | Solo su congregación | Todas las congregaciones |

---

## 🎨 3. CongregationCombobox - UI Component

### **Características:**

✅ **Búsqueda en tiempo real** por nombre, ciudad o estado  
✅ **Teclado accesible** (Enter, Escape, Arrow keys)  
✅ **Click outside** para cerrar  
✅ **Diseño minimalista** corporativo  
✅ **Colores corporativos** (blanco/gris/violeta #594396)  
✅ **Iconos line art** (Lucide React)  
✅ **Touch targets** ≥ 44px  

### **Props Interface:**

```typescript
interface CongregationComboboxProps {
  congregaciones: Congregacion[];  // Data source
  value: string;                   // ID seleccionado
  onChange: (id: string) => void;  // Callback
  placeholder?: string;            // Texto del input
  required?: boolean;              // Campo requerido
  disabled?: boolean;              // Deshabilitado
  helperText?: string;             // Texto de ayuda
  className?: string;              // Clase adicional
}
```

### **Uso Básico:**

```tsx
import { CongregationCombobox } from './components/CongregationCombobox';
import { congregaciones } from './data/congregaciones';

function MyForm() {
  const [selectedCong, setSelectedCong] = useState('');
  
  return (
    <CongregationCombobox
      congregaciones={congregaciones}
      value={selectedCong}
      onChange={setSelectedCong}
      required
      helperText="Su solicitud será enviada a los ancianos de esta congregación"
    />
  );
}
```

### **Estados Visuales:**

**Cerrado (default):**
```
┌─────────────────────────────────────┐
│ 🏛️ Congregación *                   │
│ ┌─────────────────────────────────┐ │
│ │ 🏛️  Villa Guerrero              │ │
│ │     Villa Guerrero, Edo Méx  ▼ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Abierto (búsqueda activa):**
```
┌─────────────────────────────────────┐
│ 🏛️ Congregación *                   │
│ ┌─────────────────────────────────┐ │
│ │ 🔍  [villa_______________] × ▲ │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🏛️ Villa Guerrero           ✓  │ │ ← Seleccionado
│ │    Villa Guerrero, Edo Méx      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Sin resultados:**
```
┌─────────────────────────────────────┐
│ 🏛️ Congregación *                   │
│ ┌─────────────────────────────────┐ │
│ │ 🔍  [xyz_______________] × ▲   │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │         🏛️                       │ │
│ │  No se encontraron              │ │
│ │  congregaciones                 │ │
│ │  Intenta con otra búsqueda      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **Paleta de Colores:**

```css
/* Violeta Corporativo */
#594396  → Icono iglesia, texto seleccionado, check mark

/* Grises */
#333333  → Texto principal
#666666  → Texto secundario
#999999  → Placeholders, iconos inactivos
#E0E0E0  → Bordes

/* Backgrounds */
#FFFFFF  → Cards, dropdown
#F7F7F7  → Inputs, hover states
```

### **Accesibilidad:**

```tsx
// ARIA attributes
role="combobox"
aria-expanded={isOpen}
aria-haspopup="listbox"
aria-controls="congregacion-listbox"
aria-autocomplete="list"

// Keyboard navigation
Enter    → Seleccionar item destacado
Escape   → Cerrar dropdown
ArrowDown → Navegar abajo
ArrowUp   → Navegar arriba
Tab      → Cerrar y siguiente campo
```

---

## 📊 4. Trazabilidad con AuditMetadata

### **Interface de Auditoría:**

```typescript
export interface AuditMetadata {
  timestamp: string;    // ISO 8601: "2025-01-06T10:30:00Z"
  userId: string;       // ID del admin que ejecutó la acción
  userName: string;     // Nombre legible del admin
  action: string;       // Descripción de la acción
}
```

### **User Model Actualizado:**

```typescript
export interface User {
  // ... campos existentes
  
  // Auditoría ⭐
  createdAt?: string;
  updatedAt?: string;
  approvedBy?: AuditMetadata;    // Quién aprobó
  rejectedBy?: AuditMetadata;    // Quién rechazó
}
```

### **Función approveUser con Trazabilidad:**

```typescript
async approveUser(userId: string, currentUser: User) {
  // 1. Validaciones (permisos, estado, etc.)
  // ...

  // 2. Crear metadata de auditoría ⭐
  const auditMetadata: AuditMetadata = {
    timestamp: new Date().toISOString(),
    userId: currentUser.id,
    userName: currentUser.nombre,
    action: `Aprobación de capitán por ${EnumHelpers.getRoleLabel(currentUser.role)}`,
  };

  // 3. Actualizar usuario con metadata
  const updatedUser = await this.repository.update(userId, {
    status: UserStatus.Aprobado,
    approvedBy: auditMetadata,     // ⭐ Inyectar metadata
    updatedAt: new Date().toISOString(),
  });

  // 4. Retornar resultado con metadata
  return {
    success: true,
    data: updatedUser,
    metadata: auditMetadata,        // ⭐ Retornar para logging
  };
}
```

### **Ejemplo de Registro de Auditoría:**

```json
{
  "id": "user-123",
  "nombre": "Pedro Ramírez",
  "role": "CAPITAN",
  "status": "APROBADO",
  
  "approvedBy": {
    "timestamp": "2025-01-06T14:30:45.123Z",
    "userId": "admin-001",
    "userName": "Elder González",
    "action": "Aprobación de capitán por Administrador Local"
  },
  
  "createdAt": "2025-01-03T10:00:00Z",
  "updatedAt": "2025-01-06T14:30:45Z"
}
```

### **Beneficios de Trazabilidad:**

✅ **Compliance**: Cumplimiento normativo  
✅ **Auditoría**: Registro completo de cambios  
✅ **Debugging**: Fácil rastrear problemas  
✅ **Responsabilidad**: Quién hizo qué y cuándo  
✅ **Reportes**: Generar reportes de actividad  

### **Consultas Posibles:**

```typescript
// ¿Quién aprobó a este usuario?
const approver = user.approvedBy?.userName;

// ¿Cuándo fue aprobado?
const approvalDate = new Date(user.approvedBy?.timestamp);

// ¿Cuántos usuarios aprobó Elder González?
const approvedByElder = users.filter(u => 
  u.approvedBy?.userId === 'admin-001'
);

// Timeline de actividad de un admin
const adminActivity = users
  .filter(u => u.approvedBy?.userId === adminId)
  .map(u => ({
    user: u.nombre,
    action: u.approvedBy?.action,
    timestamp: u.approvedBy?.timestamp
  }))
  .sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
```

---

## 🔧 Repository Pattern

### **Interface (Abstracción):**

```typescript
export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
  create(data: Omit<User, 'id'>): Promise<User>;
}
```

### **Implementación Mock (Desarrollo):**

```typescript
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

  async create(data: Omit<User, 'id'>): Promise<User> {
    const newUser: User = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
    };
    this.users.push(newUser);
    return newUser;
  }
}
```

### **Implementación Supabase (Producción - Futuro):**

```typescript
export class SupabaseUserRepository implements IUserRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<User[]> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  // ... resto de métodos
}
```

### **Inyección de Dependencias:**

```typescript
// Desarrollo
const mockRepo = new MockUserRepository();
const userService = new UserService(mockRepo);

// Producción
const supabaseRepo = new SupabaseUserRepository(supabaseClient);
const userService = new UserService(supabaseRepo);

// El UserService NO CAMBIA ✅
// Solo cambia la implementación del repositorio
```

---

## 📈 Comparación: Antes vs Después

### **Tipos:**

| Aspecto | Antes | Después |
|---------|-------|---------|
| Roles | Strings mágicos | Enum type-safe |
| Validación | Manual if/else | EnumHelpers |
| Refactoring | Buscar/reemplazar texto | Rename symbol |
| Errores | Runtime | Compile-time |

### **Seguridad:**

| Aspecto | Antes | Después |
|---------|-------|---------|
| Filtrado | En el componente | En el servicio |
| Lógica | Duplicada | Centralizada |
| Testing | Difícil | Fácil (unit tests) |
| Consistencia | Inconsistente | Garantizada |

### **UI:**

| Aspecto | Antes | Después |
|---------|-------|---------|
| Componente | Select nativo | Combobox custom |
| Búsqueda | No | Sí |
| Accesibilidad | Básica | Completa (ARIA) |
| UX | Simple | Profesional |

### **Auditoría:**

| Aspecto | Antes | Después |
|---------|-------|---------|
| Trazabilidad | No | Sí |
| Quién aprobó | Desconocido | Registrado |
| Cuándo | Aproximado | Timestamp exacto |
| Reportes | No | Sí |

---

## ✅ Checklist de Implementación

### **Tipos y Enums:**
- ✅ UserRole enum creado
- ✅ UserStatus enum creado
- ✅ EventType enum creado
- ✅ EnumHelpers con funciones utilitarias
- ✅ Backward compatibility mantenida

### **Modelos:**
- ✅ AuditMetadata interface
- ✅ User interface actualizada
- ✅ PendingUser interface
- ✅ UserFilters interface
- ✅ OperationResult generic type

### **Servicios:**
- ✅ IUserRepository interface (abstracción)
- ✅ MockUserRepository implementación
- ✅ UserService con lógica de negocio
- ✅ fetchPendingUsers con filtrado por rol
- ✅ approveUser con trazabilidad
- ✅ rejectUser con trazabilidad
- ✅ searchUsers con filtros

### **UI Components:**
- ✅ CongregationCombobox creado
- ✅ Búsqueda en tiempo real
- ✅ Keyboard navigation
- ✅ ARIA attributes
- ✅ Diseño minimalista corporativo
- ✅ Colores correctos (#594396)

### **Documentación:**
- ✅ /examples/userServiceExample.ts
- ✅ /ARQUITECTURA_SOLID.md
- ✅ JSDoc en todas las funciones
- ✅ Comentarios explicativos
- ✅ Ejemplos de uso

---

## 🚀 Próximos Pasos

### **Fase 1: Testing**
```typescript
// Unit tests
describe('UserService', () => {
  it('Admin Local solo ve su congregación', async () => {
    // ...
  });
  
  it('approveUser inyecta metadata correctamente', async () => {
    // ...
  });
});
```

### **Fase 2: Integración Supabase**
```typescript
// Implementar SupabaseUserRepository
class SupabaseUserRepository implements IUserRepository {
  // ... métodos reales con Supabase
}
```

### **Fase 3: Migration Script**
```typescript
// Migrar datos existentes a nuevos enums
const migrateRoles = (oldRole: string): UserRole => {
  switch(oldRole) {
    case 'admin': return UserRole.AdminLocal;
    case 'ultraadmin': return UserRole.AdminGlobal;
    // ...
  }
};
```

---

## 🎉 Conclusión

Se ha implementado una arquitectura SOLID completa que:

✅ **Elimina strings mágicos** con Enums type-safe  
✅ **Centraliza seguridad** en el servicio con filtrado automático  
✅ **Mejora UX** con CongregationCombobox profesional  
✅ **Agrega trazabilidad** completa con AuditMetadata  
✅ **Facilita testing** con Repository Pattern  
✅ **Escala fácilmente** gracias a SOLID  

**Sistema PPAM** - *"Arquitectura profesional para código mantenible"* 🏗️✨

---

**Última actualización:** Enero 2026  
**Arquitecto:** Senior Frontend Architect  
**Estado:** ✅ **IMPLEMENTADO Y DOCUMENTADO**
