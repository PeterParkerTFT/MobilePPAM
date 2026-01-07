# 📝 Guía de Informes - Sistema PPAM

## 🎯 Nueva Funcionalidad: Sistema de Informes para Voluntarios

### **Acceso a Informes**

Los **voluntarios** ahora tienen acceso a una sección completa de **Informes** desde el menú del header (ícono de 3 líneas):

1. Haz clic en el ícono de menú (☰) en el header
2. Aparecerá la opción **"Mis Informes"** (ícono de documento 📄)
3. Al hacer clic, navegarás a la pantalla de Informes

---

## 📊 Estructura de la Pantalla de Informes

La pantalla tiene **3 pestañas principales**:

### **1️⃣ Pendientes**
**Informes que aún no has enviado**

#### Características:
- ✅ Muestra todos los turnos donde te inscribiste y no has reportado
- ✅ Información completa del turno:
  - Tipo de evento (badge colorido)
  - Fecha y horario
  - Ubicación
  - Nombre del capitán
- ✅ Estado: **PENDIENTE** (badge naranja)
- ✅ Botón: **"Enviar Informe"**

#### Acción:
Al hacer clic en un informe pendiente:
- Se abre un modal para completar el reporte
- Puedes indicar si asististe o no
- Agregar comentarios sobre el turno
- Compartir una experiencia edificante (opcional)

---

### **2️⃣ Realizados**
**Informes que ya enviaste**

#### Características:
- ✅ Lista de todos tus informes completados
- ✅ Estado: **COMPLETADO** (badge verde con ✓)
- ✅ Muestra:
  - Comentarios que escribiste
  - Experiencias compartidas (destacadas con ícono ✨)
  - Fecha en que enviaste el reporte
- ✅ Botón: **"Editar Informe"** para actualizar

#### Acción:
- Puedes **editar** informes ya enviados
- Actualizar comentarios
- Agregar o modificar experiencias

---

### **3️⃣ Experiencias** ❤️
**Sección especial para compartir testimonios**

#### Características:
- ✅ Botón principal: **"Comparte una Experiencia"**
- ✅ Vista tipo "feed social":
  - Foto de perfil del voluntario
  - Tipo de evento (badge)
  - Fecha del servicio
  - Experiencia escrita
- ✅ Botón "Me edifica" para interactuar

#### Propósito:
- Edificar a otros hermanos
- Compartir cómo Jehová bendice el servicio
- Motivar a otros voluntarios
- Crear una comunidad de testimonios

---

## 📋 Flujo de Trabajo

### **Para el Voluntario:**

```
1. ME INSCRIBO en un turno
   ↓
2. REALIZO el servicio
   ↓
3. VOY A "Mis Informes" (menú del header)
   ↓
4. VEO el turno en "Pendientes"
   ↓
5. HAGO CLIC en "Enviar Informe"
   ↓
6. COMPLETO el formulario:
   - ¿Asististe? Sí/No
   - Comentarios del turno
   - Experiencia (opcional)
   ↓
7. ENVÍO el informe
   ↓
8. El informe pasa a "Realizados"
   ↓
9. (Opcional) Puedo EDITAR el informe
   ↓
10. Mi experiencia aparece en la pestaña "Experiencias"
```

---

## 🎨 Diseño Visual

### **Pendientes:**
- **Color**: Naranja (#F59E0B)
- **Borde**: Naranja claro
- **Badge**: "PENDIENTE"
- **Botón**: Naranja con ícono de enviar

### **Realizados:**
- **Color**: Verde (#10B981)
- **Borde**: Verde claro
- **Badge**: "COMPLETADO" con ✓
- **Botón**: Morado outline para editar

### **Experiencias:**
- **Color**: Morado (color primario del sistema)
- **Estilo**: Feed/Timeline social
- **Destacado**: Fondo morado claro con borde izquierdo morado
- **Ícono**: Sparkles (✨)

---

## 💡 Formulario de Informe

### **Campos:**

1. **¿Asististe al turno?**
   - Botón verde: "✓ Sí, asistí"
   - Botón rojo: "✗ No asistí"
   - Selección obligatoria

2. **Comentarios del turno** (Opcional)
   - Textarea grande
   - Placeholder: "Describe cómo fue el turno, qué actividades realizaste, etc."
   - Ejemplo: "Organizamos 200 cajas de literatura. Todo el equipo trabajó muy bien."

3. **Cuéntanos una experiencia** (Opcional)
   - Textarea grande
   - Placeholder: "¿Hubo alguna conversación edificante? ¿Aprendiste algo nuevo?"
   - Ejemplo: "Una hermana me preguntó sobre la Trinidad y pudimos tener una conversación muy edificante usando la Biblia."
   - **Icono especial**: ✨ para destacar
   - Las experiencias se comparten en la pestaña "Experiencias"

---

## 📊 Datos Mock de Ejemplo

```typescript
{
  id: 'inf1',
  turnoId: 't1',
  tipo: 'guias',
  titulo: 'Miércoles 3 de diciembre de 2025',
  fecha: '2025-12-03',
  horaInicio: '16:00',
  horaFin: '21:00',
  ubicacion: 'Museo Bíblico - Sede Central',
  capitanNombre: 'Hermano Martínez',
  status: 'pendiente'
}
```

```typescript
{
  id: 'inf3',
  turnoId: 't13',
  tipo: 'expositores',
  status: 'realizado',
  asistio: true,
  comentarios: 'Fue una experiencia maravillosa. Pude conversar con varios visitantes interesados.',
  experiencia: 'Una hermana me preguntó sobre la Trinidad y pudimos tener una conversación muy edificante usando la Biblia.',
  fechaReporte: '2025-12-01'
}
```

---

## 🚀 Beneficios del Sistema

### **Para Voluntarios:**
- ✅ Fácil seguimiento de qué informes faltan
- ✅ Poder editar informes después de enviarlos
- ✅ Compartir experiencias edificantes
- ✅ Ver el impacto de su servicio

### **Para Capitanes:**
- ✅ Saber quién asistió realmente a los turnos
- ✅ Recibir retroalimentación sobre los eventos
- ✅ Identificar voluntarios comprometidos
- ✅ Estadísticas de asistencia (futuro)

### **Para Administradores:**
- ✅ Seguimiento completo del sistema
- ✅ Reportes consolidados
- ✅ Identificar áreas de mejora
- ✅ Métricas de participación

---

## 📱 Navegación

### **Desde cualquier pantalla (Voluntarios):**

```
Header (☰) 
  ↓
[Menú desplegable]
  ├─ Usuario: [Nombre]
  ├─ Rol: Voluntario
  ├─ 📄 Mis Informes ← NUEVA OPCIÓN
  └─ Cerrar Sesión
```

### **Dentro de Informes:**

```
[Pendientes (2)] [Realizados (2)] [❤️ Experiencias]
       ↓                ↓                  ↓
  Lista de         Lista de        Feed de
  pendientes       completados     experiencias
```

---

## 🔔 Notificaciones (Futuras)

### **Recordatorios automáticos:**
- ⏰ 24h después del turno: "Recuerda enviar tu informe"
- ⏰ 48h después: "Aún no has enviado tu informe"
- ⏰ 7 días después: Notificación al capitán

### **Estadísticas:**
- 📊 % de informes completados
- 📊 Tiempo promedio de respuesta
- 📊 Voluntarios más comprometidos

---

## 🎯 Próximas Mejoras

1. **Notificaciones Push** para recordar informes pendientes
2. **Galería de Experiencias** compartida con toda la congregación
3. **Estadísticas personales** para cada voluntario
4. **Badges de logros** (ej: "10 informes a tiempo")
5. **Exportar a PDF** el historial de informes
6. **Integración con WhatsApp** para compartir experiencias

---

## 💬 Ejemplos de Experiencias Edificantes

### **Ejemplo 1 - Guías:**
> "Un visitante ateo me preguntó cómo sabemos que Dios existe. Usamos Romanos 1:20 y la ilustración del reloj. Al final me agradeció por el tiempo y pidió una Biblia."

### **Ejemplo 2 - Expositores:**
> "Una hermana mayor necesitaba ayuda para entender la Atalaya. Pasamos 30 minutos repasándola juntas. Me dijo que fue la primera vez que entendió todo el artículo. ¡Qué alegría!"

### **Ejemplo 3 - Bodega:**
> "Mientras organizábamos las cajas, un hermano nuevo compartió cómo encontró la verdad. Su relato me fortaleció mucho. Jehová usa el servicio para edificarnos mutuamente."

---

**Sistema PPAM** - *"Cada uno siga usando en servicio de los demás el don que haya recibido" - 1 Pedro 4:10* 💝
