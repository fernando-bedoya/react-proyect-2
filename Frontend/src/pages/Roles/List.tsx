import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Modal, Form } from "react-bootstrap";
import { Plus, RefreshCw, Shield } from "lucide-react";
import GenericTable from "../../components/GenericTable";
import ThemeSelector from "../../components/ThemeSelector";
import { Role } from "../../models/Role";

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([
    { id: 1, name: "Admin" },
    { id: 2, name: "User" },
    { id: 3, name: "Editor" },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAction = (action: string, item: Role) => {
    if (action === "assignPermissions") {
      console.log("Assign permissions to role:", item);
      setSelectedRole(item);
      setShowModal(true);
    } else if (action === "edit") {
      console.log("Edit role:", item);
      // Aquí puedes agregar lógica para editar
    } else if (action === "delete") {
      console.log("Delete role:", item);
      // Aquí puedes agregar lógica para eliminar
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setSuccessMessage(null);
    // Simular carga de datos
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage("Datos actualizados correctamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 1000);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRole(null);
  };

  const handleSavePermissions = () => {
    setSuccessMessage(`Permisos asignados correctamente al rol: ${selectedRole?.name}`);
    setTimeout(() => setSuccessMessage(null), 3000);
    handleCloseModal();
  };

  return (
    <Container fluid className="py-4">
      {/* Encabezado */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>
                Gestión de Roles
              </h2>
              <p className="text-muted mb-0">
                Administre los roles y permisos del sistema
                <Badge bg="secondary" className="ms-2">{roles.length} roles</Badge>
              </p>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <ThemeSelector />
              <Button 
                variant="outline-secondary"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="d-flex align-items-center gap-2"
              >
                <RefreshCw size={16} />
                Actualizar
              </Button>
              <Button 
                variant="success"
                className="d-flex align-items-center gap-2"
              >
                <Plus size={18} />
                Nuevo Rol
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Mensajes de éxito */}
      {successMessage && (
        <Alert 
          variant="success" 
          dismissible 
          onClose={() => setSuccessMessage(null)}
          className="shadow-sm"
        >
          <div className="d-flex align-items-center">
            <strong className="me-2">✓</strong>
            {successMessage}
          </div>
        </Alert>
      )}

      {/* Tabla de roles */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="success" />
                  <p className="mt-3 text-muted">Cargando roles...</p>
                </div>
              ) : (
                <GenericTable
                  data={roles}
                  columns={["id", "name"]}
                  actions={[
                    { 
                      name: "assignPermissions", 
                      label: "Asignar Permisos",
                      icon: "edit",
                      variant: "primary"
                    },
                    { 
                      name: "edit", 
                      label: "Editar",
                      icon: "edit",
                      variant: "warning"
                    },
                    { 
                      name: "delete", 
                      label: "Eliminar",
                      icon: "delete",
                      variant: "danger"
                    },
                  ]}
                  onAction={handleAction}
                  striped
                  hover
                  responsive
                  emptyMessage="No hay roles registrados en el sistema"
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de asignación de permisos */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Shield size={24} style={{ color: '#10b981' }} />
            Asignar Permisos - {selectedRole?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Alert variant="info" className="mb-4">
            <small>
              <strong>Información:</strong> Seleccione los permisos que desea asignar a este rol.
              Los cambios se aplicarán inmediatamente.
            </small>
          </Alert>

          <h6 className="fw-semibold mb-3">Permisos Disponibles</h6>
          
          <Row>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Header className="bg-white py-2">
                  <small className="fw-semibold">Gestión de Usuarios</small>
                </Card.Header>
                <Card.Body className="p-3">
                  <Form.Check 
                    type="checkbox"
                    id="perm-users-view"
                    label="Ver usuarios"
                    className="mb-2"
                  />
                  <Form.Check 
                    type="checkbox"
                    id="perm-users-create"
                    label="Crear usuarios"
                    className="mb-2"
                  />
                  <Form.Check 
                    type="checkbox"
                    id="perm-users-edit"
                    label="Editar usuarios"
                    className="mb-2"
                  />
                  <Form.Check 
                    type="checkbox"
                    id="perm-users-delete"
                    label="Eliminar usuarios"
                  />
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-3">
                <Card.Header className="bg-white py-2">
                  <small className="fw-semibold">Gestión de Roles</small>
                </Card.Header>
                <Card.Body className="p-3">
                  <Form.Check 
                    type="checkbox"
                    id="perm-roles-view"
                    label="Ver roles"
                    className="mb-2"
                  />
                  <Form.Check 
                    type="checkbox"
                    id="perm-roles-create"
                    label="Crear roles"
                    className="mb-2"
                  />
                  <Form.Check 
                    type="checkbox"
                    id="perm-roles-edit"
                    label="Editar roles"
                    className="mb-2"
                  />
                  <Form.Check 
                    type="checkbox"
                    id="perm-roles-delete"
                    label="Eliminar roles"
                  />
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-3">
                <Card.Header className="bg-white py-2">
                  <small className="fw-semibold">Configuración</small>
                </Card.Header>
                <Card.Body className="p-3">
                  <Form.Check 
                    type="checkbox"
                    id="perm-settings-view"
                    label="Ver configuración"
                    className="mb-2"
                  />
                  <Form.Check 
                    type="checkbox"
                    id="perm-settings-edit"
                    label="Modificar configuración"
                  />
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-3">
                <Card.Header className="bg-white py-2">
                  <small className="fw-semibold">Reportes</small>
                </Card.Header>
                <Card.Body className="p-3">
                  <Form.Check 
                    type="checkbox"
                    id="perm-reports-view"
                    label="Ver reportes"
                    className="mb-2"
                  />
                  <Form.Check 
                    type="checkbox"
                    id="perm-reports-export"
                    label="Exportar reportes"
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleSavePermissions}>
            Guardar Permisos
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Roles;
