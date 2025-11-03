import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { Plus, RefreshCw, Eye, Edit, Trash2 } from 'lucide-react';
import GenericList from '../../components/GenericsMaterial/GenericList';
import { useUsersAndRoles } from '../../hooks/useUsersAndRoles';
import { userRoleService } from '../../services/userRoleService';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const ListUsersWithRoles: React.FC = () => {
  const navigate = useNavigate();
  const { users, roles, loading: loadingHook, refresh } = useUsersAndRoles();
  const [loading, setLoading] = useState<boolean>(true);
  const [userRolesMap, setUserRolesMap] = useState<Record<string, number[]>>({});
  const { roleId } = useParams<{ roleId?: string }>();
  const roleNum = roleId ? Number(roleId) : null;

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

  // compute filtered users when a roleId is provided via URL params
  const filteredUsers = (roleNum !== null && !Number.isNaN(roleNum))
    ? (users || []).filter((u: any) => (userRolesMap[String(u.id)] || []).includes(roleNum))
    : users;

  const currentRole = (roleNum !== null && !Number.isNaN(roleNum)) ? roles.find((r: any) => Number(r.id) === roleNum) : null;

  // actions: if we're viewing users filtered by a role, only show the 'delete' role action
  const listActions = (roleNum !== null && !Number.isNaN(roleNum))
    ? [
        { name: 'delete', icon: <Trash2 />, tooltip: 'Eliminar rol', color: 'error' },
      ]
    : [
        { name: 'view', icon: <Eye />, tooltip: 'Ver', color: 'info' },
        { name: 'edit', icon: <Edit />, tooltip: 'Editar', color: 'warning' },
        { name: 'delete', icon: <Trash2 />, tooltip: 'Eliminar', color: 'error' },
      ];

  const handleAction = async (action: string, item: any) => {
    if (action === 'edit') {
      navigate(`/user-roles/update/${item.id}`);
      return;
    }
    if (action === 'view') {
      navigate(`/users/view/${item.id}`);
      return;
    }

    if (action === 'delete') {
      // If viewing users filtered by a role, delete the user-role assignment on backend
      if (roleNum !== null && !Number.isNaN(roleNum)) {
        const res = await Swal.fire({
          title: 'Eliminar asignación',
          text: `¿Desea eliminar el rol ${currentRole?.name ?? `#${roleNum}`} de este usuario?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#10b981',
        });

        if (!res.isConfirmed) return;

        try {
          setLoading(true);
          // Try to find the user-role relation for this user
          const userIdNum = Number(item.id);
          const relations = await userRoleService.getByUserId(userIdNum);
          // relation shape may vary: roleId, role.id, role_id
          const rel = relations.find((r: any) => {
            const rid = r.roleId ?? (r.role && (r.role as any).id) ?? r.role_id ?? null;
            return Number(rid) === Number(roleNum);
          });

          if (!rel) {
            await Swal.fire('No encontrado', 'No se encontró la relación user-role para eliminar.', 'error');
            return;
          }

          const ok = await userRoleService.delete(rel.id ?? rel.user_role_id ?? rel.userRoleId ?? relId);
          if (ok) {
            await Swal.fire('Eliminado', 'La asignación se ha eliminado correctamente.', 'success');
            // rebuild local map to reflect change immediately
            try {
              const all = await userRoleService.getAll();
              const map: Record<string, number[]> = {};
              all.forEach((ur: any) => {
                const uid = String(ur.userId ?? ur.user?.id ?? ur.user_id ?? '');
                if (!uid) return;
                map[uid] = map[uid] || [];
                const rid = ur.roleId ?? (ur.role && (ur.role as any).id) ?? ur.role_id ?? null;
                if (rid !== null && rid !== undefined) {
                  const numeric = Number(rid);
                  map[uid].push(Number.isNaN(numeric) ? rid : numeric);
                }
              });
              setUserRolesMap(map);
            } catch (e) {
              console.error('Error refrescando relaciones user-role:', e);
            }
          } else {
            await Swal.fire('Error', 'No se pudo eliminar la asignación en el servidor.', 'error');
          }
        } catch (err) {
          console.error('Error eliminando asignación user-role:', err);
          await Swal.fire('Error', 'Ocurrió un error al intentar eliminar la asignación.', 'error');
        } finally {
          setLoading(false);
        }
      } else {
        // Default behavior: redirect to users list where delete logic may exist
        navigate('/users');
      }
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
              <h2 className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>{currentRole ? `Usuarios con rol: ${currentRole.name}` : 'Usuarios y Roles'}</h2>
              <p className="text-muted mb-0">Listado de usuarios con sus roles asignados <Badge bg="secondary">{(filteredUsers || []).length}</Badge></p>
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
                    data={filteredUsers as any}
                    columns={columns as any}
                    loading={loadingHook || loading}
                    selectable
                    idKey="id"
                    actions={listActions}
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
