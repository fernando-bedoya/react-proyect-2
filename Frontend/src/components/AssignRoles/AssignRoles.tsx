import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button, Spinner, Badge, Alert } from "react-bootstrap";
import { UserPlus, RefreshCw } from "lucide-react";
import { userService } from "../../services/userService";
import { roleService } from "../../services/Role/roleService";
import { userRoleService } from "../../services/userRoleService";
import type { User } from "../../models/User";
import type { Role } from "../../models/Role";
import Swal from "sweetalert2";

/**
 * Componente para asignar uno o varios roles a un usuario.
 * - Usa Autocomplete para seleccionar usuario
 * - Usa Autocomplete multiple para seleccionar roles
 * - Botón 'Asignar' que llama a userRoleService.assignRoles
 * Buenas prácticas: hooks, manejo de errores, modularidad.
 * Usa color 'warning' (amarillo) para el tema visual solicitado.
 */
export const AssignRoles: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [u, r] = await Promise.all([userService.getUsers(), roleService.getRoles()]);
        if (!mounted) return;
        setUsers(u || []);
        setRoles(r || []);
      } catch (err) {
        console.error(err);
        setError("Error cargando usuarios/roles");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleAssign = async () => {
    if (!selectedUserId || !selectedRoleIds.length) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const ok = await userRoleService.assignRoles(selectedUserId, selectedRoleIds);
      if (ok) {
        await Swal.fire({
          title: '¡Éxito!',
          text: 'Roles asignados correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        setSuccess("Roles asignados correctamente");
        setSelectedUserId(null);
        setSelectedRoleIds([]);
      } else {
        setError("No se pudieron asignar los roles");
      }
    } catch (error: any) {
      console.error(error);
      const serverMsg = error?.response?.data?.message || error?.message || "Error al asignar roles";
      setError(serverMsg);
      await Swal.fire({
        title: 'Error',
        text: serverMsg,
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h2 fw-bold mb-2" style={{ color: '#10b981' }}>
                <UserPlus className="me-2" size={32} style={{ verticalAlign: 'middle' }} />
                👥 Asignar Roles a Usuario
              </h2>
              <p className="text-muted mb-0">Selecciona un usuario y los roles que deseas asignarle</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-3">
          {success}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="d-flex align-items-center gap-2 mb-3">
          <Spinner animation="border" size="sm" variant="success" />
          <span className="text-muted">Cargando...</span>
        </div>
      )}

      {/* Form Card */}
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <Row className="g-4">
            {/* Select User */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold text-success">
                  <span className="me-2">👤</span>
                  Seleccionar Usuario *
                </Form.Label>
                <Form.Select
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                  disabled={loading}
                  className="form-select-lg"
                >
                  <option value="">-- Selecciona un usuario --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email || `Usuario #${user.id}`}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Usuario al que se asignarán los roles seleccionados
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Select Roles */}
            <Col md={6}>
              <Form.Label className="fw-semibold text-success">
                <span className="me-2">🛡️</span>
                Seleccionar Roles * ({selectedRoleIds.length} seleccionados)
              </Form.Label>
              <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {roles.length === 0 ? (
                  <p className="text-muted mb-0">No hay roles disponibles</p>
                ) : (
                  roles.map(role => (
                    <Form.Check
                      key={role.id}
                      type="checkbox"
                      id={`role-${role.id}`}
                      label={
                        <span>
                          {role.name || `Rol #${role.id}`}
                          {selectedRoleIds.includes(role.id as number) && (
                            <Badge bg="success" className="ms-2">✓</Badge>
                          )}
                        </span>
                      }
                      checked={selectedRoleIds.includes(role.id as number)}
                      onChange={() => handleRoleToggle(role.id as number)}
                      disabled={loading}
                      className="mb-2"
                    />
                  ))
                )}
              </div>
              <Form.Text className="text-muted">
                Selecciona uno o más roles para asignar
              </Form.Text>
            </Col>
          </Row>

          {/* Action Buttons */}
          <Row className="mt-4">
            <Col>
              <div className="d-flex gap-2">
                <Button
                  variant="success"
                  size="lg"
                  disabled={!selectedUserId || selectedRoleIds.length === 0 || loading}
                  onClick={handleAssign}
                  className="px-4"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Asignando...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} className="me-2" />
                      Asignar Roles
                    </>
                  )}
                </Button>

                <Button
                  variant="outline-secondary"
                  size="lg"
                  onClick={() => {
                    setSelectedUserId(null);
                    setSelectedRoleIds([]);
                    setError(null);
                    setSuccess(null);
                  }}
                  disabled={loading}
                >
                  <RefreshCw size={18} className="me-2" />
                  Limpiar
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AssignRoles;
