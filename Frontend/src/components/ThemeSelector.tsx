// ThemeSelector.tsx - Componente selector de tema de diseño que permite cambiar entre Bootstrap, Tailwind y Material UI.
// Se muestra como un botón flotante en la esquina superior derecha de las vistas CRUD.
// Usa React Context para actualizar el tema globalmente y localStorage para persistir la preferencia.

import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeSelector: React.FC = () => {
  const { designLibrary, setDesignLibrary } = useTheme();

  // Mapeo de nombres para mostrar
  const themeNames: Record<string, string> = {
    bootstrap: 'Bootstrap 5',
    tailwind: 'Tailwind CSS',
    material: 'Material UI'
  };

  // Colores y gradientes de cada tema
  // NOTE: Tailwind -> azul, Material -> amarillo (solicitud)
  const themeColors: Record<string, string> = {
    bootstrap: '#10b981',
    tailwind: '#3b82f6', // blue-500
    material: '#f59e0b'  // amber-500 (amarillo)
  };

  const themeGradients: Record<string, string> = {
    bootstrap: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    tailwind: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    material: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  };

  const themeEmojis: Record<string, string> = {
    bootstrap: '🟢',
    tailwind: '🔵',
    material: '🟡'
  };

  return (
    <div className="d-inline-block" style={{ position: 'relative', zIndex: 10 }}>
      <Dropdown>
        <Dropdown.Toggle 
          variant="light" 
          id="theme-selector"
          className="d-flex align-items-center"
          style={{
            borderRadius: '12px',
            border: 'none',
            background: themeGradients[designLibrary],
            color: '#ffffff',
            padding: '10px 18px',
            fontWeight: '700',
            fontSize: '0.9rem',
            boxShadow: `0 6px 20px ${themeColors[designLibrary]}40`,
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
            e.currentTarget.style.boxShadow = `0 10px 30px ${themeColors[designLibrary]}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = `0 6px 20px ${themeColors[designLibrary]}40`;
          }}
        >
          <span className="me-2" style={{ fontSize: '1.2rem' }}>{themeEmojis[designLibrary]}</span>
          <Palette 
            size={18} 
            className="me-2"
          />
          <span>{themeNames[designLibrary]}</span>
        </Dropdown.Toggle>

        <Dropdown.Menu 
          align="end" 
          style={{
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            padding: '12px',
            minWidth: '260px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)'
          }}
        >
          <Dropdown.Header 
            className="fw-bold"
            style={{
              fontSize: '1rem',
              color: '#111827',
              padding: '12px 16px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderBottom: '2px solid #e5e7eb'
            }}
          >
            <Palette size={20} className="me-2" style={{ color: themeColors[designLibrary] }} />
            Seleccionar Tema de Diseño
          </Dropdown.Header>
          <div style={{ margin: '8px 0' }}></div>
          
          <Dropdown.Item
            active={designLibrary === 'bootstrap'}
            onClick={() => setDesignLibrary('bootstrap')}
            className="d-flex align-items-center"
            style={{
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '6px',
              border: designLibrary === 'bootstrap' ? '2px solid #10b981' : '2px solid transparent',
              background: designLibrary === 'bootstrap' ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'transparent',
              fontWeight: designLibrary === 'bootstrap' ? '700' : '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (designLibrary !== 'bootstrap') {
                e.currentTarget.style.background = '#f0fdf4';
                e.currentTarget.style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              if (designLibrary !== 'bootstrap') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
            <span className="me-2" style={{ fontSize: '1.3rem' }}>🟢</span>
            <div 
              className="me-2"
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                background: themeGradients.bootstrap,
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
              }}
            />
            <span style={{ flex: 1 }}>Bootstrap 5</span>
            {designLibrary === 'bootstrap' && (
              <span className="ms-auto" style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: '800' }}>✓</span>
            )}
          </Dropdown.Item>

          <Dropdown.Item
            active={designLibrary === 'tailwind'}
            onClick={() => setDesignLibrary('tailwind')}
            className="d-flex align-items-center"
            style={{
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '6px',
              border: designLibrary === 'tailwind' ? '2px solid #3b82f6' : '2px solid transparent',
              background: designLibrary === 'tailwind' ? 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)' : 'transparent',
              fontWeight: designLibrary === 'tailwind' ? '700' : '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (designLibrary !== 'tailwind') {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              if (designLibrary !== 'tailwind') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
              <span className="me-2" style={{ fontSize: '1.3rem' }}>�</span>
            <div 
              className="me-2"
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                background: themeGradients.tailwind,
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)'
              }}
            />
            <span style={{ flex: 1 }}>Tailwind CSS</span>
            {designLibrary === 'tailwind' && (
              <span className="ms-auto" style={{ color: '#3b82f6', fontSize: '1.2rem', fontWeight: '800' }}>✓</span>
            )}
          </Dropdown.Item>

          <Dropdown.Item
            active={designLibrary === 'material'}
            onClick={() => setDesignLibrary('material')}
            className="d-flex align-items-center"
            style={{
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '6px',
              border: designLibrary === 'material' ? '2px solid #f59e0b' : '2px solid transparent',
              background: designLibrary === 'material' ? 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' : 'transparent',
              fontWeight: designLibrary === 'material' ? '700' : '600',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (designLibrary !== 'material') {
                e.currentTarget.style.background = '#e3f2fd';
                e.currentTarget.style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              if (designLibrary !== 'material') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
            <span className="me-2" style={{ fontSize: '1.3rem' }}>�</span>
            <div 
              className="me-2"
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                background: themeGradients.material,
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
              }}
            />
            <span style={{ flex: 1 }}>Material UI</span>
            {designLibrary === 'material' && (
              <span className="ms-auto" style={{ color: '#f59e0b', fontSize: '1.2rem', fontWeight: '800' }}>✓</span>
            )}
          </Dropdown.Item>

          <div style={{ 
            margin: '12px 8px 4px 8px', 
            borderTop: '2px solid #e5e7eb' 
          }}></div>
          <Dropdown.Item 
            disabled 
            className="text-center"
            style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              fontWeight: '600',
              fontStyle: 'italic',
              padding: '8px 16px'
            }}
          >
            💾 El tema se guarda automáticamente
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default ThemeSelector;
