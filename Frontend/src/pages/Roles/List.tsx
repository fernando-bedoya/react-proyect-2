import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Modal, Form } from "react-bootstrap";
import { Plus, RefreshCw, Shield, Edit, Trash2, Eye } from "lucide-react";
import GenericList from "../../components/GenericsMaterial/GenericList";
import GenericTableTailwind from "../../components/tailwindGenerics/GenericTableTailwind";
import GenericTableBootstrap from "../../components/GenericTable";
import ThemeSelector from '../../components/ThemeSelector';
import GenericViewModal from '../../components/GenericsMaterial/GenericViewModal';
import { useTheme } from '../../context/ThemeContext';
import { Role } from "../../models/Role";
import { roleService } from "../../services/Role/roleService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Roles: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  // el estilo de la tabla se controla desde ThemeContext (designLibrary)
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Array<number | string>>([]);
  const [loadingPermissions, setLoadingPermissions] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Usar el tema global para decidir qué componente de tabla renderizar
  const { designLibrary, setDesignLibrary } = useTheme();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roleService.getRoles();
      setRoles(data);
      console.log("Roles fetched:", data);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Error al cargar los roles. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, item: Role) => {
  if (action === "view") {
    try {
      setLoading(true);
      setError(null);
      const data = await roleService.getRoleById(item.id as number);
      if (data) {
        setSelectedRole(data);
        setShowViewModal(true);
      } else {
        setError('No se pudo obtener la información del rol');
      }
    } catch (err) {
      console.error('Error al obtener rol:', err);
      setError('Error al obtener la información del rol');
    } finally {
      setLoading(false);
    }
    return;
  }
  if (action === "assignPermissions") {
    // Redirect to the new permissions-by-role page (route param)
    navigate(`/permissions/list/${item.id}`);
    } else if (action === "edit") {
        navigate(`/roles/update/${item.id}`);
    } else if (action === "delete") {
        Swal.fire({
            title: "Eliminación",
            text: "¿Está seguro de querer eliminar el registro?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#10b981",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "No"
        }).then(async (result) => {
            if (result.isConfirmed) {
                const success = await roleService.deleteRole(item.id as number);
                if (success) {
                    setSuccessMessage("El rol se ha eliminado correctamente");
                    setTimeout(() => setSuccessMessage(null), 3000);
                    Swal.fire({
                        title: "Eliminado",
                        text: "El registro se ha eliminado",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
                fetchData();
            }
        });
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedRole(null);
  };

  const handleCreateNew = () => {
    navigate('/roles/create');
  };

  const handleRefresh = () => {
    setSuccessMessage(null);
    setError(null);
    fetchData();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRole(null);
  };

  const togglePermission = (permId: number | string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permId)) return prev.filter(p => p !== permId);
      return [...prev, permId];
    });
  };

  const handleSavePermissions = () => {
    (async () => {
      if (!selectedRole) return;
      try {
        const success = await roleService.assignPermissions(selectedRole.id as number, selectedPermissions);
        if (success) {
          setSuccessMessage(`Permisos asignados correctamente al rol: ${selectedRole?.name}`);
          setTimeout(() => setSuccessMessage(null), 3000);
          handleCloseModal();
          fetchData();
        } else {
          setError('No se pudieron asignar los permisos');
        }
      } catch (err) {
        console.error('Error al asignar permisos:', err);
        setError('Error al asignar permisos');
      }
    })();
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
              <div className="d-flex align-items-center gap-1 me-2">
                {/* Solo mostrar el ThemeSelector; el selector controla el tema global */}
                <ThemeSelector />
              </div>
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
                onClick={handleCreateNew}
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

      {/* Mensaje de error */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="shadow-sm">
          <div className="d-flex align-items-center">
            <strong className="me-2">✕</strong>
            {error}
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
                <>
                  {designLibrary === 'material' && (
                    <div className="p-3">
                      <GenericList
                        data={roles}
                        columns={[
                          { key: 'id', label: 'ID' },
                          { key: 'name', label: 'Nombre' },
                          { key: 'description', label: 'Descripción' },
                        ]}
                        loading={loading}
                        selectable
                        idKey="id"
                        actions={[
                          { name: 'view', icon: <Eye />, tooltip: 'Ver', color: 'primary' },
                          { name: 'assignPermissions', icon: <Shield />, tooltip: 'Permissions', color: 'info' },
                          { name: 'edit', icon: <Edit />, tooltip: 'Editar', color: 'warning' },
                          { name: 'delete', icon: <Trash2 />, tooltip: 'Eliminar', color: 'error' },
                        ]}
                        onAction={handleAction}
                        emptyMessage="No hay roles registrados en el sistema"
                      />
                    </div>
                  )}

                  {designLibrary === 'tailwind' && (
                    <GenericTableTailwind
                      data={roles}
                      columns={["id", "name", "description"]}
                      actions={[
                        { name: "view", label: "Ver", variant: "info" },
                        { name: "assignPermissions", label: "Permissions", variant: "primary" },
                        { name: "edit", label: "Editar", variant: "warning" },
                        { name: "delete", label: "Eliminar", variant: "danger" },
                      ]}
                      onAction={handleAction}
                      striped
                      hover
                      responsive
                      emptyMessage="No hay roles registrados en el sistema"
                    />
                  )}

                  {designLibrary === 'bootstrap' && (
                    <GenericTableBootstrap
                      data={roles}
                      columns={["id", "name", "description"]}
                      actions={[
                        { name: "view", label: "Ver", icon: 'eye', variant: "outline-primary" },
                        { name: "assignPermissions", label: "Permissions", icon: 'edit', variant: "outline-primary" },
                        { name: "edit", label: "Editar", icon: 'edit', variant: "outline-warning" },
                        { name: "delete", label: "Eliminar", icon: 'delete', variant: "outline-danger" },
                      ]}
                      onAction={handleAction}
                      striped
                      hover
                      responsive
                      emptyMessage="No hay roles registrados en el sistema"
                    />
                  )}
                </>
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

          {loadingPermissions ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
            </div>
          ) : permissions.length === 0 ? (
            <p className="text-muted">No hay permisos disponibles.</p>
          ) : (
            (() => {
              // Agrupar por categoría/grupo si existe
              const groups: Record<string, any[]> = {};
              permissions.forEach((p: any) => {
                const g = p.group || p.category || 'General';
                if (!groups[g]) groups[g] = [];
                groups[g].push(p);
              });

              return Object.entries(groups).map(([groupName, perms]) => (
                <div key={groupName} className="mb-3">
                  <h6 className="small fw-semibold mb-2">{groupName}</h6>
                  <Card className="mb-2">
                    <Card.Body className="p-3">
                      <div className="row">
                        {perms.map((p: any) => (
                          <div className="col-6 mb-2" key={p.id ?? p.name}>
                            <Form.Check
                              type="checkbox"
                              id={`perm-${p.id ?? p.name}`}
                              label={p.name || p.label || String(p)}
                              checked={selectedPermissions.includes(p.id ?? p.name)}
                              onChange={() => togglePermission(p.id ?? p.name)}
                            />
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ));
            })()
          )}
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
      {/* Modal reutilizable para ver detalles del rol */}
      <GenericViewModal
        show={showViewModal}
        onClose={handleCloseViewModal}
        title={`Ver Rol - ${selectedRole?.name ?? ''}`}
        data={selectedRole}
        fields={[
          { label: 'ID', key: 'id' },
          { label: 'Nombre', key: 'name' },
          { label: 'Descripción', key: 'description' },
          { label: 'Permisos', key: 'permissions' },
        ]}
      />
    </Container>
  );
};

export default Roles;
