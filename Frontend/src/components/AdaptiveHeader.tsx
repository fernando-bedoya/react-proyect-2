import Header from './Header';

/**
 * 🔄 AdaptiveHeader - Componente adaptador simplificado para el Header
 * 
 * ANTES: Tenía lógica condicional para usar HeaderBootstrap cuando designLibrary === 'bootstrap'
 * AHORA: Simplificado para usar SIEMPRE el componente Header genérico
 * 
 * RAZÓN DEL CAMBIO:
 * - Maximizar la reutilización de componentes eliminando duplicación
 * - El componente Header.tsx genérico ya está diseñado para funcionar con todas las librerías
 * - Eliminar HeaderBootstrap.tsx específico reduce mantenimiento y posibles bugs
 * 
 * El Header genérico se adapta automáticamente al tema activo (Bootstrap, Tailwind, Material)
 * usando clases CSS condicionales basadas en useTheme() internamente.
 */

interface AdaptiveHeaderProps {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}

const AdaptiveHeader = (props: AdaptiveHeaderProps) => {
  // ✅ Siempre usa el componente Header genérico para todos los temas
  // El Header se encarga internamente de adaptarse al tema activo (Bootstrap, Tailwind, Material)
  return <Header sidebarOpen={props.sidebarOpen} setSidebarOpen={props.setSidebarOpen} />;
};

export default AdaptiveHeader;
