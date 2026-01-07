import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeDebug() {
  const { theme, isDark, toggleTheme } = useTheme();
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '10px',
        padding: '10px',
        backgroundColor: isDark ? '#1C2128' : '#FFFFFF',
        color: isDark ? '#E6EDF3' : '#1A1A1A',
        border: `2px solid ${isDark ? '#373E47' : '#E0E0E0'}`,
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 9999
      }}
    >
      <div>Tema: {theme}</div>
      <div>isDark: {isDark ? 'Sí' : 'No'}</div>
      <button
        onClick={() => {
          console.log('Debug button clicked!');
          toggleTheme();
        }}
        style={{
          marginTop: '8px',
          padding: '4px 8px',
          backgroundColor: '#6B88AB',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Cambiar
      </button>
    </div>
  );
}
