import Sidebar from './Sidebar';

/**
 * AdaptiveSidebar Component - Componente adaptador para el sidebar
 * 
 * Este componente simplificado siempre utiliza el mismo componente Sidebar genérico
 * para todas las librerías de diseño (Bootstrap, Tailwind, Material).
 * 
 * Esto maximiza la reutilización de código y asegura consistencia visual
 * entre todas las variantes de la interfaz, ya que el Sidebar.tsx está diseñado
 * para funcionar correctamente con cualquier sistema de diseño.
 * 
 * @param sidebarOpen - Estado que indica si el sidebar está abierto (mobile)
 * @param setSidebarOpen - Función para cambiar el estado de apertura
 */
interface AdaptiveSidebarProps {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}

const AdaptiveSidebar = (props: AdaptiveSidebarProps) => {
  // Convertir el prop sidebarOpen a boolean (podría venir como string o undefined)
  const sidebarOpenBool = Boolean(props.sidebarOpen);

  // Siempre retornar el componente Sidebar genérico sin importar la librería de diseño
  // El componente Sidebar.tsx maneja internamente los estilos adaptativos
  return <Sidebar sidebarOpen={sidebarOpenBool} setSidebarOpen={props.setSidebarOpen} />;
};

export default AdaptiveSidebar;
