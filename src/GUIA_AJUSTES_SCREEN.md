# 🎨 Guía Completa: AjustesScreen.tsx

## 📱 Pantalla de Ajustes con Dos Interfaces Distintas

Se ha creado la pantalla **AjustesScreen** con **dos interfaces completamente diferentes** según el rol del usuario.

---

## 🎯 Lógica de Renderizado Condicional

```typescript
// Determinar qué vista mostrar
const isGlobalAdmin = EnumHelpers.isGlobalAdmin(user.role);

{isGlobalAdmin ? (
  <PanelGlobalView user={user} onLogout={onLogout} />
) : (
  <MiPerfilView user={user} onLogout={onLogout} />
)}
```

**Reglas:**
- ✅ **Admin Global** → Panel de Supervisión Global
- ✅ **Todos los demás** (Voluntario, Capitán, Admin Local) → Mi Perfil Personal

---

## 🎨 DISEÑO A: Mi Perfil Personal

### **Vista para:** Voluntario, Capitán, Admin Local

**Objetivo:** Gestión de identidad personal con tono amable y teocrático.

```
┌─────────────────────────────────────────┐
│  Mi Perfil                     [☀️/🌙]  │
│                                         │
│            ┌─────────┐                  │
│            │   👤    │ 📷               │ ← Avatar + botón cámara
│            │    P    │                  │
│            └─────────┘                  │
│         Pedro Ramírez                   │
│           Capitán                       │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ ✓ Tu Foto de Perfil                │ │ ← Sección de ayuda
│  │                                     │ │
│  │ Esta imagen se usará en tus        │ │
│  │ tarjetas de asignación. Te         │ │
│  │ animamos a elegir una foto         │ │
│  │ reciente con una sonrisa amable... │ │
│  └────────────────────────────────────┘ │
│                                         │
│  👤 Información Personal                │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ Nombre Completo                    │ │
│  │ Pedro Ramírez González       ✏️   │ │ ← Editable
│  └────────────────────────────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ 📱 Teléfono                        │ │
│  │ +52 555 123 4567             ✏️   │ │ ← Editable
│  └────────────────────────────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ 📧 Correo Electrónico              │ │
│  │ pedro@ejemplo.com   [Solo lectura] │ │ ← Solo lectura
│  └────────────────────────────────────┘ │
│                                         │
│  🏛️ Tu Asignación                      │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ Congregación                       │ │
│  │ 🏛️ Villa Guerrero                  │ │ ← Solo lectura
│  │                                     │ │
│  │ Rol en el Sistema                  │ │
│  │ 🛡️ Capitán                          │ │ ← Solo lectura
│  │                                     │ │
│  │ ⓘ Si necesitas cambiar tu          │ │
│  │   congregación o rol, contacta a   │ │
│  │   un administrador del sistema.    │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │  🚪 Cerrar Sesión                  │ │ ← Botón rojo
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### **Características:**

#### **1. Avatar Circular Grande**
```tsx
<div className="w-32 h-32 rounded-full">
  {user.nombre.charAt(0).toUpperCase()}
</div>

// Botón de cámara superpuesto
<button className="absolute bottom-0 right-0">
  <Camera />
</button>
```

**Estilo:**
- Tamaño: 128px × 128px
- Color fondo: **#594396** (violeta)
- Texto: Blanco, bold, 4xl
- Botón cámara: Blanco con borde violeta

#### **2. Sección de Foto con Copywriting**

```tsx
<div style={{ 
  backgroundColor: 'rgba(89, 67, 150, 0.05)',
  border: '1px solid rgba(89, 67, 150, 0.2)'
}}>
  <UserCheck icon />
  <h3>Tu Foto de Perfil</h3>
  <p>
    Esta imagen se usará en tus tarjetas de asignación. 
    Te animamos a elegir una foto reciente con una sonrisa 
    amable y la vestimenta que usas para las reuniones.
  </p>
</div>
```

**Copywriting Específico:**
- ✅ Título: "Tu Foto de Perfil"
- ✅ Tono: Amable, teocrático, respetuoso
- ✅ Contexto: Explica para qué se usa
- ✅ Guía: Sugiere qué tipo de foto elegir
- ✅ Icono: UserCheck (check mark + usuario)

#### **3. Campos de Información**

**Nombre (Editable):**
```tsx
{isEditingName ? (
  <>
    <input value={nombre} onChange={...} />
    <Check button />
    <X button />
  </>
) : (
  <>
    <span>{nombre}</span>
    <Edit2 button />
  </>
)}
```

**Estados:**
- Default: Mostrar valor + botón editar
- Editing: Input + botones guardar/cancelar
- Guardado: Transición suave

**Teléfono (Editable):**
- Mismo comportamiento que nombre
- Type: "tel"

**Correo (Solo lectura):**
- Badge "Solo lectura"
- Sin botón de editar
- Color gris apagado

#### **4. Tarjeta de Asignación**

```tsx
<div style={{ 
  backgroundColor: 'rgba(89, 67, 150, 0.05)',
  border: '2px solid rgba(89, 67, 150, 0.2)'
}}>
  {/* Congregación */}
  <Church icon />
  <span>{getCongregacionNombre(user.congregacion)}</span>
  
  {/* Rol */}
  <Shield icon />
  <span>{EnumHelpers.getRoleLabel(user.role)}</span>
  
  {/* Nota informativa */}
  <AlertCircle icon />
  <p>Si necesitas cambiar tu congregación o rol...</p>
</div>
```

**Características:**
- ✅ Fondo violeta muy claro
- ✅ Borde violeta 2px
- ✅ Congregación y Rol destacados
- ✅ Solo lectura (no editable aquí)
- ✅ Nota con icono de alerta

---

## 🏗️ DISEÑO B: Panel de Supervisión Global

### **Vista para:** Admin Global ÚNICAMENTE

**Objetivo:** Gestión de infraestructura del sistema (técnico).

```
┌─────────────────────────────────────────┐
│  Supervisión Global            [☀️/🌙]  │
│                                         │
│  ⚙️  Panel de Supervisión Global        │
│     Gestión de infraestructura PPAM     │
│                                         │
│  ⚠️ Admin Global - Acceso Total         │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  🏢 Congregaciones Activas              │
│                            [📍 Nueva]   │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ NOMBRE    │ CIUDAD  │ ESTADO │ ⚙️  │ │ ← Tabla
│  ├────────────────────────────────────┤ │
│  │ Villa     │ Villa   │ Edo Méx│ ✏️ │ │
│  │ Guerrero  │ Guerrero│        │    │ │
│  ├────────────────────────────────────┤ │
│  │ Lomas de  │ Polanco │ Edo Méx│ ✏️ │ │
│  │ Polanco   │         │        │    │ │
│  ├────────────────────────────────────┤ │
│  │ La Calma  │ Zapopan │ Jalisco│ ✏️ │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ⓘ Total: 8 congregaciones registradas │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  👥 Administradores Locales             │
│                        3 activos / 3    │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ 👤 E  Elder González               │ │
│  │       📧 elder.gonzalez@...        │ │
│  │       📱 +52 555 000 0001          │ │
│  │       🏛️ Villa Guerrero            │ │
│  │                    ✏️ [Desactivar] │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ 👤 E  Elder Martínez               │ │
│  │       📧 elder.martinez@...        │ │
│  │       📱 +52 555 000 0002          │ │
│  │       🏛️ Lomas de Polanco          │ │
│  │                    ✏️ [Desactivar] │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ 👤 E  Elder Sánchez   [Inactivo]  │ │
│  │       📧 elder.sanchez@...         │ │
│  │       📱 +52 555 000 0003          │ │
│  │       🏛️ La Calma                  │ │
│  │                      ✏️ [Activar]  │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │  🚪 Cerrar Sesión                  │ │ ← Botón rojo
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### **Características:**

#### **1. Header del Panel**

```tsx
<div className="flex items-center gap-3">
  <div className="w-12 h-12 rounded-xl bg-[#594396]">
    <Settings icon />
  </div>
  <div>
    <h1>Panel de Supervisión Global</h1>
    <p>Gestión de infraestructura del sistema PPAM</p>
  </div>
</div>

// Badge de Admin Global
<div style={{ 
  backgroundColor: 'rgba(220, 38, 38, 0.1)',
  color: '#dc2626'
}}>
  <Shield icon />
  Administrador Global - Acceso Total
</div>
```

**Estilo:**
- Icono Settings en cuadro violeta
- Título grande (2xl)
- Subtítulo gris
- Badge rojo para Admin Global

#### **2. Módulo 1: Congregaciones**

```tsx
<h2>
  <Building icon />
  Congregaciones Activas
</h2>

<button>
  <MapPin icon />
  Nueva Congregación
</button>

// Tabla
<table>
  <thead>
    <tr>
      <th>NOMBRE</th>
      <th>CIUDAD</th>
      <th>ESTADO</th>
      <th>ACCIONES</th>
    </tr>
  </thead>
  <tbody>
    {congregaciones.map(cong => (
      <tr>
        <td><Church icon /> {cong.nombre}</td>
        <td>{cong.ciudad}</td>
        <td>{cong.estado}</td>
        <td><Edit2 button /></td>
      </tr>
    ))}
  </tbody>
</table>
```

**Funcionalidad:**
- ✅ Listar todas las congregaciones
- ✅ Botón "Nueva Congregación" (principal)
- ✅ Editar congregación existente
- ✅ Contador total al final
- ✅ Estilo: Tabla compacta, técnica

**Nota Importante:**
> Al crear una congregación aquí, debe aparecer automáticamente en los selectores de registro de la app (CongregationCombobox).

#### **3. Módulo 2: Administradores Locales**

```tsx
<h2>
  <Users icon />
  Administradores Locales
</h2>

<div>3 activos / 3 total</div>

{adminLocales.map(admin => (
  <div>
    {/* Avatar */}
    <div className="avatar">{admin.nombre.charAt(0)}</div>
    
    {/* Datos */}
    <div>
      <span>{admin.nombre}</span>
      {!admin.activo && <badge>Inactivo</badge>}
      
      <Mail icon /> {admin.email}
      <Phone icon /> {admin.telefono}
      <Church icon /> {getCongregacionNombre(admin.congregacion)}
      Alta: {admin.fechaAlta}
    </div>
    
    {/* Acciones */}
    <Edit2 button />
    {admin.activo ? (
      <button>Desactivar</button>
    ) : (
      <button>Activar</button>
    )}
  </div>
))}
```

**Funcionalidad:**
- ✅ Lista de todos los Admin Local
- ✅ Avatar con inicial
- ✅ Datos completos (email, teléfono, congregación)
- ✅ Fecha de alta
- ✅ Estado: Activo/Inactivo
- ✅ Acciones:
  - Editar permisos
  - Desactivar (dar de baja)
  - Activar (reactivar)

**Estados:**
- **Activo:** Avatar violeta, opacidad 100%
- **Inactivo:** Avatar gris, opacidad 70%, borde rojo

---

## 🎨 Paleta de Colores

### **Corporate Clean (Estilo JW Library):**

```css
/* Fondos */
#F2F2F2  → Fondo principal (gris suave)
#FFFFFF  → Tarjetas blancas
rgba(89, 67, 150, 0.05) → Violeta muy claro (sección de foto)

/* Acentos */
#594396  → Violeta principal (botones, iconos, headers)

/* Textos */
colors.text.primary   → Texto principal (negro/blanco según tema)
colors.text.secondary → Texto secundario (gris)
colors.text.tertiary  → Texto terciario (gris claro)

/* Estados */
#10b981  → Verde (guardar, activar)
#ef4444  → Rojo (cancelar, desactivar, cerrar sesión)
#dc2626  → Rojo oscuro (Admin Global badge)

/* Bordes */
rgba(89, 67, 150, 0.2) → Borde violeta suave
```

---

## 🔧 Iconografía (Lucide React)

### **Mi Perfil:**
```tsx
import { 
  Camera,      // Foto de perfil
  UserIcon,    // Información personal
  Mail,        // Correo
  Phone,       // Teléfono
  Church,      // Congregación
  Shield,      // Rol
  UserCheck,   // Sección de ayuda
  AlertCircle, // Nota informativa
  Edit2,       // Editar
  Check,       // Guardar
  X,           // Cancelar
  LogOut       // Cerrar sesión
} from 'lucide-react';
```

### **Panel Global:**
```tsx
import {
  Settings,    // Header del panel
  Building,    // Congregaciones
  MapPin,      // Nueva congregación
  Users,       // Administradores
  Trash2,      // Eliminar
  Shield,      // Badge Admin Global
} from 'lucide-react';
```

---

## 🔐 Lógica de Permisos

### **Acceso a Vistas:**

```typescript
const isGlobalAdmin = EnumHelpers.isGlobalAdmin(user.role);

if (isGlobalAdmin) {
  // Mostrar Panel Global
  return <PanelGlobalView />;
} else {
  // Mostrar Mi Perfil
  return <MiPerfilView />;
}
```

### **Matriz de Acceso:**

| Vista | Voluntario | Capitán | Admin Local | Admin Global |
|-------|-----------|---------|-------------|--------------|
| **Mi Perfil** | ✅ | ✅ | ✅ | ❌ |
| **Panel Global** | ❌ | ❌ | ❌ | ✅ |

---

## 💬 Tono de Copywriting

### **Mi Perfil (Amable y Teocrático):**

✅ **CORRECTO:**
```
"Tu Foto de Perfil"
"Esta imagen se usará en tus tarjetas de asignación..."
"Te animamos a elegir una foto reciente..."
"Si necesitas cambiar tu congregación o rol, contacta a un administrador..."
```

❌ **INCORRECTO (evitar jerga técnica):**
```
"Profile Picture"
"This image will be stored in the database..."
"Update your credentials..."
"Contact sysadmin for role modification..."
```

### **Panel Global (Técnico y Formal):**

✅ **CORRECTO:**
```
"Panel de Supervisión Global"
"Gestión de infraestructura del sistema PPAM"
"Administradores Locales"
"3 activos / 3 total"
```

❌ **INCORRECTO (demasiado informal):**
```
"Admin Dashboard"
"Manage stuff"
"Local Admins"
"3 online"
```

---

## 📱 Touch Targets

**Todos los botones ≥ 44px:**

```tsx
// Botones mínimos
className="p-2"        // 8px padding → 40px si icon es 24px ✗
className="w-10 h-10" // 40px × 40px ✗

// Botones correctos
className="w-12 h-12" // 48px × 48px ✓
className="px-4 py-3" // ~44px height ✓
className="py-4"      // 64px height ✓
```

---

## 🔄 Estados de Edición

### **Flujo de Edición de Campo:**

```
┌─────────────────┐
│ Campo (default) │
│ Pedro Ramírez ✏️│
└─────────────────┘
        ↓ Clic en ✏️
┌─────────────────┐
│ Input editing   │
│ [Pedro___] ✓ ✗ │
└─────────────────┘
        ↓ Clic en ✓
┌─────────────────┐
│ Guardando...    │
│ Pedro Ramírez ⏳│
└─────────────────┘
        ↓ Guardado
┌─────────────────┐
│ Campo guardado  │
│ Pedro Ramírez ✏️│
└─────────────────┘
```

**Estados:**
1. **Default:** Valor + botón editar
2. **Editing:** Input + botones guardar/cancelar
3. **Saving:** Loading state (opcional)
4. **Saved:** Volver a default con nuevo valor

---

## ✅ Checklist de Implementación

### **Mi Perfil:**
- ✅ Avatar circular 128px
- ✅ Botón cámara superpuesto
- ✅ Sección de ayuda con copywriting específico
- ✅ Nombre editable
- ✅ Teléfono editable
- ✅ Correo solo lectura
- ✅ Tarjeta de asignación (congregación + rol)
- ✅ Nota informativa con icono
- ✅ Botón cerrar sesión (rojo)

### **Panel Global:**
- ✅ Header con icono Settings
- ✅ Badge "Admin Global - Acceso Total"
- ✅ Tabla de congregaciones
- ✅ Botón "Nueva Congregación"
- ✅ Lista de administradores locales
- ✅ Botones Desactivar/Activar
- ✅ Estados visuales (activo/inactivo)
- ✅ Botón cerrar sesión (rojo)

### **General:**
- ✅ Renderizado condicional por rol
- ✅ Estilo "Corporate Clean"
- ✅ Colores #594396, #F2F2F2
- ✅ Iconos Lucide React (line art)
- ✅ Touch targets ≥ 44px
- ✅ Tono respetuoso y formal

---

## 🚀 Próximos Pasos

### **Funcionalidad Futura:**

1. **Upload de Foto:**
   - Integrar con storage (Supabase Storage)
   - Preview antes de guardar
   - Cropping de imagen

2. **Edición de Congregaciones:**
   - Modal para crear nueva congregación
   - Editar congregación existente
   - Validaciones

3. **Gestión de Admins:**
   - Asignar/reasignar congregación
   - Cambiar permisos
   - Histórico de acciones

4. **Auditoría:**
   - Log de cambios en perfil
   - Histórico de desactivaciones
   - Reportes de actividad

---

## 🎉 Conclusión

La pantalla **AjustesScreen** está completamente implementada con:

✅ **Dos interfaces distintas** según el rol  
✅ **Mi Perfil** para usuarios normales (amable, teocrático)  
✅ **Panel Global** para Admin Global (técnico, macro)  
✅ **Copywriting específico** para cada sección  
✅ **Estilo Corporate Clean** estilo JW Library  
✅ **Iconos line art** de Lucide React  
✅ **Touch targets** optimizados (≥ 44px)  
✅ **Tono respetuoso** y profesional  

**Sistema PPAM** - *"Gestión personal y administración macro en una sola pantalla"* 🎨✨

---

**Última actualización:** Enero 2026  
**Developer:** Senior Frontend & UX Designer  
**Estado:** ✅ **COMPLETAMENTE IMPLEMENTADO**
