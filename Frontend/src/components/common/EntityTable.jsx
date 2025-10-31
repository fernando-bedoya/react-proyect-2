// EntityTable.jsx - Componente genérico para tablas de datos con Bootstrap
// Este componente muestra datos en formato tabla con opciones de editar y eliminar
// Sirve para listar cualquier tipo de entidad (usuarios, roles, permisos, etc.) de forma reutilizable

import React from 'react';
import { Table, Button, Container } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';

/**
 * Componente genérico para mostrar datos en una tabla con acciones
 * @param {Array} columns - Configuración de columnas [{ key, label, render }]
 * @param {Array} data - Datos a mostrar en la tabla
 * @param {Function} onEdit - Callback para editar un registro
 * @param {Function} onDelete - Callback para eliminar un registro
 * @param {Boolean} striped - Tabla con rayas alternadas (opcional)
 * @param {Boolean} bordered - Tabla con bordes (opcional)
 * @param {Boolean} hover - Efecto hover en filas (opcional)
 * @param {Boolean} responsive - Tabla responsive (opcional)
 * @param {String} size - Tamaño de la tabla: 'sm' | 'md' | 'lg' (opcional)
 */
const EntityTable = ({
  columns = [],
  data = [],
  onEdit,
  onDelete,
  striped = true,
  bordered = true,
  hover = true,
  responsive = true,
  size = 'md',
  showActions = true,
  emptyMessage = 'No hay datos disponibles',
}) => {
  /**
   * Renderiza el valor de una celda
   * Si la columna tiene una función render personalizada, la usa
   * Si no, muestra el valor directamente
   */
  const renderCell = (row, column) => {
    if (column.render && typeof column.render === 'function') {
      return column.render(row[column.key], row);
    }
    return row[column.key];
  };

  return (
    <Container fluid className="p-0">
      <div className={responsive ? 'table-responsive' : ''}>
        <Table
          striped={striped}
          bordered={bordered}
          hover={hover}
          size={size}
          className="mb-0"
        >
          <thead className="table-dark">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className={column.className || ''}
                  style={column.style || {}}
                >
                  {column.label}
                </th>
              ))}
              {showActions && (
                <th className="text-center" style={{ width: '150px' }}>
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td
                      key={`${row.id || rowIndex}-${column.key || colIndex}`}
                      className={column.cellClassName || ''}
                      style={column.cellStyle || {}}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                  {showActions && (
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {onEdit && (
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => onEdit(row)}
                            title="Editar"
                            className="d-flex align-items-center gap-1"
                          >
                            <FaEdit />
                            <span className="d-none d-md-inline">Editar</span>
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(row)}
                            title="Eliminar"
                            className="d-flex align-items-center gap-1"
                          >
                            <FaTrash />
                            <span className="d-none d-md-inline">Eliminar</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="text-center text-muted py-4"
                >
                  <em>{emptyMessage}</em>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
};

export default EntityTable;
