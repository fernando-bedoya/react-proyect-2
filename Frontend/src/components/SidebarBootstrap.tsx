import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Offcanvas } from 'react-bootstrap';
import { 
  Users, 
  Shield, 
  Key,
  X
} from 'lucide-react';
import Logo from '../images/logo/logo.svg';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

/**
 * SidebarBootstrap Component - Menú lateral de navegación con estilo Bootstrap
 * 
 * Versión Bootstrap del componente Sidebar que muestra únicamente las 3 opciones principales de administración:
 * - Users: Gestión de usuarios (icono Users de lucide-react)
 * - Roles: Gestión de roles (icono Shield de lucide-react)
 * - Permissions: Gestión de permisos (icono Key de lucide-react)
 * 
 * Características:
 * - Usa Offcanvas de React-Bootstrap para el sidebar responsive
 * - Fondo oscuro con degradado (gray-800 a gray-900) para mejor contraste visual
 * - Texto en gris claro que cambia a blanco en hover
 * - Cada ruta activa tiene un degradado de color único (azul, verde, púrpura)
 * - Iconos de lucide-react en lugar de SVG manualmente
 * - Responsive: Offcanvas en móviles
 * 
 * @param sidebarOpen - Estado que indica si el sidebar está abierto (mobile)
 * @param setSidebarOpen - Función para cambiar el estado de apertura
 */
interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const SidebarBootstrap = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  // Obtener usuario del store de Redux - solo muestra el sidebar si hay usuario autenticado
  const user = useSelector((state: RootState) => state.user.user);
  
  // Estado para controlar qué item está expandido (aunque en este caso simplificado no hay sub-items)
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Definición de los 3 items del menú simplificado
  const menuItems = [
    {
      title: 'Users',
      icon: <Users size={20} />,
      path: '/users',
      color: 'blue', // Azul para Users
    },
    {
      title: 'Roles',
      icon: <Shield size={20} />,
      path: '/roles/list',
      color: 'green', // Verde para Roles
    },
    {
      title: 'Permissions',
      icon: <Key size={20} />,
      path: '/permissions/list',
      color: 'purple', // Púrpura para Permissions
    },
  ];

  // Función para obtener el estilo del gradiente según el color
  const getGradientStyle = (color: string) => {
    const gradients: Record<string, string> = {
      blue: 'linear-gradient(to right, #2563eb, #3b82f6)',
      green: 'linear-gradient(to right, #16a34a, #22c55e)',
      purple: 'linear-gradient(to right, #9333ea, #a855f7)',
    };
    return gradients[color] || gradients.blue;
  };

  // Contenido del sidebar (reutilizado en desktop y mobile)
  const SidebarContent = () => (
    <div className="d-flex flex-column h-100" style={{ 
      background: 'linear-gradient(to bottom, #1f2937, #111827)',
      color: '#e5e7eb'
    }}>
      {/* Header con Logo */}
      <div className="d-flex align-items-center justify-content-between p-4 border-bottom" style={{ borderColor: '#374151' }}>
        <NavLink to="/" className="text-decoration-none">
          <img src={Logo} alt="Logo" style={{ height: '40px' }} />
        </NavLink>
        {/* Botón para cerrar en móvil (solo visible en Offcanvas) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="btn btn-link text-light d-lg-none p-0"
          style={{ textDecoration: 'none' }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-grow-1 p-4">
        <h6 className="text-uppercase mb-3 px-3" style={{ 
          fontSize: '0.75rem', 
          color: '#9ca3af',
          letterSpacing: '0.05em',
          fontWeight: 600
        }}>
          ADMINISTRACIÓN
        </h6>

        <ul className="list-unstyled">
          {menuItems.map((item) => (
            <li key={item.title} className="mb-2">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `d-flex align-items-center gap-3 text-decoration-none rounded-3 p-3 transition-all ${
                    isActive ? 'text-white' : 'text-light'
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? getGradientStyle(item.color) : 'transparent',
                  color: isActive ? 'white' : '#d1d5db',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = '#374151';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#d1d5db';
                  }
                }}
              >
                {item.icon}
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  // Si no hay usuario, no mostrar sidebar
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Sidebar Desktop - Visible en pantallas grandes */}
      <aside 
        className="d-none d-lg-block position-fixed top-0 start-0 h-100"
        style={{ 
          width: '280px',
          zIndex: 9999,
          borderRight: '2px solid #374151',
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile - Offcanvas para pantallas pequeñas */}
      <Offcanvas 
        show={sidebarOpen} 
        onHide={() => setSidebarOpen(false)}
        placement="start"
        style={{ width: '280px' }}
      >
        <Offcanvas.Body className="p-0">
          <SidebarContent />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default SidebarBootstrap;
