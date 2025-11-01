import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { Plus, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react';
import GenericList from '../../components/GenericsMaterial/GenericList';
import { useUsersAndRoles } from '../../hooks/useUsersAndRoles';
import { userRoleService } from '../../services/userRoleService';
import { useNavigate } from 'react-router-dom';

const ListUsersWithRoles: React.FC = () => {
  const navigate = useNavigate();
  const { users, roles, loading: loadingHook, refresh } = useUsersAndRoles();
  const [loading, setLoading] = useState<boolean>(true);
  const [userRolesMap, setUserRolesMap] = useState<Record<string, number[]>>({});

  useEffect(() => {
    // Load user-role relationships once and build a map userId -> [roleId]
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const all = await userRoleService.getAll();
        const map: Record<string, number[]> = {};
        all.forEach((ur: any) => {
          // Support both camelCase and snake_case shapes from backend
          const uid = String(
            // prefer explicit userId, then nested user.id, then snake_case user_id
            ur.userId ?? ur.user?.id ?? ur.user_id ?? ''
          );
          if (!uid) return;
          map[uid] = map[uid] || [];

          // role id may come as roleId, nested role.id, or snake_case role_id
          const rid = ur.roleId ?? (ur.role && (ur.role as any).id) ?? ur.role_id ?? null;
          if (rid !== null && rid !== undefined) {
            // store as number when possible
            const numeric = Number(rid);
            map[uid].push(Number.isNaN(numeric) ? rid : numeric);
          }
        });
        if (mounted) setUserRolesMap(map);
      } catch (err) {
        console.error('Error cargando relaciones user-roles:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [refresh]);

  const handleAction = (action: string, item: any) => {
    if (action === 'edit') navigate(`/user-roles/update/${item.id}`);
    else if (action === 'view') navigate(`/users/view/${item.id}`);
    else if (action === 'delete') {
      // Defer to existing Users List delete flow or implement modal here
      // For now, navigate to users list where delete logic exists
      navigate('/users');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Correo' },
    {
      key: 'roles',
      label: 'Roles',
      render: (row: any) => {
        const ids = userRolesMap[String(row.id)] || [];
        if (!ids.length) return <span className="text-muted">-</span>;
        return (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ids.map((rid) => {
              const r = roles.find((x: any) => Number(x.id) === Number(rid));
              return (
                <span key={rid} style={{ background: '#fff8e1', color: '#7a4b00', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>
                  {r?.name ?? `#${rid}`}
                </span>
              );
            })}
          </div>
        );
      },
    },
  ];

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>Usuarios y Roles</h2>
              <p className="text-muted mb-0">Listado de usuarios con sus roles asignados <Badge bg="secondary">{users.length}</Badge></p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <Button variant="outline-secondary" size="sm" onClick={() => { refresh(); setLoading(true); }} className="d-flex align-items-center gap-2">
                <RefreshCw size={16} />
                Actualizar
              </Button>
              <Button variant="success" onClick={() => navigate('/users/create')} className="d-flex align-items-center gap-2">
                <Plus size={18} />
                Nuevo Usuario
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-3">
              {(loadingHook || loading) ? (
                <div className="text-center py-5"><Spinner animation="border" variant="success" /><p className="mt-3 text-muted">Cargando...</p></div>
              ) : (
                <GenericList
                  data={users as any}
                  columns={columns as any}
                  loading={loadingHook || loading}
                  selectable
                  idKey="id"
                  actions={[
                    { name: 'view', icon: <Eye />, tooltip: 'Ver', color: 'info' },
                    { name: 'edit', icon: <Edit />, tooltip: 'Editar', color: 'warning' },
                    { name: 'delete', icon: <Trash2 />, tooltip: 'Eliminar', color: 'error' },
                  ]}
                  onAction={handleAction}
                  emptyMessage="No hay usuarios"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ListUsersWithRoles;
