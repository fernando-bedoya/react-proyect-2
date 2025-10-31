import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Modal } from "react-bootstrap";
import { Plus, RefreshCw } from "lucide-react";
import GenericTable from "../../components/GenericTable";
import { Permission } from "../../models/Permission";
import { permissionService } from "../../services/permissionService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ListPermissions: React.FC = () => {
    const navigate = useNavigate();
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await permissionService.getPermissions();
            setPermissions(data);
        } catch (err) {
            console.error("Error fetching permissions:", err);
            setError("Error al cargar los permisos. Por favor, intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: string, item: Permission) => {
        if (action === "view") {
            setSelectedPermission(item);
            setShowModal(true);
        } else if (action === "edit") {
            // Redirect to create page in edit mode (uses ?edit=<id>)
            navigate(`/permissions/create?edit=${item.id}`);
        } else if (action === "delete") {
            Swal.fire({
                title: "Eliminación",
                text: "¿Está seguro de querer eliminar este permiso?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#10b981",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "No"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const success = await permissionService.deletePermission(item.id!);
                    if (success) {
                        setSuccessMessage("El permiso se ha eliminado correctamente");
                        setTimeout(() => setSuccessMessage(null), 3000);
                        fetchData();
                    } else {
                        Swal.fire("Error", "No se pudo eliminar el permiso", "error");
                    }
                }
            });
        }
    };

    const handleCreateNew = () => {
        navigate('/permissions/create');
    };

    const handleRefresh = () => {
        setSuccessMessage(null);
        setError(null);
        fetchData();
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPermission(null);
    };

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>
                                Gestión de Permisos
                            </h2>
                            <p className="text-muted mb-0">
                                Listado de permisos del sistema
                                <Badge bg="secondary" className="ms-2">{permissions.length} permisos</Badge>
                            </p>
                        </div>
                        <div className="d-flex gap-2">
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
                                Nuevo Permiso
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

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

            {error && (
                <Alert 
                    variant="danger" 
                    dismissible 
                    onClose={() => setError(null)}
                    className="shadow-sm"
                >
                    <Alert.Heading as="h6">Error</Alert.Heading>
                    {error}
                </Alert>
            )}

            <Row>
                <Col>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="success" />
                                    <p className="mt-3 text-muted">Cargando permisos...</p>
                                </div>
                            ) : (
                                <GenericTable
                                    data={permissions as any}
                                    columns={["id", "url", "method", "entity"]}
                                    actions={[
                                        { name: "view", label: "Ver", icon: "view", variant: "primary" },
                                        { name: "edit", label: "Editar", icon: "edit", variant: "warning" },
                                        { name: "delete", label: "Eliminar", icon: "delete", variant: "danger" },
                                    ]}
                                    onAction={handleAction}
                                    striped
                                    hover
                                    responsive
                                    emptyMessage="No hay permisos registrados en el sistema"
                                />
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Modal para ver detalles del permiso */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>Detalle del Permiso</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPermission ? (
                        <div>
                            <p><strong>ID:</strong> {selectedPermission.id}</p>
                            <p><strong>URL:</strong> {selectedPermission.url}</p>
                            <p><strong>Método:</strong> {selectedPermission.method}</p>
                            <p><strong>Entidad:</strong> {selectedPermission.entity}</p>
                            <p><strong>Creado:</strong> {selectedPermission.created_at ? new Date(selectedPermission.created_at).toLocaleString() : '-'}</p>
                            <p><strong>Última actualización:</strong> {selectedPermission.updated_at ? new Date(selectedPermission.updated_at).toLocaleString() : '-'}</p>
                        </div>
                    ) : (
                        <p className="text-muted">Sin datos</p>
                    )}
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="outline-secondary" onClick={handleCloseModal}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ListPermissions;
