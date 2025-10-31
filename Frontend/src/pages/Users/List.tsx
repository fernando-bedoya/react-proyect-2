import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from "react-bootstrap";
import { Plus, RefreshCw } from "lucide-react";
import GenericTable from "../../components/GenericTable";
import ThemeSelector from "../../components/ThemeSelector";
import { User } from "../../models/User";
import { userService } from "../../services/userService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const ListUsers: React.FC = () => {
    const navigate = useNavigate();
    const { designLibrary } = useTheme(); // Obtener el tema actual
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Función para obtener clases CSS según el tema
    const getThemeClasses = () => {
        switch (designLibrary) {
            case 'bootstrap':
                return {
                    container: 'py-4',
                    card: 'shadow-sm border-0',
                    button: 'btn',
                    buttonPrimary: 'btn-success',
                    buttonSecondary: 'btn-outline-secondary',
                    alert: 'alert',
                    badge: 'badge bg-secondary'
                };
            case 'tailwind':
                return {
                    container: 'py-6',
                    card: 'bg-white rounded-lg shadow-md',
                    button: 'px-4 py-2 rounded font-medium transition-colors',
                    buttonPrimary: 'bg-green-500 hover:bg-green-600 text-white',
                    buttonSecondary: 'border border-gray-300 hover:bg-gray-100',
                    alert: 'p-4 rounded-lg',
                    badge: 'px-2 py-1 rounded-full text-xs'
                };
            case 'material':
                return {
                    container: 'py-8',
                    card: 'shadow-lg rounded-lg',
                    button: 'px-6 py-2 rounded-md font-medium uppercase text-sm',
                    buttonPrimary: 'bg-green-600 hover:bg-green-700 text-white shadow-md',
                    buttonSecondary: 'border-2 border-gray-400 hover:bg-gray-50',
                    alert: 'p-4 rounded border-l-4',
                    badge: 'px-3 py-1 rounded text-xs font-semibold'
                };
            default:
                return {
                    container: 'py-4',
                    card: 'shadow-sm border-0',
                    button: 'btn',
                    buttonPrimary: 'btn-success',
                    buttonSecondary: 'btn-outline-secondary',
                    alert: 'alert',
                    badge: 'badge bg-secondary'
                };
        }
    };

    const themeClasses = getThemeClasses();

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

    // Renderizado condicional según el tema seleccionado
    const renderContent = () => {
        if (designLibrary === 'bootstrap') {
            // Renderizado Bootstrap (usando componentes de react-bootstrap)
            return (
                <Container fluid className={themeClasses.container}>
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
                            <Card className={themeClasses.card}>
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
                                                { name: "edit", label: "Editar", icon: "edit", variant: "primary" },
                                                { name: "delete", label: "Eliminar", icon: "delete", variant: "danger" }
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
        } else if (designLibrary === 'tailwind') {
            // Renderizado Tailwind (usando clases de Tailwind CSS)
            return (
                <div className={`container mx-auto ${themeClasses.container}`}>
                    <div className="mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-1 text-green-500">
                                    Gestión de Usuarios
                                </h2>
                                <p className="text-gray-600">
                                    Listado de todos los usuarios del sistema
                                    <span className={`${themeClasses.badge} bg-gray-500 text-white ml-2`}>
                                        {users.length} usuarios
                                    </span>
                                </p>
                            </div>
                            <div className="flex gap-2 items-center">
                                <ThemeSelector />
                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className={`${themeClasses.button} ${themeClasses.buttonSecondary} flex items-center gap-2`}
                                >
                                    <RefreshCw size={16} />
                                    Actualizar
                                </button>
                                <button
                                    onClick={handleCreateNew}
                                    className={`${themeClasses.button} ${themeClasses.buttonPrimary} flex items-center gap-2`}
                                >
                                    <Plus size={18} />
                                    Nuevo Usuario
                                </button>
                            </div>
                        </div>
                    </div>

                    {successMessage && (
                        <div className={`${themeClasses.alert} bg-green-100 text-green-800 border-green-500 mb-4`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <strong className="mr-2">✓</strong>
                                    {successMessage}
                                </div>
                                <button onClick={() => setSuccessMessage(null)} className="text-green-800 hover:text-green-900">
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className={`${themeClasses.alert} bg-red-100 text-red-800 border-red-500 mb-4`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h6 className="font-semibold">Error</h6>
                                    {error}
                                </div>
                                <button onClick={() => setError(null)} className="text-red-800 hover:text-red-900">
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={themeClasses.card}>
                        <div className="p-0">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent"></div>
                                    <p className="mt-3 text-gray-600">Cargando usuarios...</p>
                                </div>
                            ) : (
                                <GenericTable
                                    data={users}
                                    columns={["id", "name", "email"]}
                                    actions={[
                                        { name: "edit", label: "Editar", icon: "edit", variant: "primary" },
                                        { name: "delete", label: "Eliminar", icon: "delete", variant: "danger" }
                                    ]}
                                    onAction={handleAction}
                                    striped
                                    hover
                                    responsive
                                    emptyMessage="No hay usuarios registrados en el sistema"
                                />
                            )}
                        </div>
                    </div>
                </div>
            );
        } else {
            // Renderizado Material Design
            return (
                <div className={`container mx-auto ${themeClasses.container}`}>
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-4xl font-bold mb-2 text-green-600">
                                    Gestión de Usuarios
                                </h2>
                                <p className="text-gray-700 text-lg">
                                    Listado de todos los usuarios del sistema
                                    <span className={`${themeClasses.badge} bg-gray-600 text-white ml-3`}>
                                        {users.length} usuarios
                                    </span>
                                </p>
                            </div>
                            <div className="flex gap-3 items-center">
                                <ThemeSelector />
                                <button
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className={`${themeClasses.button} ${themeClasses.buttonSecondary} flex items-center gap-2`}
                                >
                                    <RefreshCw size={18} />
                                    Actualizar
                                </button>
                                <button
                                    onClick={handleCreateNew}
                                    className={`${themeClasses.button} ${themeClasses.buttonPrimary} flex items-center gap-2`}
                                >
                                    <Plus size={20} />
                                    Nuevo Usuario
                                </button>
                            </div>
                        </div>
                    </div>

                    {successMessage && (
                        <div className={`${themeClasses.alert} bg-green-50 text-green-900 border-green-600 mb-6 shadow-sm`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <strong className="mr-2 text-xl">✓</strong>
                                    <span className="font-medium">{successMessage}</span>
                                </div>
                                <button 
                                    onClick={() => setSuccessMessage(null)} 
                                    className="text-green-900 hover:text-green-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className={`${themeClasses.alert} bg-red-50 text-red-900 border-red-600 mb-6 shadow-sm`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h6 className="font-bold text-lg mb-1">Error</h6>
                                    <p className="font-medium">{error}</p>
                                </div>
                                <button 
                                    onClick={() => setError(null)} 
                                    className="text-red-900 hover:text-red-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={themeClasses.card}>
                        <div className="p-0">
                            {loading ? (
                                <div className="text-center py-16">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
                                    <p className="mt-4 text-gray-700 text-lg font-medium">Cargando usuarios...</p>
                                </div>
                            ) : (
                                <GenericTable
                                    data={users}
                                    columns={["id", "name", "email"]}
                                    actions={[
                                        { name: "edit", label: "Editar", icon: "edit", variant: "primary" },
                                        { name: "delete", label: "Eliminar", icon: "delete", variant: "danger" }
                                    ]}
                                    onAction={handleAction}
                                    striped
                                    hover
                                    responsive
                                    emptyMessage="No hay usuarios registrados en el sistema"
                                />
                            )}
                        </div>
                    </div>
                </div>
            );
        }
    };

    return renderContent();
};

export default ListUsers;
