import React from 'react';
import { Table, Button, Badge } from 'react-bootstrap';
import { Edit, Trash2, Eye, MoreVertical } from 'lucide-react';

interface Action {
  name: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger';
  icon?: 'edit' | 'delete' | 'view' | 'more';
}

interface GenericTableProps {
  data: Record<string, any>[];
  columns: string[];
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
  
  // Función para obtener el icono correspondiente
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

  // Función para formatear el nombre de la columna
  const formatColumnName = (column: string) => {
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

  const tableContent = (
    <Table 
      striped={striped} 
      hover={hover} 
      bordered={bordered}
      size={size === 'sm' ? 'sm' : undefined}
      className={`mb-0 ${className}`}
    >
      <thead className="bg-light">
        <tr>
          {columns.map((col) => (
            <th 
              key={col} 
              className="fw-semibold text-uppercase"
              style={{ fontSize: '0.875rem', letterSpacing: '0.5px' }}
            >
              {formatColumnName(col)}
            </th>
          ))}
          {actions.length > 0 && (
            <th 
              className="text-center fw-semibold text-uppercase"
              style={{ 
                fontSize: '0.875rem', 
                letterSpacing: '0.5px',
                width: `${actions.length * 60}px`
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
              className="text-center text-muted py-4"
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((item, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={col} className="align-middle">
                  {renderCellValue(item[col])}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="text-center align-middle">
                  <div className="d-flex gap-2 justify-content-center">
                    {actions.map((action) => (
                      <Button
                        key={action.name}
                        variant={action.variant || 'outline-primary'}
                        size="sm"
                        onClick={() => onAction(action.name, item)}
                        className="d-flex align-items-center gap-1"
                        style={{ 
                          minWidth: action.icon ? '36px' : 'auto',
                          transition: 'all 0.3s ease'
                        }}
                        title={action.label}
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
      <div className="table-responsive rounded-3 shadow-sm">
        {tableContent}
      </div>
    );
  }

  return tableContent;
};

export default GenericTable;
