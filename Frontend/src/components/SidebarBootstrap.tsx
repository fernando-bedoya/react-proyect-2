import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Offcanvas, Badge } from 'react-bootstrap';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Settings, 
  Table, 
  BarChart3, 
  User,
  ChevronDown,
  X,
  Flame
} from 'lucide-react';
import Logo from '../images/logo/logo.svg';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const SidebarBootstrap = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const user = useSelector((state: RootState) => state.user.user);
  const location = useLocation();
  const { pathname } = location;

  // Estilos del tema verde
  const themeColors = {
    primary: '#10b981', // Verde principal
    primaryDark: '#059669',
    primaryLight: '#d1fae5',
    sidebar: '#1a1a1a',
    sidebarHover: '#2a2a2a',
    text: '#e5e7eb',
    textMuted: '#9ca3af',
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      path: '/',
      badge: null,
      subItems: [
        { title: 'eCommerce', path: '/' },
      ]
    },
    {
      title: 'Calendar',
      icon: <Calendar size={18} />,
      path: '/calendar',
      badge: null,
    },
    {
      title: 'Profile',
      icon: <User size={18} />,
      path: '/profile',
      badge: null,
    },
    {
      title: 'Forms',
      icon: <FileText size={18} />,
      path: '#',
      badge: null,
      subItems: [
        { title: 'Form Elements', path: '/forms/form-elements' },
        { title: 'Form Layout', path: '/forms/form-layout' },
      ]
    },
    {
      title: 'Tables',
      icon: <Table size={18} />,
      path: '/tables',
      badge: null,
    },
    {
      title: 'Settings',
      icon: <Settings size={18} />,
      path: '/settings',
      badge: null,
    },
    {
      title: 'Chart',
      icon: <BarChart3 size={18} />,
      path: '/chart',
      badge: <Badge bg="success">New</Badge>,
    },
    {
      title: 'Firebase',
      icon: <Flame size={18} />,
      path: '/firebase',
      badge: <Badge bg="danger">🔥</Badge>,
    },
  ];

  // Componente para items con sub-menú
  const MenuItemWithSubmenu = ({ item }: any) => {
    const [open, setOpen] = useState(
      item.subItems?.some((sub: any) => pathname === sub.path) || false
    );

    return (
      <div className="mb-2">
        <div
          onClick={() => setOpen(!open)}
          className="d-flex align-items-center justify-content-between p-3 rounded cursor-pointer"
          style={{
            backgroundColor: pathname.includes(item.path) && item.path !== '#' 
              ? themeColors.primaryDark 
              : 'transparent',
            color: themeColors.text,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!pathname.includes(item.path)) {
              e.currentTarget.style.backgroundColor = themeColors.sidebarHover;
            }
          }}
          onMouseLeave={(e) => {
            if (!pathname.includes(item.path)) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div className="d-flex align-items-center gap-3">
            {item.icon}
            <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>
              {item.title}
            </span>
          </div>
          <ChevronDown 
            size={16} 
            style={{ 
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }} 
          />
        </div>
        
        {open && item.subItems && (
          <div className="ps-4 mt-2">
            {item.subItems.map((subItem: any, subIndex: number) => (
              <NavLink
                key={subIndex}
                to={subItem.path}
                className="d-block p-2 ps-4 rounded text-decoration-none"
                style={({ isActive }) => ({
                  color: isActive ? themeColors.primary : themeColors.textMuted,
                  backgroundColor: isActive ? themeColors.sidebarHover : 'transparent',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                })}
                onMouseEnter={(e) => {
                  if (!pathname.includes(subItem.path)) {
                    e.currentTarget.style.backgroundColor = themeColors.sidebarHover;
                    e.currentTarget.style.color = themeColors.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!pathname.includes(subItem.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = themeColors.textMuted;
                  }
                }}
              >
                {subItem.title}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Componente para items simples
  const SimpleMenuItem = ({ item }: any) => {
    return (
      <NavLink
        to={item.path}
        className="d-flex align-items-center justify-content-between p-3 rounded text-decoration-none mb-2"
        style={({ isActive }) => ({
          backgroundColor: isActive ? themeColors.primaryDark : 'transparent',
          color: themeColors.text,
          transition: 'all 0.3s ease',
        })}
        onMouseEnter={(e) => {
          if (!pathname.includes(item.path)) {
            e.currentTarget.style.backgroundColor = themeColors.sidebarHover;
          }
        }}
        onMouseLeave={(e) => {
          if (!pathname.includes(item.path)) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <div className="d-flex align-items-center gap-3">
          {item.icon}
          <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>
            {item.title}
          </span>
        </div>
        {item.badge && item.badge}
      </NavLink>
    );
  };

  // Sidebar content
  const sidebarContent = (
    <div 
      className="h-100 d-flex flex-column"
      style={{ 
        backgroundColor: themeColors.sidebar,
        color: themeColors.text,
      }}
    >
      {/* Header del Sidebar */}
      <div 
        className="d-flex align-items-center justify-content-between p-4 border-bottom"
        style={{ borderColor: '#2a2a2a !important' }}
      >
        <NavLink to="/" className="text-decoration-none">
          <img src={Logo} alt="Logo" style={{ maxHeight: '40px' }} />
        </NavLink>
        
        {/* Botón de cerrar solo en móvil */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="btn btn-link text-white p-0 d-lg-none"
        >
          <X size={24} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-grow-1 overflow-auto p-4">
        <div className="mb-3">
          <small 
            className="text-uppercase fw-semibold d-block mb-3"
            style={{ 
              color: themeColors.textMuted,
              fontSize: '0.75rem',
              letterSpacing: '0.05em'
            }}
          >
            MENÚ
          </small>
          
          <div>
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.subItems ? (
                  <MenuItemWithSubmenu item={item} />
                ) : (
                  <SimpleMenuItem item={item} />
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer del Sidebar - Información del usuario */}
      {user && (
        <div 
          className="p-4 border-top"
          style={{ 
            borderColor: '#2a2a2a !important',
            backgroundColor: '#0f0f0f'
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: themeColors.primary,
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-grow-1">
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {user.name || 'Usuario'}
              </div>
              <small style={{ color: themeColors.textMuted, fontSize: '0.8rem' }}>
                {user.email || 'user@example.com'}
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Renderizado condicional basado en el usuario
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Sidebar para Desktop (≥992px) */}
      <aside
        className="d-none d-lg-flex flex-column position-fixed top-0 start-0 h-100"
        style={{
          width: '280px',
          zIndex: 1000,
          backgroundColor: themeColors.sidebar,
        }}
      >
        {sidebarContent}
      </aside>

      {/* Offcanvas para Mobile (<992px) */}
      <Offcanvas
        show={sidebarOpen}
        onHide={() => setSidebarOpen(false)}
        placement="start"
        className="d-lg-none"
        style={{
          backgroundColor: themeColors.sidebar,
          width: '280px',
        }}
      >
        {sidebarContent}
      </Offcanvas>
    </>
  );
};

export default SidebarBootstrap;
