import { hexToRgb } from '../utils/colorUtils';

// Definir colores en hexadecimal para fácil mantenimiento
// INSPIRADO EN JW LIBRARY - AMBOS MODOS
const hexColors = {
  light: {
    // Backgrounds - ESTILO JW LIBRARY CLARO
    bg: {
      primary: '#EFEFF4',      // Fondo principal gris muy claro (como JW Library)
      secondary: '#FFFFFF',     // Tarjetas, modales - blanco puro
      tertiary: '#E5E5EA',      // Chips, inputs - gris claro
      header: '#F9F9FB',        // Headers - casi blanco
    },
    // Text - ALTO CONTRASTE
    text: {
      primary: '#1C1C1E',       // Texto principal - casi negro
      secondary: '#6B6B70',     // Texto secundario - gris medio
      tertiary: '#AEAEB2',      // Texto terciario - gris claro
      inverse: '#FFFFFF',       // Texto sobre fondos oscuros
      accent: '#6B57B8',        // VIOLETA como JW Library
    },
    // UI Elements
    ui: {
      border: '#D1D1D6',        // Bordes sutiles
      divider: '#E5E5EA',       // Divisores
      disabled: '#C7C7CC',      // Elementos deshabilitados
      placeholder: '#AEAEB2',   // Placeholders
    },
    // States
    state: {
      success: '#34C759',       // Verde iOS
      warning: '#FF9500',       // Naranja iOS
      error: '#FF3B30',         // Rojo iOS
      info: '#007AFF',          // Azul iOS
    },
    // Interactive - VIOLETA PRINCIPAL
    interactive: {
      primary: '#6B57B8',       // Violeta principal (JW Library)
      secondary: '#8B7DC8',     // Violeta más claro
      hover: '#5A47A7',         // Violeta más oscuro para hover
      active: '#4A3796',        // Violeta oscuro para active
    }
  },
  dark: {
    // Backgrounds - INSPIRADO EN JW LIBRARY OSCURO
    bg: {
      primary: '#000000',       // Fondo principal - NEGRO PURO como JW Library
      secondary: '#1C1C1E',     // Tarjetas, modales - Gris muy oscuro
      tertiary: '#2C2C2E',      // Elementos secundarios (chips, inputs)
      header: '#0A0A0A',        // Headers - Negro casi puro
    },
    // Text - ALTO CONTRASTE para máxima legibilidad
    text: {
      primary: '#FFFFFF',       // Texto principal - BLANCO PURO
      secondary: '#B4B4B8',     // Texto secundario - Gris claro
      tertiary: '#7A7A7E',      // Texto terciario - Gris medio
      inverse: '#000000',       // Texto sobre fondos claros
      accent: '#A78BFA',        // VIOLETA claro (como JW Library oscuro)
    },
    // UI Elements - SUTILES pero VISIBLES
    ui: {
      border: '#3A3A3C',        // Bordes sutiles
      divider: '#2C2C2E',       // Divisores
      disabled: '#48484A',      // Elementos deshabilitados
      placeholder: '#636366',   // Placeholders
    },
    // States - COLORES VIBRANTES para feedback visual
    state: {
      success: '#32D74B',       // Verde más brillante
      warning: '#FF9F0A',       // Naranja más brillante
      error: '#FF453A',         // Rojo más brillante
      info: '#0A84FF',          // Azul más brillante
    },
    // Interactive - VIOLETA/MORADO como JW Library
    interactive: {
      primary: '#8B5CF6',       // Violeta principal (JW Library oscuro)
      secondary: '#7C3AED',     // Violeta más oscuro
      hover: '#A78BFA',         // Violeta más claro para hover
      active: '#C4B5FD',        // Violeta muy claro para active
    }
  }
};

// Convertir todos los colores hex a RGB para usar con rgb()
function convertToRgb(obj: any): any {
  const result: any = {};
  
  for (const key in obj) {
    if (typeof obj[key] === 'string' && obj[key].startsWith('#')) {
      result[key] = hexToRgb(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[key] = convertToRgb(obj[key]);
    } else {
      result[key] = obj[key];
    }
  }
  
  return result;
}

export const colors = {
  light: convertToRgb(hexColors.light),
  dark: convertToRgb(hexColors.dark)
};

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
};

export const radius = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
};

export const shadows = {
  light: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    md: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    lg: '0 4px 8px 0 rgba(0, 0, 0, 0.08)',
    xl: '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
  },
  dark: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.7)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.8)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.9)',
  }
};

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '250ms ease-in-out',
  slow: '350ms ease-in-out',
};
