# 📱 Sistema PPAM - Predicación Pública con Asignación de Capitanes

![Sistema PPAM](https://img.shields.io/badge/Version-1.0.0-purple)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-cyan)

**Sistema de gestión de turnos y voluntarios para actividades teocráticas de Testigos de Jehová**

---

## 🎯 Descripción

Sistema PPAM es una PWA (Aplicación Web Progresiva) diseñada para gestionar turnos de predicación pública con asignación automática de capitanes y voluntarios. Incluye:

- ✅ **3 Roles Jerárquicos**: Admin, Capitán, Voluntario
- ✅ **6 Tipos de Eventos**: Expositores, Guías, Escuelas, Editoriales, Encuestas, Bodega
- ✅ **Sistema de Aprobación**: Los capitanes necesitan autorización del admin
- ✅ **Gestión de Grupos**: Capitanes coordinan sus propios voluntarios
- ✅ **Sistema de Informes**: Voluntarios reportan su participación y comparten experiencias
- ✅ **Sistema de Semáforos**: Verde/Amarillo/Rojo para cupos en tiempo real
- ✅ **Tema Dark/Light**: Siguiendo patrones de JW Library

---

## 🚀 Características Principales

### Por Rol:

#### 👨‍💼 **Administradores**
- Vista completa del sistema
- Gestión de todos los turnos y voluntarios
- Aprobación de solicitudes de capitanes
- Estadísticas globales por capitán

#### 👨‍✈️ **Capitanes** 
- Dos pestañas: "Mis Eventos" y "Disponibles"
- Postulación a turnos sin capitán (requiere aprobación)
- Gestión solo de SU grupo de voluntarios
- Control de informes de SU equipo

#### 🙋 **Voluntarios**
- Vista categorizada por tipo de servicio
- Inscripción simple e intuitiva
- Acceso a grupos de WhatsApp al inscribirse
- Solo ve sus propios turnos
- **Sistema de Informes** con 3 secciones:
  - 📋 **Pendientes**: Informes que aún no has enviado
  - ✅ **Realizados**: Informes completados (editables)
  - ❤️ **Experiencias**: Comparte testimonios edificantes

---

## 📦 Tecnologías

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos
- **Vite** - Build tool
- **Lucide React** - Iconos
- **Context API** - Gestión de estado (ThemeContext)

---

## 🛠️ Instalación Local (VS Code)

### **1. Requisitos Previos**
```bash
node -v  # Debe ser >= 18.0.0
npm -v   # Debe ser >= 9.0.0
```

### **2. Clonar/Crear Proyecto**

#### **Opción A: Desde cero con Vite**
```bash
# Crear proyecto
npm create vite@latest ppam-app -- --template react-ts

# Navegar al directorio
cd ppam-app

# Instalar dependencias base
npm install
```

#### **Opción B: Si tienes archivos descargados**
```bash
# Navegar a la carpeta del proyecto
cd ppam-app

# Instalar dependencias
npm install
```

### **3. Instalar Dependencias del Proyecto**
```bash
# Dependencias principales
npm install lucide-react
npm install sonner@2.0.3

# Tailwind CSS v4
npm install tailwindcss@next @tailwindcss/vite@next
```

### **4. Configurar Vite**

Crea/edita `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### **5. Configurar Entry Point**

Edita `src/main.tsx`:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### **6. Copiar Archivos del Proyecto**

Estructura de carpetas necesaria:

```
ppam-app/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── AddTurnoModal.tsx
│   │   ├── AjustesScreen.tsx
│   │   ├── AprobacionesScreen.tsx
│   │   ├── BottomNav.tsx
│   │   ├── EventBadge.tsx
│   │   ├── HeaderWithTheme.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── MisTurnosScreen.tsx
│   │   ├── PredicacionBadge.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── TurnoDetailModal.tsx
│   │   ├── TurnosScreen.tsx
│   │   ├── TurnosScreenCapitan.tsx
│   │   ├── TurnosScreenVoluntario.tsx
│   │   └── VoluntariosScreen.tsx
│   ├── contexts/
│   │   └── ThemeContext.tsx
│   ├── hooks/
│   │   └── useThemeColors.ts
│   ├── types/
│   │   └── index.ts
│   ├── data/
│   │   └── mockData.ts
│   ├── constants/
│   │   ├── eventTypes.ts
│   │   ├── predicacionTypes.ts
│   │   └── theme.ts
│   ├── utils/
│   │   └── colorUtils.ts
│   └── styles/
│       └── globals.css
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### **7. Ejecutar el Proyecto**

```bash
# Modo desarrollo
npm run dev

# El proyecto estará disponible en:
# http://localhost:5173
```

### **8. Build para Producción**

```bash
# Compilar
npm run build

# Preview del build
npm run preview
```

---

## 👥 Usuarios de Prueba

Al iniciar la aplicación, puedes registrarte con cualquier rol:

1. **Administrador**
   - Acceso completo al sistema
   - Puede aprobar capitanes
   
2. **Capitán** 
   - Requiere aprobación del admin
   - Status: "Pendiente" → "Aprobado"
   
3. **Voluntario**
   - Acceso inmediato
   - Vista simplificada

---

## 📚 Documentación Adicional

- **[GUIA_ROLES.md](./GUIA_ROLES.md)** - Guía completa de roles y permisos
- **Tema**: Modo claro (fondo #EFEFF4, acento #6B57B8) y oscuro (fondo negro, acento #A78BFA)
- **Diseño**: Inspirado en JW Library para familiaridad

---

## 🎨 Sistema de Temas

El sistema incluye dos temas que siguen los patrones de JW Library:

### **Tema Claro**
- Fondo principal: `#EFEFF4` (gris claro)
- Acento: `#6B57B8` (violeta)
- Textos: Negro sobre fondo claro

### **Tema Oscuro**
- Fondo principal: `#000000` (negro puro)
- Acento: `#A78BFA` (violeta claro)
- Textos: Blanco sobre fondo oscuro

**Toggle** disponible en el header (icono sol/luna)

---

## 🔄 Próximas Funcionalidades

### **Fase 2 - Backend y Persistencia**
- [ ] Integración con Supabase
- [ ] Autenticación real de usuarios
- [ ] Base de datos PostgreSQL
- [ ] API REST para gestión de datos

### **Fase 3 - Notificaciones**
- [ ] Push notifications
- [ ] Recordatorios de turnos
- [ ] Alertas de informes pendientes

### **Fase 4 - Módulos Adicionales**
- [ ] **Control de Bodega** - Inventario de literatura
- [ ] **Gestión de Escuelas** - Programación de cursos
- [ ] **Reportes PDF** - Generación automática
- [ ] **WhatsApp Integration** - Envío automático de links

---

## 🐛 Solución de Problemas

### **Error: Module not found**
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### **Error: Tailwind no funciona**
```bash
# Verificar que tienes Tailwind v4
npm list tailwindcss
npm install tailwindcss@next @tailwindcss/vite@next
```

### **Error: Íconos no cargan**
```bash
# Verificar lucide-react
npm install lucide-react
```

---

## 📄 Licencia

Este proyecto es de código abierto para uso en congregaciones de Testigos de Jehová.

---

## 👨‍💻 Contribuciones

Si deseas contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

---

## 📞 Soporte

Para preguntas o sugerencias, contacta al desarrollador del proyecto.

---

**"Hagan todas las cosas para la gloria de Dios" - 1 Corintios 10:31** 🙏

---

## 📊 Estado del Proyecto

- ✅ **Sistema de Roles** - Completado
- ✅ **Vistas Diferenciadas** - Completado
- ✅ **Sistema de Aprobación** - Completado
- ✅ **Sistema de Informes** - Completado
- ✅ **Tema Dark/Light** - Completado
- ✅ **Gestión de Voluntarios** - Completado
- ⏳ **Backend con Supabase** - Pendiente
- ⏳ **Notificaciones** - Pendiente
- ⏳ **Módulos Adicionales** - Pendiente

---

Desarrollado con ❤️ para la comunidad de Testigos de Jehová