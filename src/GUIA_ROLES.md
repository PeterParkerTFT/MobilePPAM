# 📋 Guía de Roles y Vistas del Sistema PPAM

## 🎯 Resumen del Sistema

El Sistema PPAM (Predicación Pública con Asignación de Capitanes) tiene **3 roles principales** con vistas completamente diferentes según su responsabilidad:

---

## 👥 Roles y Permisos

### 1️⃣ **ADMINISTRADOR** 👨‍💼
**Vista Completa del Sistema**

#### **Pantalla "Turnos":**
- ✅ Ve TODOS los turnos del sistema (todos los capitanes)
- ✅ Puede crear, editar y eliminar turnos
- ✅ Gestión completa de los 6 tipos de eventos:
  - 🛒 Expositores
  - 🚶 Guías
  - 📚 Escuelas
  - 📰 Editoriales
  - 📋 Encuestas
  - 📦 Bodega
- ✅ Asigna capitanes a cada turno
- ✅ Vista en grid 3x2 con badges de colores por tipo

#### **Pantalla "Voluntarios":**
- ✅ Ve TODOS los voluntarios del sistema
- ✅ Vista agrupada por Capitán (acordeones expandibles)
- ✅ Estadísticas completas:
  - Voluntarios con asignaciones
  - Voluntarios sin asignaciones
  - Voluntarios que no han enviado informes
- ✅ Filtros inteligentes:
  - Todos
  - Con Asignación
  - Sin Asignación
  - Sin Informe (pendientes de reporte)
- ✅ Puede agregar nuevos voluntarios
- ✅ Ve cuántos voluntarios faltan por enviar informes POR CAPITÁN

#### **Pantalla "Aprobaciones":**
- ✅ **NUEVA**: Gestión de solicitudes de capitanes
- ✅ Ve solicitudes pendientes de aprobación
- ✅ Puede **aprobar** o **rechazar** capitanes
- ✅ Estadísticas de:
  - Pendientes
  - Aprobados
  - Rechazados
- ✅ Información completa del solicitante (nombre, email, teléfono, especialidad)

#### **Pantalla "Mis Turnos":**
- ✅ Dashboard administrativo completo
- ✅ Estadísticas generales del sistema

#### **Pantalla "Ajustes":**
- ✅ Configuración general del sistema
- ✅ Gestión de permisos

---

### 2️⃣ **CAPITÁN** 👨‍✈️
**Vista Limitada a Sus Asignaciones**

#### **Estado de Cuenta:**
- ⏳ **Pendiente**: Al registrarse, debe esperar aprobación del administrador
- ✅ **Aprobado**: Puede postularse a turnos y gestionar su equipo

#### **Pantalla "Turnos":**
- ✅ **DOS PESTAÑAS**:
  1. **Mis Eventos**: Solo ve los eventos donde ÉL es el capitán asignado
  2. **Disponibles**: Ve turnos que necesitan capitán para postularse
- ✅ Vista agrupada por fecha
- ✅ Estadísticas de SUS eventos:
  - Total de eventos asignados
  - Total de voluntarios inscritos
  - Espacios disponibles
- ✅ Barras de progreso de cupo por evento
- ✅ Indicadores de estado:
  - ✓ COMPLETO (verde)
  - ⚠ LIMITADO (naranja)
  - ⚡ NECESITA (rojo - faltan voluntarios)
- ✅ Puede **postularse como capitán** en turnos disponibles
- ⚠️ Si está "Pendiente", no puede postularse hasta ser aprobado

#### **Pantalla "Voluntarios":**
- ✅ Solo ve los voluntarios asignados a ÉL
- ✅ Estadísticas de SU grupo:
  - Sus voluntarios con asignaciones
  - Sus voluntarios sin asignaciones
  - Sus voluntarios sin informe
- ✅ Filtros:
  - Todos (sus voluntarios)
  - Con Asignación
  - Sin Asignación
  - Sin Informe
- ✅ Puede ver quiénes de SU GRUPO ya enviaron informes

#### **Pantalla "Mis Turnos":**
- ✅ Historial de sus turnos como capitán
- ✅ Lista de voluntarios inscritos en cada uno

#### **Pantalla "Ajustes":**
- ✅ Configuración personal
- ✅ Notificaciones

---

### 3️⃣ **VOLUNTARIO** 🙋
**Vista de Inscripción por Categorías**

#### **Pantalla "Turnos":**
- ✅ Vista totalmente diferente: **"Servir en PPAM"**
- ✅ Organizado por los 6 tipos de servicio:
  1. 🛒 **Expositores** - Atención a expositores
  2. 🚶 **Guías** - Guías turísticas
  3. 📚 **Escuelas** - Apoyo en escuelas teocráticas
  4. 📰 **Editoriales** - Distribución de literatura
  5. 📋 **Encuestas** - Realización de encuestas
  6. 📦 **Bodega** - Gestión de inventario
- ✅ Tarjetas visuales con:
  - Fecha y horario
  - Ubicación
  - Cupo disponible (color verde/naranja/rojo)
  - Badge de tipo de evento
- ✅ Puede inscribirse en múltiples turnos
- ✅ Mensaje de bienvenida personalizado

#### **Pantalla "Mis Turnos":**
- ✅ Solo ve los turnos donde se ha inscrito
- ✅ Información del capitán asignado
- ✅ Link al grupo de WhatsApp

#### **Pantalla "Voluntarios":**
- ❌ NO TIENE ACCESO (mensaje de acceso restringido)

#### **Pantalla "Ajustes":**
- ✅ Configuración personal
- ✅ Preferencias de notificaciones

---

## 🎨 Características Visuales por Rol

### **Admin:**
- Vista tipo "Dashboard"
- Grid 3x2 para turnos
- Acordeones de capitanes
- Números morados destacados

### **Capitán:**
- Vista tipo "Mi Equipo"
- Estadísticas personales
- Barras de progreso
- Indicadores de necesidad

### **Voluntario:**
- Vista tipo "Catálogo de Servicio"
- Categorías visuales
- Badges coloridos
- Interfaz simple e intuitiva

---

## 📊 Datos de Ejemplo

### Tipos de Eventos y Colores:
- 🛒 **Expositores**: Morado (#9333EA)
- 🚶 **Guías**: Azul (#3B82F6)
- 📚 **Escuelas**: Verde (#10B981)
- 📰 **Editoriales**: Naranja (#F59E0B)
- 📋 **Encuestas**: Cyan (#06B6D4)
- 📦 **Bodega**: Gris (#6B7280)

### Capitanes de Ejemplo:
1. **Chelsea Maheda De Gonzalez** (cap1)
   - Voluntarios: Aranza, Juan, María
2. **Pedro Ramírez** (cap2)
   - Voluntarios: Carlos, Ana

---

## 🔐 Flujo de Trabajo

### **Admin:**
1. Crea turnos y asigna capitanes (o deja vacantes)
2. **Aprueba o rechaza** solicitudes de nuevos capitanes
3. Monitorea inscripciones globales
4. Revisa informes por capitán
5. Gestiona voluntarios del sistema

### **Capitán:**
1. **Se registra y espera aprobación** del administrador
2. Una vez aprobado, ve **turnos disponibles** sin capitán
3. **Se postula como capitán** en eventos de su interés
4. Ve sus eventos asignados
5. Monitorea inscripciones de voluntarios en SUS eventos
6. Controla quién ha enviado informes en SU grupo
7. Coordina su grupo de WhatsApp

### **Voluntario:**
1. Explora categorías de servicio
2. Se inscribe en turnos disponibles
3. Recibe acceso al grupo de WhatsApp
4. Envía informes de participación

---

## 🎯 Beneficios del Sistema por Rol

### **Para Administradores:**
- ✅ Control total del sistema
- ✅ Visibilidad completa de todos los capitanes
- ✅ Seguimiento de informes por equipo
- ✅ Asignación inteligente

### **Para Capitanes:**
- ✅ Gestión enfocada en su grupo
- ✅ No se distrae con otros eventos
- ✅ Puede ver rápidamente quién falta
- ✅ Control de su equipo de voluntarios

### **Para Voluntarios:**
- ✅ Interface simple e intuitiva
- ✅ Fácil exploración por categorías
- ✅ Inscripción en un clic
- ✅ No ve información administrativa innecesaria

---

## 🚀 Próximos Módulos Planificados

1. **Control de Bodega** - Gestión de inventario
2. **Gestión de Escuelas** - Programación de cursos
3. **Reportes Automáticos** - Generación de PDFs
4. **Notificaciones Push** - Recordatorios automáticos
5. **Integración WhatsApp** - Envío automático de links

---

**Sistema PPAM** - *"Hagan todas las cosas para la gloria de Dios" - 1 Corintios 10:31*