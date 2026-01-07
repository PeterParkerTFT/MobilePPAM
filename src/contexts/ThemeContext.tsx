import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      // Obtener tema guardado o usar preferencia del sistema
      const savedTheme = localStorage.getItem('ppam-theme') as Theme | null;
      console.log('Tema guardado en localStorage:', savedTheme);
      
      if (savedTheme === 'light' || savedTheme === 'dark') {
        console.log('Usando tema guardado:', savedTheme);
        return savedTheme;
      }
      
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        console.log('Usando preferencia del sistema: dark');
        return 'dark';
      }
      
      console.log('Usando tema por defecto: light');
      return 'light';
    } catch (error) {
      console.error('Error al cargar tema:', error);
      return 'light';
    }
  });

  useEffect(() => {
    console.log('Theme effect ejecutado. Tema actual:', theme);
    
    try {
      // Guardar tema en localStorage
      localStorage.setItem('ppam-theme', theme);
      console.log('Tema guardado en localStorage:', theme);
      
      // Aplicar clase al documento
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        console.log('Clase "dark" agregada al documento');
      } else {
        document.documentElement.classList.remove('dark');
        console.log('Clase "dark" removida del documento');
      }
      
      // Log de las clases actuales
      console.log('Clases del documento:', document.documentElement.className);
    } catch (error) {
      console.error('Error al aplicar tema:', error);
    }
  }, [theme]);

  const toggleTheme = () => {
    console.log('toggleTheme llamado. Tema actual:', theme);
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('Cambiando tema de', prev, 'a', newTheme);
      return newTheme;
    });
  };

  const contextValue = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  console.log('ThemeContext value:', contextValue);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
