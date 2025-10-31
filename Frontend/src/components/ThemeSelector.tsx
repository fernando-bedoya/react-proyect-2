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

  // Colores de cada tema
  const themeColors: Record<string, string> = {
    bootstrap: '#7952b3',
    tailwind: '#38bdf8',
    material: '#1976d2'
  };

  return (
    <div className="d-inline-block" style={{ position: 'relative', zIndex: 10 }}>
      <Dropdown>
        <Dropdown.Toggle 
          variant="light" 
          id="theme-selector"
          size="sm"
          className="d-flex align-items-center shadow-sm"
          style={{
            borderRadius: '0.5rem',
            border: `2px solid ${themeColors[designLibrary]}`,
            padding: '0.4rem 0.8rem'
          }}
        >
          <Palette 
            size={16} 
            className="me-2" 
            style={{ color: themeColors[designLibrary] }}
          />
          <span className="fw-semibold small">{themeNames[designLibrary]}</span>
        </Dropdown.Toggle>

        <Dropdown.Menu align="end" className="shadow">
          <Dropdown.Header className="fw-bold">
            <Palette size={16} className="me-2" />
            Seleccionar Tema
          </Dropdown.Header>
          <Dropdown.Divider />
          
          <Dropdown.Item
            active={designLibrary === 'bootstrap'}
            onClick={() => setDesignLibrary('bootstrap')}
            className="d-flex align-items-center"
          >
            <div 
              className="me-2"
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: themeColors.bootstrap
              }}
            />
            Bootstrap 5
            {designLibrary === 'bootstrap' && (
              <span className="ms-auto text-success">✓</span>
            )}
          </Dropdown.Item>

          <Dropdown.Item
            active={designLibrary === 'tailwind'}
            onClick={() => setDesignLibrary('tailwind')}
            className="d-flex align-items-center"
          >
            <div 
              className="me-2"
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: themeColors.tailwind
              }}
            />
            Tailwind CSS
            {designLibrary === 'tailwind' && (
              <span className="ms-auto text-success">✓</span>
            )}
          </Dropdown.Item>

          <Dropdown.Item
            active={designLibrary === 'material'}
            onClick={() => setDesignLibrary('material')}
            className="d-flex align-items-center"
          >
            <div 
              className="me-2"
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: themeColors.material
              }}
            />
            Material UI
            {designLibrary === 'material' && (
              <span className="ms-auto text-success">✓</span>
            )}
          </Dropdown.Item>

          <Dropdown.Divider />
          <Dropdown.Item disabled className="text-muted small">
            El tema se guarda automáticamente
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default ThemeSelector;
