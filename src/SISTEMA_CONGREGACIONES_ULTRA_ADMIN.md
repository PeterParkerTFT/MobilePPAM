# 🏛️ Sistema de Congregaciones y Ultra Admin - Sistema PPAM

## 📋 Implementación del Sistema Jerárquico de Congregaciones

Se ha implementado un sistema completo de gestión por congregaciones con roles diferenciados de administradores.

---

## 🎯 Objetivo del Sistema

**Problema a resolver:**
- Los hermanos pertenecen a diferentes congregaciones
- Cada congregación tiene sus propios ancianos (administradores)
- Los ancianos solo deben ver solicitudes de SU congregación
- Algunos administradores especiales necesitan ver TODAS las congregaciones

**Solución implementada:**
- Sistema de congregaciones con filtrado automático
- Roles diferenciados: Admin Normal vs Ultra Admin
- Asignación de congregación al registrarse
- Filtrado inteligente de solicitudes

---

## 👥 Roles del Sistema

### **1. Voluntario**
```typescript
role: 'voluntario'
congregacion: null (opcional)
```

**Permisos:**
- ✅ Ver turnos disponibles
- ✅ Inscribirse en eventos
- ✅ Ver sus propios turnos
- ✅ Enviar informes
- ❌ No ve pantalla de aprobaciones
- ❌ No ve voluntarios

---

### **2. Capitán**
```typescript
role: 'capitan'
congregacion: 'cong-001' (requerido)
status: 'pendiente' // Al registrarse
```

**Permisos:**
- ✅ Todo lo de Voluntario
- ✅ Postularse para coordinar eventos
- ✅ Ver SUS voluntarios asignados
- ✅ Ver informes de SU grupo
- ❌ No puede aprobar otros capitanes
- ❌ Requiere aprobación de ancianos de su congregación

**Flujo de registro:**
```
1. Selecciona rol "Capitán"
2. Aparece dropdown de congregaciones ⭐
3. Selecciona su congregación
4. Completa formulario
5. Status: "pendiente"
6. Solicitud llega solo a ancianos de ESA congregación ⭐
7. Ancianos aprueban/rechazan
8. Si aprobado → puede ser capitán
```

---

### **3. Admin (Anciano de Congregación)**
```typescript
role: 'admin'
congregacion: 'cong-001' (requerido)
status: 'aprobado'
```

**Permisos:**
- ✅ Todo lo de Capitán
- ✅ Aprobar/rechazar capitanes de SU congregación ⭐
- ✅ Ver voluntarios de SU congregación ⭐
- ✅ Ver solicitudes de SU congregación ⭐
- ✅ Gestionar turnos de SU congregación
- ❌ NO puede ver otras congregaciones
- ❌ NO puede cambiar roles globalmente

**Flujo de registro:**
```
1. Selecciona rol "Administrador"
2. Aparece dropdown de congregaciones ⭐
3. Selecciona su congregación
4. Completa formulario
5. Status: "aprobado" (inmediato)
6. Solo ve hermanos y solicitudes de SU congregación
```

**Vista en Aprobaciones:**
```
┌─────────────────────────────────────┐
│ 🏛️ Villa Guerrero                  │ ← Badge de su congregación
│                                     │
│ Estadísticas:                       │
│ 2 Pendientes | 5 Aprobados          │
│                                     │
│ Solicitudes:                        │
│ ┌─────────────────────────────────┐│
│ │ Pedro Ramírez González          ││
│ │ 🏛️ Villa Guerrero               ││ ← Solo ve de su congregación
│ │ [Aprobar] [Rechazar]            ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Carlos López Martínez           ││
│ │ 🏛️ Villa Guerrero               ││
│ │ [Aprobar] [Rechazar]            ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘

NO VE solicitudes de Lomas de Polanco ❌
NO VE solicitudes de La Calma ❌
```

---

### **4. Ultra Admin (Super Administrador)** ⭐ NUEVO
```typescript
role: 'ultraadmin'
congregacion: null (no aplica)
status: 'aprobado'
```

**Permisos:**
- ✅ TODO lo de Admin
- ✅ Ver TODAS las congregaciones ⭐⭐⭐
- ✅ Aprobar/rechazar capitanes de CUALQUIER congregación ⭐
- ✅ Ver voluntarios de TODAS las congregaciones ⭐
- ✅ Ver solicitudes de TODAS las congregaciones ⭐
- ✅ Cambiar roles globalmente
- ✅ Gestión total del sistema

**Flujo de registro:**
```
1. Selecciona rol "Ultra Administrador"
2. NO aparece dropdown de congregaciones ⭐
3. Aparece aviso: "Acceso Total"
4. Completa formulario
5. Status: "aprobado" (inmediato)
6. Ve TODO el sistema sin restricciones
```

**Vista en Aprobaciones:**
```
┌─────────────────────────────────────┐
│ ⚠️ Ultra Admin - Todas las          │ ← Badge especial (rojo)
│    Congregaciones                   │
│                                     │
│ Estadísticas:                       │
│ 4 Pendientes | 8 Aprobados          │
│                                     │
│ Solicitudes de TODAS las           │
│ congregaciones:                     │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Pedro Ramírez González          ││
│ │ 🏛️ Villa Guerrero               ││ ← Ve todas
│ │ [Aprobar] [Rechazar]            ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ María Fernández Torres          ││
│ │ 🏛️ Lomas de Polanco             ││ ← Ve todas
│ │ [Aprobar] [Rechazar]            ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Ana García Pérez                ││
│ │ 🏛️ La Calma, Zapopan            ││ ← Ve todas
│ │ [Aprobar] [Rechazar]            ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘

VE solicitudes de TODAS las congregaciones ✅✅✅
```

---

## 🏛️ Congregaciones Disponibles

### **Lista de Congregaciones (Editable):**

```typescript
// /data/congregaciones.ts

export const congregaciones: Congregacion[] = [
  {
    id: 'cong-001',
    nombre: 'Villa Guerrero',
    ciudad: 'Villa Guerrero',
    estado: 'Estado de México',
    adminIds: [] // IDs de ancianos
  },
  {
    id: 'cong-002',
    nombre: 'Lomas de Polanco',
    ciudad: 'Polanco',
    estado: 'Estado de México',
    adminIds: []
  },
  {
    id: 'cong-003',
    nombre: 'Arboledas del Sur',
    ciudad: 'Arboledas',
    estado: 'Estado de México',
    adminIds: []
  },
  {
    id: 'cong-004',
    nombre: 'La Calma',
    ciudad: 'Zapopan',
    estado: 'Jalisco',
    adminIds: []
  },
  {
    id: 'cong-005',
    nombre: 'Centro Guadalajara',
    ciudad: 'Guadalajara',
    estado: 'Jalisco',
    adminIds: []
  },
  {
    id: 'cong-006',
    nombre: 'Tlalnepantla Norte',
    ciudad: 'Tlalnepantla',
    estado: 'Estado de México',
    adminIds: []
  },
  {
    id: 'cong-007',
    nombre: 'Satélite',
    ciudad: 'Naucalpan',
    estado: 'Estado de México',
    adminIds: []
  },
  {
    id: 'cong-008',
    nombre: 'Cuautitlán Izcalli',
    ciudad: 'Cuautitlán Izcalli',
    estado: 'Estado de México',
    adminIds: []
  }
];
```

**Fácil de agregar más:**
```typescript
// Para agregar una nueva congregación:
{
  id: 'cong-009',
  nombre: 'Nueva Congregación',
  ciudad: 'Ciudad',
  estado: 'Estado',
  adminIds: []
}
```

---

## 📊 Flujos del Sistema

### **Flujo 1: Capitán se Registra**

```
┌─────────────────────────────────────────────┐
│  HERMANO QUIERE SER CAPITÁN                 │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  1. Abre app → Clic "Crear Cuenta"          │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  2. Selecciona rol: "Capitán"               │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  3. Aparece dropdown de congregaciones ⭐   │
│     [Villa Guerrero ▼]                      │
│     [Lomas de Polanco]                      │
│     [La Calma]                              │
│     [...]                                   │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  4. Selecciona: "Villa Guerrero"            │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  5. Completa datos:                         │
│     - Nombre: Juan Pérez                    │
│     - Email: juan@ejemplo.com               │
│     - Teléfono: +52 555 1234                │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  6. Submit → Usuario creado:                │
│     {                                       │
│       role: 'capitan',                      │
│       congregacion: 'cong-001',             │
│       status: 'pendiente'                   │
│     }                                       │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  7. SISTEMA FILTRA POR CONGREGACIÓN ⭐      │
│                                             │
│  Solicitud aparece SOLO para:              │
│  - Ancianos de Villa Guerrero              │
│  - Ultra Admins                            │
│                                             │
│  NO aparece para:                          │
│  - Ancianos de otras congregaciones ❌     │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  8. Anciano de Villa Guerrero ve:          │
│                                             │
│  ┌─────────────────────────────────┐       │
│  │ Juan Pérez (pendiente)          │       │
│  │ 🏛️ Villa Guerrero               │       │
│  │ [Aprobar] [Rechazar]            │       │
│  └─────────────────────────────────┘       │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  9. Anciano APRUEBA                         │
│     status: 'pendiente' → 'aprobado'        │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  10. Juan Pérez ahora es Capitán aprobado ✅│
│      Puede coordinar eventos               │
└─────────────────────────────────────────────┘
```

---

### **Flujo 2: Admin Normal Revisa Solicitudes**

```
┌─────────────────────────────────────────────┐
│  ANCIANO (ADMIN) DE VILLA GUERRERO          │
│  user.congregacion = 'cong-001'             │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  1. Va a pantalla "Aprobaciones"            │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  2. Ve badge: "🏛️ Villa Guerrero"          │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  3. SISTEMA FILTRA AUTOMÁTICAMENTE ⭐       │
│                                             │
│  const solicitudesFiltradas =              │
│    user.role === 'ultraadmin'              │
│      ? solicitudes // todas                │
│      : solicitudes.filter(                 │
│          s => s.congregacion ===           │
│               user.congregacion            │
│        );                                  │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  4. Ve SOLO solicitudes de su congregación │
│                                             │
│  ✅ Pedro (Villa Guerrero)                 │
│  ✅ Carlos (Villa Guerrero)                │
│  ❌ María (Lomas de Polanco) - NO VE       │
│  ❌ Ana (La Calma) - NO VE                 │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  5. Puede aprobar/rechazar SOLO hermanos   │
│     de Villa Guerrero                       │
└─────────────────────────────────────────────┘
```

---

### **Flujo 3: Ultra Admin Ve Todo**

```
┌─────────────────────────────────────────────┐
│  ULTRA ADMIN (Sin congregación asignada)    │
│  user.role = 'ultraadmin'                   │
│  user.congregacion = null                   │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  1. Va a pantalla "Aprobaciones"            │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  2. Ve badge rojo:                          │
│     "⚠️ Ultra Admin - Todas las             │
│      Congregaciones"                        │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  3. NO HAY FILTRADO ⭐⭐⭐                    │
│                                             │
│  const solicitudesFiltradas =              │
│    solicitudes; // TODAS                   │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  4. Ve TODAS las solicitudes:               │
│                                             │
│  ✅ Pedro (Villa Guerrero)                 │
│  ✅ Carlos (Villa Guerrero)                │
│  ✅ María (Lomas de Polanco)               │
│  ✅ Ana (La Calma)                         │
│  ✅ Luis (Tlalnepantla Norte)              │
│  ✅ ...todas las congregaciones            │
└─────────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────┐
│  5. Puede aprobar/rechazar hermanos de     │
│     CUALQUIER congregación                  │
└─────────────────────────────────────────────┘
```

---

## 🔐 Lógica de Filtrado

### **Código Clave en AprobacionesScreen:**

```typescript
// Filtrar solicitudes según el tipo de admin
const solicitudesFiltradas = user.role === 'ultraadmin' 
  ? solicitudes // Ultra admin ve todas las solicitudes
  : solicitudes.filter(s => s.congregacion === user.congregacion); 
    // Admin normal solo ve de su congregación

// Luego se usan las filtradas:
const solicitudesPendientes = solicitudesFiltradas.filter(
  s => s.status === 'pendiente'
);
const solicitudesAprobadas = solicitudesFiltradas.filter(
  s => s.status === 'aprobado'
);
const solicitudesRechazadas = solicitudesFiltradas.filter(
  s => s.status === 'rechazado'
);
```

---

## 🎨 Elementos Visuales

### **1. Dropdown de Congregaciones (LoginScreen)**

```jsx
{(signupForm.role === 'capitan' || signupForm.role === 'admin') && (
  <div className="animate-in fade-in">
    <label className="flex items-center gap-2">
      <Church className="w-4 h-4" />
      Congregación *
    </label>
    <select
      required
      value={signupForm.congregacion}
      onChange={(e) => setSignupForm({ 
        ...signupForm, 
        congregacion: e.target.value 
      })}
    >
      <option value="">Seleccione su congregación</option>
      {congregaciones.map((cong) => (
        <option key={cong.id} value={cong.id}>
          {cong.nombre} - {cong.ciudad}, {cong.estado}
        </option>
      ))}
    </select>
    <p className="text-xs italic">
      {signupForm.role === 'capitan' 
        ? 'Su solicitud será enviada a los ancianos de esta congregación'
        : 'Solo verá solicitudes y hermanos de esta congregación'}
    </p>
  </div>
)}
```

**Vista para usuario:**
```
┌─────────────────────────────────────┐
│ 🏛️ Congregación *                   │
│                                     │
│ [Seleccione su congregación    ▼]  │
│  Villa Guerrero - Villa Gue...     │
│  Lomas de Polanco - Polanco...     │
│  La Calma - Zapopan, Jalisco       │
│  Centro Guadalajara - Guada...     │
│  ...                               │
│                                     │
│ Su solicitud será enviada a los    │
│ ancianos de esta congregación      │
└─────────────────────────────────────┘
```

---

### **2. Badge de Tipo de Admin (AprobacionesScreen)**

**Admin Normal:**
```jsx
<div className="badge admin-normal">
  <Church className="w-3.5 h-3.5" />
  Villa Guerrero
</div>

Estilo:
- Background: rgba(107, 87, 184, 0.15) (violeta suave)
- Color: #6B57B8 (violeta)
- Icono: Church (iglesia)
```

**Ultra Admin:**
```jsx
<div className="badge ultra-admin">
  <AlertCircle className="w-3.5 h-3.5" />
  Ultra Admin - Todas las Congregaciones
</div>

Estilo:
- Background: rgba(220, 38, 38, 0.15) (rojo suave)
- Color: #dc2626 (rojo)
- Icono: AlertCircle (advertencia)
```

---

### **3. Tarjeta de Solicitud con Congregación**

```jsx
<div className="solicitud-card">
  {/* Header con avatar y nombre */}
  <div className="header">
    <div className="avatar">P</div>
    <div className="info">
      <div className="nombre">Pedro Ramírez González</div>
      <div className="email">pedro@ejemplo.com</div>
      <div className="telefono">+52 555 111 2222</div>
    </div>
    <span className="fecha">Vie 3 ene</span>
  </div>

  {/* Congregación ⭐ NUEVO */}
  <div className="congregacion">
    <Church className="w-3.5 h-3.5" />
    <span className="nombre-cong">Villa Guerrero</span>
  </div>

  {/* Especialidad */}
  <div className="especialidad">
    <UserCheck className="w-3 h-3" />
    Especialidad: Guías
  </div>

  {/* Botones */}
  <div className="acciones">
    <button className="aprobar">Aprobar</button>
    <button className="rechazar">Rechazar</button>
  </div>
</div>
```

---

## 📊 Matriz de Permisos

| Acción | Voluntario | Capitán | Admin | Ultra Admin |
|--------|-----------|---------|-------|-------------|
| Ver turnos propios | ✅ | ✅ | ✅ | ✅ |
| Inscribirse en turnos | ✅ | ✅ | ✅ | ✅ |
| Enviar informes | ✅ | ✅ | ✅ | ✅ |
| **Seleccionar congregación al registrarse** | ❌ | ✅ | ✅ | ❌ |
| **Ver aprobaciones de SU congregación** | ❌ | ❌ | ✅ | ✅ |
| **Ver aprobaciones de TODAS las congregaciones** | ❌ | ❌ | ❌ | ✅ |
| **Aprobar capitanes de SU congregación** | ❌ | ❌ | ✅ | ✅ |
| **Aprobar capitanes de CUALQUIER congregación** | ❌ | ❌ | ❌ | ✅ |
| **Ver voluntarios de SU congregación** | ❌ | ❌ | ✅ | ✅ |
| **Ver voluntarios de TODAS las congregaciones** | ❌ | ❌ | ❌ | ✅ |
| Cambiar roles de usuarios | ❌ | ❌ | ❌ | ✅ |

---

## 🔧 Archivos Modificados/Creados

### **Tipos Actualizados:**
```typescript
// /types/index.ts

export type UserRole = 'admin' | 'capitan' | 'voluntario' | 'ultraadmin'; // ⭐

export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  role: UserRole;
  status?: UserStatus;
  congregacion?: string; // ⭐ NUEVO
  grupoAsignado?: string;
  capitanId?: string;
}
```

### **Nuevos Archivos:**
1. ✅ `/data/congregaciones.ts` - **CREADO**
   - Lista de congregaciones
   - Helper functions

### **Archivos Modificados:**
1. ✅ `/types/index.ts` - Agregado 'ultraadmin' y 'congregacion'
2. ✅ `/components/LoginScreen.tsx` - Dropdown de congregaciones
3. ✅ `/components/AprobacionesScreen.tsx` - Filtrado por congregación
4. ✅ `/components/BottomNav.tsx` - Permisos de ultraadmin

---

## 🎯 Casos de Uso Reales

### **Caso 1: Congregación Villa Guerrero**

**Hermanos:**
- Pedro (Capitán, pendiente)
- Carlos (Capitán, aprobado)
- Juan (Voluntario)
- María (Voluntaria)

**Ancianos:**
- Elder González (Admin)
- Elder Ramírez (Admin)

**Flujo:**
```
1. Pedro se registra como Capitán → Selecciona "Villa Guerrero"
2. Solicitud aparece para:
   - Elder González ✅
   - Elder Ramírez ✅
   - Ultra Admin (si existe) ✅

3. Elder González aprueba a Pedro
4. Pedro ahora es Capitán aprobado de Villa Guerrero
```

---

### **Caso 2: Congregación Lomas de Polanco**

**Hermanos:**
- Ana (Capitán, pendiente)
- Luis (Voluntario)

**Ancianos:**
- Elder Martínez (Admin)

**Flujo:**
```
1. Ana se registra como Capitán → Selecciona "Lomas de Polanco"
2. Solicitud aparece para:
   - Elder Martínez ✅
   - Ultra Admin (si existe) ✅
   - Elder González (Villa Guerrero) ❌ NO LA VE

3. Elder Martínez aprueba a Ana
4. Ana ahora es Capitán aprobado de Lomas de Polanco
```

---

### **Caso 3: Ultra Admin Supervisa Todo**

**Hermanos en el sistema:**
- Pedro (Villa Guerrero, pendiente)
- Ana (Lomas de Polanco, pendiente)
- José (La Calma, pendiente)
- Carmen (Tlalnepantla, pendiente)

**Ultra Admin:**
- Supervisor Nacional

**Vista del Ultra Admin:**
```
Aprobaciones (4 pendientes):

✅ Pedro - Villa Guerrero
✅ Ana - Lomas de Polanco  
✅ José - La Calma
✅ Carmen - Tlalnepantla

Puede aprobar/rechazar a CUALQUIERA
```

---

## ✅ Beneficios del Sistema

### **1. Organización:**
- ✅ Cada congregación maneja sus propios hermanos
- ✅ No hay confusión entre congregaciones
- ✅ Ancianos ven solo lo relevante

### **2. Privacidad:**
- ✅ Ancianos no ven hermanos de otras congregaciones
- ✅ Datos segmentados por congregación
- ✅ Control granular de acceso

### **3. Escalabilidad:**
- ✅ Fácil agregar más congregaciones
- ✅ No requiere cambios de código
- ✅ Solo actualizar array en congregaciones.ts

### **4. Flexibilidad:**
- ✅ Ultra Admin puede intervenir si necesario
- ✅ Supervisión global posible
- ✅ Mantenimiento descentralizado

### **5. Claridad:**
- ✅ Badges visuales indican congregación
- ✅ Filtrado automático transparente
- ✅ UX clara para cada rol

---

## 🚀 Próximos Pasos Sugeridos

### **Fase 1: Integración Supabase**
- [ ] Tabla de congregaciones en BD
- [ ] Relación users ↔ congregaciones
- [ ] Queries con filtrado por congregación
- [ ] RLS (Row Level Security) por congregación

### **Fase 2: Gestión de Congregaciones**
- [ ] Pantalla para agregar/editar congregaciones (ultra admin)
- [ ] Asignar ancianos a congregaciones
- [ ] Ver estadísticas por congregación

### **Fase 3: Notificaciones**
- [ ] Alertas a ancianos de nueva solicitud
- [ ] Solo ancianos de LA congregación reciben alerta
- [ ] Push notifications por congregación

### **Fase 4: Reportes**
- [ ] Dashboard por congregación
- [ ] Comparativas entre congregaciones (ultra admin)
- [ ] Exportar datos por congregación

---

## 🎉 Conclusión

El sistema de congregaciones con Ultra Admin está **completamente implementado** y funcional:

✅ **Filtrado inteligente** por congregación  
✅ **Roles diferenciados** (Admin vs Ultra Admin)  
✅ **Dropdown de congregaciones** en registro  
✅ **Badges visuales** para identificar congregación  
✅ **Lógica de permisos** implementada  
✅ **8 congregaciones** precargadas  
✅ **Escalable** y fácil de mantener  

**Sistema PPAM** - *"Organización y orden teocrático"* 🏛️✨

---

**Última actualización:** Enero 2026  
**Estado:** ✅ **COMPLETO Y FUNCIONAL**
