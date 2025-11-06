import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { Eye, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

import { RolePermission } from '../models/RolePermission';

interface Action {
  name: string;
  label: string;
  icon?: 'view' | 'delete';
  variant?: string;
}

interface Props {
  data: RolePermission[];
  actions?: Action[];
  onAction: (name: string, item: RolePermission) => void;
  emptyMessage?: string;
}

const RolePermissionTable: React.FC<Props> = ({ data, actions = [], onAction, emptyMessage = 'No hay asignaciones de permisos registradas' }) => {
  const { designLibrary } = useTheme();

  const headerGradients: Record<string, string> = {
    bootstrap: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
    tailwind: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    material: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  };

  const headerStyle = { background: headerGradients[designLibrary], color: '#ffffff' };

  const defaultVariant = designLibrary === 'tailwind' ? 'primary' : designLibrary === 'material' ? 'warning' : 'success';

  return (
    <div className="table-responsive">
      <Table hover className="mb-0">
        <thead style={headerStyle}>
          <tr>
            <th style={{ padding: '16px 20px' }}>Rol</th>
            <th style={{ padding: '16px 20px' }}>Permiso</th>
            <th style={{ padding: '16px 20px' }}>Fecha Creación</th>
            {actions.length > 0 && <th style={{ padding: '16px 20px', textAlign: 'center', width: `${actions.length * 60}px` }}>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={actions.length > 0 ? 4 : 3} className="text-center py-4 text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((rp, idx) => (
              <tr key={rp.id ?? idx}>
                <td style={{ verticalAlign: 'middle' }}>
                  {rp.role ? `${rp.role.name} (ID: ${rp.role_id})` : `${rp.role_id}`}
                </td>
                <td style={{ verticalAlign: 'middle' }}>
                  {rp.permission ? `${(rp.permission.method || '').toUpperCase()} ${rp.permission.url} (ID: ${rp.permission_id})` : `ID: ${rp.permission_id}`}
                </td>
                <td style={{ verticalAlign: 'middle' }}>
                  {rp.created_at ? new Date(rp.created_at as any).toLocaleString() : '-'}
                </td>
                {actions.length > 0 && (
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      {actions.map(a => (
                        a.icon === 'view' ? (
                          <Button key={a.name} variant={a.variant || defaultVariant} size="sm" onClick={() => onAction(a.name, rp)} title={a.label}>
                            <Eye size={14} />
                          </Button>
                        ) : a.icon === 'delete' ? (
                          <Button key={a.name} variant={a.variant || 'danger'} size="sm" onClick={() => onAction(a.name, rp)} title={a.label}>
                            <Trash2 size={14} />
                          </Button>
                        ) : (
                          <Button key={a.name} variant={a.variant || 'secondary'} size="sm" onClick={() => onAction(a.name, rp)}>{a.label}</Button>
                        )
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default RolePermissionTable;
