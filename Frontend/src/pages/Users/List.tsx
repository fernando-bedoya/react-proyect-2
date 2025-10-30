import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from "react-bootstrap";
import { Plus, RefreshCw } from "lucide-react";
import GenericTable from "../../components/GenericTable";
import { User } from "../../models/User";
import { userService } from "../../services/userService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ListUsers: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const users = await userService.getUsers();
            setUsers(users);
            console.log("Users fetched:", users);
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Error al cargar los usuarios. Por favor, intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: string, item: User) => {
        if (action === "edit") {
            console.log("Edit user:", item);
            navigate(`/users/update/${item.id}`);
        } else if (action === "delete") {
            console.log("Delete user:", item);
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
                    const success = await userService.deleteUser(item.id!);
                    if (success) {
                        setSuccessMessage("El usuario se ha eliminado correctamente");
                        setTimeout(() => setSuccessMessage(null), 3000);
                        
                        Swal.fire({
                            title: "Eliminado",
                            text: "El registro se ha eliminado",
                            icon: "success",
                            timer: 2000,
                            showConfirmButton: false
                        });
                    }
                    // Vuelve a obtener los usuarios después de eliminar uno
                    fetchData();
                }
            });
        }
    };

    const handleCreateNew = () => {
        navigate('/users/create');
    };

    const handleRefresh = () => {
        setSuccessMessage(null);
        setError(null);
        fetchData();
    };

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>
                                Gestión de Usuarios
                            </h2>
                            <p className="text-muted mb-0">
                                Listado de todos los usuarios del sistema
                                <Badge bg="secondary" className="ms-2">{users.length} usuarios</Badge>
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
                                Nuevo Usuario
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Mensajes de alerta */}
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

            {/* Tabla de usuarios */}
            <Row>
                <Col>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center py-5">
                                    <Spinner animation="border" variant="success" />
                                    <p className="mt-3 text-muted">Cargando usuarios...</p>
                                </div>
                            ) : (
                                <GenericTable
                                    data={users}
                                    columns={["id", "name", "email"]}
                                    actions={[
                                        { 
                                            name: "edit", 
                                            label: "Editar",
                                            icon: "edit",
                                            variant: "primary"
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
                                    emptyMessage="No hay usuarios registrados en el sistema"
                                />
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ListUsers;
