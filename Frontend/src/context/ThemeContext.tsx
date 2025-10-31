// ThemeContext.tsx - Contexto global para manejar el tema de diseño de la aplicación (Bootstrap, Tailwind, Material UI).
// Permite cambiar dinámicamente entre frameworks de diseño y guarda la preferencia en localStorage.
// Proporciona un hook personalizado useTheme() para acceder y modificar el tema desde cualquier componente.

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type DesignLibrary = 'tailwind' | 'bootstrap' | 'material';

interface ThemeContextType {
  designLibrary: DesignLibrary;
  setDesignLibrary: (library: DesignLibrary) => void;
  toggleDesignLibrary: () => void;
  nextDesignLibrary: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Cargar la preferencia guardada o usar Tailwind por defecto
  const [designLibrary, setDesignLibraryState] = useState<DesignLibrary>(() => {
    const saved = localStorage.getItem('designLibrary');
    return (saved as DesignLibrary) || 'tailwind';
  });

  // Guardar la preferencia cuando cambie
  useEffect(() => {
    localStorage.setItem('designLibrary', designLibrary);
    
    // Agregar/remover clase en el body para estilos globales
    document.body.classList.remove('theme-tailwind', 'theme-bootstrap', 'theme-material');
    document.body.classList.add(`theme-${designLibrary}`);
    
    console.log(`🎨 Librería de diseño cambiada a: ${designLibrary}`);
  }, [designLibrary]);

  const setDesignLibrary = (library: DesignLibrary) => {
    setDesignLibraryState(library);
  };

  const toggleDesignLibrary = () => {
    setDesignLibraryState(prev => prev === 'tailwind' ? 'bootstrap' : 'tailwind');
  };

  // Función para cambiar al siguiente tema en el ciclo
  const nextDesignLibrary = () => {
    setDesignLibraryState(prev => {
      if (prev === 'bootstrap') return 'tailwind';
      if (prev === 'tailwind') return 'material';
      return 'bootstrap';
    });
  };

  const value = {
    designLibrary,
    setDesignLibrary,
    toggleDesignLibrary,
    nextDesignLibrary,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
