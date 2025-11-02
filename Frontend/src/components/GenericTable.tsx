import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
// Material UI imports
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button as MuiButton,
  Chip,
  IconButton,
} from '@mui/material';

interface Action {
  name: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger';
  icon?: 'edit' | 'delete' | 'view' | 'more';
}

interface GenericTableProps {
  data: Record<string, any>[];
  columns: string[];
  columnLabels?: Record<string, string>; // { id: "ID", name: "Nombre" }
  actions: Action[];
  onAction: (name: string, item: Record<string, any>) => void;
  striped?: boolean;
  hover?: boolean;
  bordered?: boolean;
  responsive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  emptyMessage?: string;
}

const GenericTable: React.FC<GenericTableProps> = ({ 
  data, 
  columns,
  columnLabels = {},
  actions, 
  onAction,
  striped = true,
  hover = true,
  bordered = false,
  responsive = true,
  size = 'md',
  className = '',
  emptyMessage = 'No hay datos disponibles'
}) => {
  const { designLibrary } = useTheme();
  
  // Función para obtener el icono correspondiente (Bootstrap/Tailwind)
  const getActionIcon = (iconName?: string) => {
    switch (iconName) {
      case 'edit':
        return <Edit size={16} />;
      case 'delete':
        return <Trash2 size={16} />;
      case 'view':
        return <Eye size={16} />;
      case 'more':
        return <MoreVertical size={16} />;
      default:
        return null;
    }
  };

  // Función para obtener el icono (lucide-react)
  const getMuiIcon = (iconName?: string) => {
    switch (iconName) {
      case 'edit':
        return <Edit size={18} />;
      case 'delete':
        return <Trash2 size={18} />;
      case 'view':
        return <Eye size={18} />;
      case 'more':
        return <MoreVertical size={18} />;
      default:
        return null;
    }
  };

  // Mapear variantes de Bootstrap a colores de Material UI
  const getMuiColor = (variant?: string) => {
    const colorMap: Record<string, 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'> = {
      'primary': 'primary',
      'secondary': 'secondary',
      'success': 'success',
      'danger': 'error',
      'warning': 'warning',
      'info': 'info',
      'outline-primary': 'primary',
      'outline-secondary': 'secondary',
      'outline-success': 'success',
      'outline-danger': 'error',
    };
    return colorMap[variant || 'primary'] || 'primary';
  };

  // Función para formatear el nombre de la columna
  const formatColumnName = (column: string) => {
    // Si hay un label personalizado, usarlo
    if (columnLabels[column]) {
      return columnLabels[column];
    }
    // Si no, formatear automáticamente
    return column
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Función para renderizar el valor de la celda
  const renderCellValue = (value: any) => {
    if (typeof value === 'boolean') {
      return (
        <Badge bg={value ? 'success' : 'secondary'}>
          {value ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    }
    
    if (value === null || value === undefined) {
      return <span className="text-muted">-</span>;
    }
    
    return value;
  };

  // Renderizado condicional: Material UI (AMBAR/AMARILLO), Tailwind (AZUL), Bootstrap (VERDE)
  if (designLibrary === 'material') {
    return (
      <TableContainer 
        component={Paper} 
        elevation={4} 
        className={className}
        sx={{
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid #f59e0b',
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        }}
      >
        <MuiTable size={size === 'sm' ? 'small' : 'medium'}>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              {columns.map((col) => (
                <TableCell 
                  key={col}
                  sx={{ 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.85rem',
                    letterSpacing: '1px',
                    color: '#ffffff',
                    borderBottom: '2px solid #b45309',
                    fontFamily: '"Roboto Condensed", sans-serif',
                  }}
                >
                  {formatColumnName(col)}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell 
                  align="center"
                  sx={{ 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '0.85rem',
                    letterSpacing: '1px',
                    color: '#ffffff',
                    borderBottom: '2px solid #0d47a1',
                    width: `${actions.length * 60}px`,
                    fontFamily: '"Roboto Condensed", sans-serif',
                  }}
                >
                  Acciones
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
              {data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  align="center"
                  sx={{ 
                    py: 6, 
                      color: '#92400e',
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      backgroundColor: '#fff7ed'
                  }}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow 
                  key={index}
                  hover={hover}
                  sx={{ 
                    '&:nth-of-type(odd)': striped ? { backgroundColor: '#fff7ed' } : {},
                    '&:nth-of-type(even)': striped ? { backgroundColor: '#ffffff' } : {},
                    '&:hover': { backgroundColor: '#ffedd5 !important' },
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  {columns.map((col) => (
                    <TableCell 
                      key={col}
                      sx={{ 
                        color: '#92400e',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        borderBottom: '1px solid #fde68a',
                      }}
                    >
                      {typeof item[col] === 'boolean' ? (
                        <Chip 
                          label={item[col] ? 'Activo' : 'Inactivo'}
                          color={item[col] ? 'primary' : 'default'}
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            backgroundColor: item[col] ? '#f59e0b' : '#fde68a',
                            color: '#ffffff'
                          }}
                        />
                      ) : item[col] === null || item[col] === undefined ? (
                        <span style={{ color: '#f59e0b' }}>-</span>
                      ) : (
                        item[col]
                      )}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell align="center" sx={{ borderBottom: '1px solid #fde68a' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {actions.map((action) => (
                          action.icon ? (
                            <IconButton
                              key={action.name}
                              color={getMuiColor(action.variant)}
                              size="small"
                              onClick={() => onAction(action.name, item)}
                              title={action.label}
                              sx={{
                                backgroundColor: '#fff7ed',
                                '&:hover': { backgroundColor: '#f59e0b', color: '#ffffff' },
                                transition: 'all 0.3s ease',
                              }}
                            >
                              {getMuiIcon(action.icon)}
                            </IconButton>
                          ) : (
                            <MuiButton
                              key={action.name}
                              variant={action.variant?.includes('outline') ? 'outlined' : 'contained'}
                              color={getMuiColor(action.variant)}
                              size="small"
                              onClick={() => onAction(action.name, item)}
                              sx={{ fontWeight: 600 }}
                            >
                              {action.label}
                            </MuiButton>
                          )
                        ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
    );
  }

  // Renderizado TAILWIND (AZUL)
  if (designLibrary === 'tailwind') {
    return (
      <div className={`overflow-hidden rounded-xl border-4 border-blue-500 shadow-2xl ${className}`} style={{ fontFamily: '"Inter", "system-ui", sans-serif' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gradient-to-r from-blue-50 to-indigo-50">
            <thead className="bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-600 text-white" style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)' }}>
              <tr>
                {columns.map((col) => (
                  <th 
                    key={col}
                    className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider border-b-4 border-blue-700"
                    style={{ fontFamily: '"Poppins", sans-serif', letterSpacing: '2px' }}
                  >
                    {formatColumnName(col)}
                  </th>
                ))}
                {actions.length > 0 && (
                  <th 
                    className="px-6 py-4 text-center text-xs font-black uppercase tracking-wider border-b-4 border-blue-700"
                    style={{ fontFamily: '"Poppins", sans-serif', letterSpacing: '2px', width: `${actions.length * 60}px` }}
                  >
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-300">
              {data.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                    className="px-6 py-8 text-center text-blue-700 bg-blue-100 font-bold text-lg"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr 
                    key={index}
                    className={`
                      ${striped && index % 2 === 0 ? 'bg-blue-100' : 'bg-white'}
                      ${hover ? 'hover:bg-blue-200 hover:shadow-lg transition-all duration-300' : ''}
                      border-l-4 border-blue-400
                    `}
                  >
                    {columns.map((col) => (
                      <td 
                        key={col}
                        className="px-6 py-4 text-sm font-semibold text-blue-900"
                        style={{ fontFamily: '"Inter", sans-serif' }}
                      >
                        {typeof item[col] === 'boolean' ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${item[col] ? 'bg-blue-500 text-white' : 'bg-blue-200 text-blue-800'}`}>
                            {item[col] ? 'Activo' : 'Inactivo'}
                          </span>
                        ) : item[col] === null || item[col] === undefined ? (
                          <span className="text-blue-400">-</span>
                        ) : (
                          item[col]
                        )}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          {actions.map((action) => (
                            <button
                              key={action.name}
                              onClick={() => onAction(action.name, item)}
                              title={action.label}
                              className="px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wide bg-blue-500 text-white hover:bg-blue-600 hover:scale-110 transform transition-all duration-200 shadow-md hover:shadow-xl"
                              style={{ fontFamily: '"Poppins", sans-serif' }}
                            >
                              {action.icon && getActionIcon(action.icon)}
                              {!action.icon && <span>{action.label}</span>}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Renderizado Bootstrap (VERDE/EMERALD) - SÚPER MEJORADO
  const tableContent = (
    <Table 
      striped={false}
      hover={hover} 
      bordered={false}
      size={size === 'sm' ? 'sm' : undefined}
      className={`mb-0 ${className}`}
      style={{ 
        fontFamily: '"Inter", "Segoe UI", -apple-system, sans-serif',
        border: 'none',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}
    >
      <thead style={{ 
        background: 'linear-gradient(135deg, #065f46 0%, #047857 20%, #059669 40%, #10b981 60%, #34d399 80%, #6ee7b7 100%)',
        backgroundSize: '200% 100%',
        color: 'white',
        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.5), 0 4px 12px rgba(4, 120, 87, 0.3), inset 0 -3px 0 rgba(255, 255, 255, 0.2)',
        position: 'relative'
      }}>
        <tr>
          {columns.map((col) => (
            <th 
              key={col} 
              className="fw-bold text-uppercase"
              style={{ 
                fontSize: '0.85rem', 
                letterSpacing: '2.8px',
                padding: '22px 24px',
                borderBottom: '4px solid rgba(255, 255, 255, 0.25)',
                fontFamily: '"Inter", sans-serif',
                fontWeight: '900',
                color: '#ffffff',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
                position: 'relative',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%)'
              }}
            >
              {formatColumnName(col)}
            </th>
          ))}
          {actions.length > 0 && (
            <th 
              className="text-center fw-bold text-uppercase"
              style={{ 
                fontSize: '0.85rem', 
                letterSpacing: '2.8px',
                padding: '22px 24px',
                borderBottom: '4px solid rgba(255, 255, 255, 0.25)',
                width: `${actions.length * 60}px`,
                fontFamily: '"Inter", sans-serif',
                fontWeight: '900',
                color: '#ffffff',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%)'
              }}
            >
              Acciones
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td 
              colSpan={columns.length + (actions.length > 0 ? 1 : 0)} 
              className="text-center py-5"
              style={{
                backgroundColor: '#d1fae5',
                color: '#047857',
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((item, index) => (
            <tr 
              key={index}
              style={{
                backgroundColor: index % 2 === 0 ? '#ecfdf5' : '#ffffff',
                borderLeft: '6px solid #10b981',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderBottom: '2px solid #d1fae5',
                position: 'relative'
              }}
              className={hover ? 'table-hover-green' : ''}
              onMouseEnter={(e) => {
                if (hover) {
                  e.currentTarget.style.backgroundColor = '#d1fae5';
                  e.currentTarget.style.transform = 'translateX(6px) scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.35), 0 6px 16px rgba(5, 150, 105, 0.25)';
                  e.currentTarget.style.borderLeftColor = '#047857';
                  e.currentTarget.style.borderLeftWidth = '8px';
                  e.currentTarget.style.zIndex = '10';
                }
              }}
              onMouseLeave={(e) => {
                if (hover) {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ecfdf5' : '#ffffff';
                  e.currentTarget.style.transform = 'translateX(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderLeftColor = '#10b981';
                  e.currentTarget.style.borderLeftWidth = '6px';
                  e.currentTarget.style.zIndex = '1';
                }
              }}
            >
              {columns.map((col) => (
                <td 
                  key={col} 
                  className="align-middle"
                  style={{
                    padding: '18px 24px',
                    color: '#065f46',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    borderBottom: 'none'
                  }}
                >
                  {typeof item[col] === 'boolean' ? (
                    <Badge 
                      bg={item[col] ? 'success' : 'secondary'}
                      style={{
                        backgroundColor: item[col] ? '#10b981' : '#9ca3af',
                        color: '#ffffff',
                        padding: '8px 16px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        borderRadius: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        boxShadow: item[col] ? '0 2px 8px rgba(16, 185, 129, 0.4)' : '0 2px 8px rgba(156, 163, 175, 0.3)'
                      }}
                    >
                      {item[col] ? '✓ Activo' : '✗ Inactivo'}
                    </Badge>
                  ) : item[col] === null || item[col] === undefined ? (
                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Sin dato</span>
                  ) : (
                    item[col]
                  )}
                </td>
              ))}
              {actions.length > 0 && (
                <td 
                  className="text-center align-middle"
                  style={{
                    padding: '16px 20px',
                    borderBottom: 'none'
                  }}
                >
                  <div className="d-flex gap-2 justify-content-center flex-wrap">
                    {actions.map((action) => (
                      <Button
                        key={action.name}
                        variant={action.variant || 'outline-success'}
                        size="sm"
                        onClick={() => onAction(action.name, item)}
                        className="d-flex align-items-center gap-1"
                        style={{ 
                          minWidth: action.icon ? '40px' : 'auto',
                          height: '40px',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          fontWeight: '700',
                          backgroundColor: action.variant?.includes('outline') ? 'transparent' : '#10b981',
                          borderColor: '#10b981',
                          color: action.variant?.includes('outline') ? '#10b981' : '#ffffff',
                          borderWidth: '2px',
                          borderRadius: '10px',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                        }}
                        title={action.label}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.08)';
                          e.currentTarget.style.backgroundColor = '#059669';
                          e.currentTarget.style.borderColor = '#047857';
                          e.currentTarget.style.color = '#ffffff';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(5, 150, 105, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.backgroundColor = action.variant?.includes('outline') ? 'transparent' : '#10b981';
                          e.currentTarget.style.borderColor = '#10b981';
                          e.currentTarget.style.color = action.variant?.includes('outline') ? '#10b981' : '#ffffff';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.2)';
                        }}
                      >
                        {action.icon && getActionIcon(action.icon)}
                        {!action.icon && <span>{action.label}</span>}
                      </Button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );

  if (responsive) {
    return (
      <div 
        className="table-responsive"
        style={{
          boxShadow: '0 25px 70px rgba(16, 185, 129, 0.4), 0 10px 30px rgba(5, 150, 105, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
          border: '5px solid #10b981',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
          position: 'relative'
        }}
      >
        {/* Decoración superior animada */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #10b981 0%, #34d399 25%, #6ee7b7 50%, #34d399 75%, #10b981 100%)',
          backgroundSize: '200% 100%',
          zIndex: 10
        }} />
        {tableContent}
      </div>
    );
  }

  return tableContent;
};

export default GenericTable;
