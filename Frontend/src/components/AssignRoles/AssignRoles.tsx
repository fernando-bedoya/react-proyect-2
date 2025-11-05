import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Form, Badge } from "react-bootstrap";
import { UserPlus } from "lucide-react";
import { userService } from "../../services/userService";
import { roleService } from "../../services/Role/roleService";
import { userRoleService } from "../../services/userRoleService";
import type { User } from "../../models/User";
import type { Role } from "../../models/Role";
import Swal from "sweetalert2";
import GenericForm, { FieldConfig } from "../GenericForm";

/**
 * Componente para asignar uno o varios roles a un usuario.
 * Refactorizado para usar GenericForm con un selector múltiple personalizado.
 * Buenas prácticas: hooks, manejo de errores, modularidad.
 */
export const AssignRoles: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

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

  const handleAssign = async (data: Record<string, any>) => {
    const { userId } = data;
    
    if (!userId || selectedRoleIds.length === 0) {
      await Swal.fire({
        title: 'Error',
        text: 'Debes seleccionar un usuario y al menos un rol',
        icon: 'error'
      });
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const ok = await userRoleService.assignRoles(Number(userId), selectedRoleIds);
      if (ok) {
        await Swal.fire({
          title: '¡Éxito!',
          text: 'Roles asignados correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        // Limpiar selección de roles después de éxito
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
      setSubmitting(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Configuración de campos para GenericForm (solo el selector de usuario)
  const formFields: FieldConfig[] = [
    {
      name: 'userId',
      label: '👤 Seleccionar Usuario',
      type: 'select',
      required: true,
      placeholder: '-- Selecciona un usuario --',
      options: users.map(user => ({
        value: user.id as number,
        label: user.name || user.email || `Usuario #${user.id}`
      })),
      helpText: 'Usuario al que se asignarán los roles seleccionados',
      disabled: loading || submitting,
      cols: 12
    }
  ];

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

      {/* Error Messages */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="d-flex align-items-center gap-2 mb-3">
          <Spinner animation="border" size="sm" variant="success" />
          <span className="text-muted">Cargando datos...</span>
        </div>
      )}

      {/* Form Card */}
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          {!loading && users.length > 0 && roles.length > 0 ? (
            <>
              {/* Selector de Usuario con GenericForm */}
              <GenericForm
                fields={formFields}
                onSubmit={handleAssign}
                submitLabel="Asignar Roles"
                showReset={true}
                resetLabel="Limpiar Formulario"
                loading={submitting}
              />

              {/* Selector Múltiple de Roles (Personalizado) */}
              <Row className="mt-4">
                <Col>
                  <Form.Label className="fw-semibold text-success">
                    <span className="me-2">🛡️</span>
                    Seleccionar Roles * ({selectedRoleIds.length} seleccionados)
                  </Form.Label>
                  <div 
                    className="border rounded p-3" 
                    style={{ 
                      maxHeight: '300px', 
                      overflowY: 'auto',
                      border: '2px solid #6ee7b7',
                      borderRadius: '8px',
                      backgroundColor: '#f0fdf4'
                    }}
                  >
                    {roles.length === 0 ? (
                      <p className="text-muted mb-0">No hay roles disponibles</p>
                    ) : (
                      roles.map(role => (
                        <Form.Check
                          key={role.id}
                          type="checkbox"
                          id={`role-${role.id}`}
                          label={
                            <span className="d-flex justify-content-between align-items-center">
                              <span style={{ fontWeight: '500', color: '#047857' }}>
                                {role.name || `Rol #${role.id}`}
                              </span>
                              {selectedRoleIds.includes(role.id as number) && (
                                <Badge bg="success" className="ms-2">✓</Badge>
                              )}
                            </span>
                          }
                          checked={selectedRoleIds.includes(role.id as number)}
                          onChange={() => handleRoleToggle(role.id as number)}
                          disabled={loading || submitting}
                          className="mb-2 p-2"
                          style={{
                            border: selectedRoleIds.includes(role.id as number) 
                              ? '1px solid #10b981' 
                              : '1px solid transparent',
                            borderRadius: '6px',
                            backgroundColor: selectedRoleIds.includes(role.id as number) 
                              ? '#d1fae5' 
                              : 'transparent',
                            transition: 'all 0.2s ease'
                          }}
                        />
                      ))
                    )}
                  </div>
                  <Form.Text className="text-muted">
                    Selecciona uno o más roles para asignar al usuario
                  </Form.Text>
                </Col>
              </Row>
            </>
          ) : !loading && (
            <Alert variant="warning">
              {users.length === 0 && "No hay usuarios disponibles. "}
              {roles.length === 0 && "No hay roles disponibles."}
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AssignRoles;
