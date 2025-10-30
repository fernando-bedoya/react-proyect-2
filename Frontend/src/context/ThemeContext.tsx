import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type DesignLibrary = 'tailwind' | 'bootstrap';

interface ThemeContextType {
  designLibrary: DesignLibrary;
  setDesignLibrary: (library: DesignLibrary) => void;
  toggleDesignLibrary: () => void;
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
    document.body.classList.remove('theme-tailwind', 'theme-bootstrap');
    document.body.classList.add(`theme-${designLibrary}`);
    
    console.log(`🎨 Librería de diseño cambiada a: ${designLibrary}`);
  }, [designLibrary]);

  const setDesignLibrary = (library: DesignLibrary) => {
    setDesignLibraryState(library);
  };

  const toggleDesignLibrary = () => {
    setDesignLibraryState(prev => prev === 'tailwind' ? 'bootstrap' : 'tailwind');
  };

  const value = {
    designLibrary,
    setDesignLibrary,
    toggleDesignLibrary,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
