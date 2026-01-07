// Convierte color hexadecimal a formato RGB (r, g, b)
export function hexToRgb(hex: string): string {
  // Eliminar el # si existe
  const cleanHex = hex.replace('#', '');
  
  // Convertir a RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

// Convierte objeto de colores hex a RGB
export function convertColorsToRgb(colors: any): any {
  const result: any = {};
  
  for (const key in colors) {
    if (typeof colors[key] === 'string' && colors[key].startsWith('#')) {
      result[key] = hexToRgb(colors[key]);
    } else if (typeof colors[key] === 'object') {
      result[key] = convertColorsToRgb(colors[key]);
    } else {
      result[key] = colors[key];
    }
  }
  
  return result;
}
