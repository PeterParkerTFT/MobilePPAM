# 📱 Split-Screen Login/Signup Interface - Sistema PPAM

## 🎨 Diseño Corporativo Minimalista

Esta interfaz está diseñada siguiendo estrictamente los principios de diseño corporativo minimalista, inspirada en aplicaciones de documentación digital y bibliotecas virtuales.

---

## 🎯 Filosofía de Diseño

### **Estética:**
- ✅ **Corporate Minimalist** - Limpio, profesional, data-oriented
- ✅ **Clean Lines** - Sin elementos superfluos
- ✅ **Digital Library Aesthetic** - Similar a JW Library
- ✅ **Mobile-First** - Diseñado primero para dispositivos móviles

---

## 🎨 Paleta de Colores (Adherencia Estricta)

### **Primary Brand:**
```css
#594396  /* Deep Purple - Estados activos, botones primarios, sección superior */
```

### **Backgrounds:**
```css
#F7F7F7  /* Off-white - Contenedor de la app */
#FFFFFF  /* Pure White - Tarjetas e inputs */
```

### **Text:**
```css
#333333  /* Dark Grey - Títulos principales */
#666666  /* Medium Grey - Texto secundario */
#999999  /* Light Grey - Placeholder text */
```

### **Borders/Dividers:**
```css
#E0E0E0  /* Very subtle light gray */
```

### **Transparencias (Signup View):**
```css
rgba(255, 255, 255, 0.1)  /* Fondo de inputs sobre púrpura */
rgba(255, 255, 255, 0.3)  /* Borde de inputs */
rgba(255, 255, 255, 0.5)  /* Placeholder text */
rgba(255, 255, 255, 0.7)  /* Texto secundario */
rgba(255, 255, 255, 0.8)  /* Descripción */
rgba(255, 255, 255, 0.9)  /* Labels */
```

---

## 🖼️ Iconografía

### **Estilo:**
- ✅ **Thin Line Art (Outline)** - Sin rellenos sólidos
- ✅ **Stroke Width:** 1.5px - 2px (consistente)
- ✅ **Lucide Icons** usados:
  - `UserPlus` - Crear cuenta
  - `Lock` - Iniciar sesión
  - `X` - Cerrar/Volver

### **Ejemplos de otros íconos apropiados:**
```
📖 Open Book
🗼 Tower
📄 Document
👤 User
🔒 Lock
📧 Mail
📱 Phone
```

---

## 📝 Tipografía

### **Font Stack:**
```css
font-family: 'Inter', 'Roboto', 'Helvetica Neue', sans-serif;
```

### **Font Weights:**
```css
font-light (300)    /* Usado para la mayoría del texto */
font-normal (400)   /* Inputs */
font-medium (500)   /* Botones */
font-semibold (600) /* Badge "JW ID" */
```

### **Tamaños:**
```css
text-xs (0.75rem)   /* Footer text, hints */
text-sm (0.875rem)  /* Labels, descripciones */
text-2xl (1.5rem)   /* Títulos en split view */
text-3xl (1.875rem) /* Títulos en formularios */
```

---

## 📐 Interacción & Layout

### **Vista Inicial (Split 50/50):**

```
┌─────────────────────────────────┐
│                                 │
│          [UserPlus Icon]        │
│                                 │
│         Crear Cuenta            │
│    Registrarse en Sistema PPAM  │
│                                 │
│     ┌─────────────┐             │ ← 50% altura
│     │   JW ID    │              │   Deep Purple (#594396)
│     └─────────────┘             │
├─────────────────────────────────┤
│                                 │
│          [Lock Icon]            │
│                                 │
│        Iniciar Sesión           │
│       Acceder a mi cuenta       │
│                                 │
│                                 │ ← 50% altura
└─────────────────────────────────┘   Pure White (#FFFFFF)
```

### **Badge Central "JW ID":**
```css
position: absolute
top: 50%
left: 50%
transform: translate(-50%, -50%)
z-index: 10
background: white
border: 2px solid #594396
border-radius: 9999px (full)
padding: 8px 24px
```

---

## 🎬 Animaciones

### **Expansión de Sección:**

**Top Half → Signup:**
```
Duración: 600ms
Easing: ease-in-out
Efecto: Expande de 50% a 100% altura
Formulario: Fade in (600ms)
```

**Bottom Half → Login:**
```
Duración: 600ms
Easing: ease-in-out
Efecto: Expande de 50% a 100% altura (hacia arriba)
Formulario: Fade in (600ms)
```

### **Animación CSS:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 600ms ease-in-out;
}
```

### **Transiciones:**
```css
transition-all duration-600 ease-in-out  /* Expansión */
transition-colors                         /* Hover states */
```

---

## 📱 Touch Targets & Accesibilidad

### **Tamaños Mínimos:**
```css
min-width: 44px   /* Botones táctiles */
min-height: 44px  /* Touch targets */
```

### **Elementos con touch target garantizado:**
- ✅ Botón de cerrar (X): 44x44px
- ✅ Inputs: min-height 44px
- ✅ Botones de formulario: min-height 44px
- ✅ Botones de selección de rol: min-height 44px
- ✅ Secciones clickeables (split view): 50% de viewport

### **Touch Action:**
```css
touch-action: manipulation  /* Elimina delay de 300ms */
```

---

## 🎨 Estados de los Inputs

### **Signup View (sobre púrpura):**

**Normal:**
```css
background: rgba(255, 255, 255, 0.1)
border-bottom: 2px solid rgba(255, 255, 255, 0.3)
color: white
```

**Focus:**
```css
border-bottom: 2px solid rgba(255, 255, 255, 1)
```

**Placeholder:**
```css
color: rgba(255, 255, 255, 0.5)
```

### **Login View (sobre blanco):**

**Normal:**
```css
background: #F7F7F7
border-bottom: 2px solid #E0E0E0
color: #333333
```

**Focus:**
```css
border-bottom: 2px solid #594396
```

**Placeholder:**
```css
color: #999999
```

---

## 🔘 Botones

### **Primary Button (Signup):**
```css
background: white
color: #594396
padding: 16px
border-radius: 8px
font-weight: 500 (medium)
min-height: 44px

Hover:
background: rgba(255, 255, 255, 0.9)
```

### **Primary Button (Login):**
```css
background: #594396
color: white
padding: 16px
border-radius: 8px
font-weight: 500 (medium)
min-height: 44px

Hover:
background: #6d51b8  /* Ligeramente más claro */
```

### **Role Selection Buttons:**

**Seleccionado:**
```css
background: white
color: #594396
border: 2px solid white
```

**No seleccionado:**
```css
background: rgba(255, 255, 255, 0.1)
color: white
border: 2px solid rgba(255, 255, 255, 0.3)

Hover:
border: 2px solid rgba(255, 255, 255, 0.5)
```

---

## 📋 Estructura de Componentes

### **Vista Split:**
```jsx
<div className="split-container">
  {/* Top Half - Signup */}
  <button className="top-half" onClick={expandToSignup}>
    <UserPlus icon />
    <h2>Crear Cuenta</h2>
    <p>Registrarse en Sistema PPAM</p>
  </button>

  {/* Badge Central */}
  <div className="center-badge">JW ID</div>

  {/* Bottom Half - Login */}
  <button className="bottom-half" onClick={expandToLogin}>
    <Lock icon />
    <h2>Iniciar Sesión</h2>
    <p>Acceder a mi cuenta</p>
  </button>
</div>
```

### **Vista Signup:**
```jsx
<div className="signup-view">
  <button className="close-button">
    <X icon />
  </button>

  <div className="form-container">
    <header>
      <UserPlus icon />
      <h1>Crear Cuenta</h1>
      <p>Complete el formulario para registrarse</p>
    </header>

    <form>
      <input name="nombre" />
      <input name="email" />
      <input name="telefono" />
      <div className="role-selection">
        <button>Voluntario</button>
        <button>Capitán</button>
        <button>Administrador</button>
      </div>
      <button type="submit">Crear Cuenta</button>
    </form>
  </div>
</div>
```

### **Vista Login:**
```jsx
<div className="login-view">
  <button className="close-button">
    <X icon />
  </button>

  <div className="form-container">
    <header>
      <Lock icon />
      <h1>Iniciar Sesión</h1>
      <p>Acceda a su cuenta Sistema PPAM</p>
    </header>

    <form>
      <input name="email" />
      <input name="password" />
      <a>¿Olvidó su contraseña?</a>
      <button type="submit">Iniciar Sesión</button>
      <div className="divider">o</div>
      <button onClick={goToSignup}>
        ¿No tiene cuenta? Crear una cuenta
      </button>
    </form>
  </div>
</div>
```

---

## 🔄 Flujos de Usuario

### **Flujo de Registro:**

```
1. Usuario ve pantalla split (50/50)
   ↓
2. Toca sección superior "Crear Cuenta"
   ↓
3. Sección se expande a 100% (600ms smooth)
   ↓
4. Formulario aparece con fade in (600ms)
   ↓
5. Usuario completa:
   - Nombre completo
   - Email
   - Teléfono
   - Selecciona rol (Voluntario/Capitán/Admin)
   ↓
6. Toca "Crear Cuenta"
   ↓
7. Sistema crea usuario y hace login automático
   ↓
8. Navega a la vista correspondiente al rol
```

### **Flujo de Login:**

```
1. Usuario ve pantalla split (50/50)
   ↓
2. Toca sección inferior "Iniciar Sesión"
   ↓
3. Sección se expande a 100% hacia arriba (600ms smooth)
   ↓
4. Formulario aparece con fade in (600ms)
   ↓
5. Usuario ingresa:
   - Email
   - Contraseña
   ↓
6. Toca "Iniciar Sesión"
   ↓
7. Sistema valida credenciales
   ↓
8. Navega a la vista correspondiente al rol
```

### **Flujo de Regreso:**

```
Usuario en vista de formulario
   ↓
Toca botón X (esquina superior derecha)
   ↓
Vista se contrae (600ms smooth)
   ↓
Regresa a pantalla split (50/50)
   ↓
Formulario se resetea
```

---

## 📱 Responsive Behavior

### **Mobile Portrait (< 428px):**
```css
width: 100%
max-width: 428px
margin: 0 auto
```

### **Desktop (> 428px):**
```css
width: 100%
max-width: 428px
margin: 0 auto
background: #F7F7F7 (contenedor)
```

**Nota:** La interfaz está diseñada **Mobile First** y mantiene un ancho máximo de 428px incluso en desktop para preservar la experiencia mobile.

---

## 🎨 Detalles Visuales Específicos

### **Spacing:**
```css
px-6 (24px)    /* Padding horizontal de formularios */
pt-16 (64px)   /* Padding top para dar espacio al botón X */
pb-8 (32px)    /* Padding bottom */
gap-6 (24px)   /* Espacio entre elementos en split view */
space-y-6      /* Espacio entre inputs */
space-y-3      /* Espacio entre botones de rol */
```

### **Border Radius:**
```css
rounded-lg (8px)      /* Botones, inputs */
rounded-full (9999px) /* Badge JW ID, botón X */
```

### **Shadows:**
```css
shadow-lg  /* Badge JW ID */
```

### **Divider (en Login View):**
```jsx
<div className="divider">
  <div className="line" /> {/* border-top: #E0E0E0 */}
  <span>o</span>
  <div className="line" />
</div>
```

---

## 🔍 Casos de Uso

### **Caso 1: Primer usuario (Voluntario)**
```
1. Abre la app
2. Ve pantalla split limpia y profesional
3. Toca "Crear Cuenta" (top)
4. Completa formulario
5. Selecciona "Voluntario"
6. Crea cuenta
7. Automáticamente → TurnosScreenVoluntario
```

### **Caso 2: Usuario recurrente (Capitán)**
```
1. Abre la app
2. Ve pantalla split
3. Toca "Iniciar Sesión" (bottom)
4. Ingresa email y contraseña
5. Inicia sesión
6. Automáticamente → TurnosScreenCapitan
```

### **Caso 3: Cambio de opinión**
```
1. Toca "Crear Cuenta"
2. Ve formulario
3. Cambia de opinión
4. Toca X
5. Regresa a split view
6. Ahora toca "Iniciar Sesión"
```

---

## ✅ Checklist de Calidad

### **Visual:**
- ✅ Colores exactos (#594396, #F7F7F7, #FFFFFF, #333333, #666666, #E0E0E0)
- ✅ Iconos outline (stroke 1.5-2px)
- ✅ Tipografía clean sans-serif (Inter/Roboto)
- ✅ Spacing consistente
- ✅ Bordes sutiles

### **Interacción:**
- ✅ Touch targets ≥ 44px
- ✅ Animaciones smooth (600ms ease-in-out)
- ✅ Feedback visual en hover
- ✅ Transiciones suaves
- ✅ Touch-action: manipulation

### **Funcional:**
- ✅ Validación de formularios
- ✅ Botón de cerrar funcional
- ✅ Reset de formularios al cerrar
- ✅ Navegación fluida entre vistas
- ✅ Submit handlers funcionando

### **Accesibilidad:**
- ✅ Labels en todos los inputs
- ✅ Placeholders descriptivos
- ✅ Contraste adecuado de texto
- ✅ Touch targets grandes
- ✅ Estados de focus visibles

---

## 📊 Comparación: Antes vs. Ahora

### **Diseño Anterior:**
```
❌ Gradientes coloridos (purple-50, blue-50)
❌ Logo 3D con sparkles
❌ Múltiples pasos (selección de rol → formulario)
❌ Diseño "fancy" con efectos visuales
❌ Cards flotantes con sombras grandes
```

### **Diseño Actual:**
```
✅ Clean corporate (#594396, white)
✅ Iconos line art minimalistas
✅ Split screen elegante
✅ Diseño profesional y sobrio
✅ Estilo biblioteca digital
✅ Una sola pantalla con transiciones suaves
```

---

## 🎯 Principios de Diseño Aplicados

### **1. Minimalismo:**
- Solo lo esencial
- Sin elementos decorativos innecesarios
- Espacios en blanco generosos

### **2. Claridad:**
- Jerarquía visual clara
- Texto legible
- Contraste apropiado

### **3. Profesionalismo:**
- Paleta corporativa
- Tipografía seria
- Interacciones pulidas

### **4. Eficiencia:**
- Pocos pasos para completar tareas
- Inputs optimizados para mobile
- Navegación intuitiva

### **5. Consistencia:**
- Colores consistentes
- Spacing uniforme
- Patrones repetibles

---

## 🔧 Personalización Futura

### **Fácil de modificar:**

**Cambiar color primario:**
```css
/* Buscar y reemplazar */
#594396 → #TU_COLOR

/* También en transparencias */
rgba(255, 255, 255, X) → mantener igual
```

**Cambiar fuente:**
```jsx
className="font-sans" → className="font-[TuFuente]"
```

**Ajustar animaciones:**
```css
duration-600 → duration-400  /* Más rápido */
duration-600 → duration-800  /* Más lento */
```

---

## 📱 Vista Previa de Colores en Uso

### **Split View:**
```
Top Half:
  - Background: #594396
  - Text: #FFFFFF
  - Icon: #FFFFFF (stroke 1.5px)

Bottom Half:
  - Background: #FFFFFF
  - Text: #333333
  - Icon: #333333 (stroke 1.5px)

Badge:
  - Background: #FFFFFF
  - Border: #594396 (2px)
  - Text: #594396
```

### **Signup View:**
```
Background: #594396
Text: #FFFFFF
Inputs:
  - Background: rgba(255, 255, 255, 0.1)
  - Border: rgba(255, 255, 255, 0.3)
  - Focus border: #FFFFFF
Button:
  - Background: #FFFFFF
  - Text: #594396
```

### **Login View:**
```
Background: #FFFFFF
Text: #333333
Inputs:
  - Background: #F7F7F7
  - Border: #E0E0E0
  - Focus border: #594396
Button:
  - Background: #594396
  - Text: #FFFFFF
```

---

## 🎉 Conclusión

Esta interfaz de login cumple con **todos** los requisitos de diseño corporativo minimalista:

✅ **Estética profesional** tipo biblioteca digital  
✅ **Paleta de colores estricta** (#594396, #F7F7F7, #FFFFFF, etc.)  
✅ **Iconografía line art** (1.5-2px stroke)  
✅ **Tipografía clean** sans-serif  
✅ **Split-screen 50/50** con expansión smooth  
✅ **Animaciones de 600ms** ease-in-out  
✅ **Touch targets ≥ 44px**  
✅ **Inputs flat** con border-bottom  
✅ **Mobile-first** optimizado  

**Sistema PPAM** - *"Profesionalismo en cada detalle"* ✨

---

**Última actualización:** Enero 2026  
**Versión:** 2.0.0 (Split-Screen Corporate Design)
