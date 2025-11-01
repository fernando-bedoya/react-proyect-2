import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import { User } from '../../models/User';
import UserFormValidator from '../../components/UserFormValidator';
import ThemeSelector from '../../components/ThemeSelector';
import Swal from 'sweetalert2';
import { userService } from "../../services/userService";
import Breadcrumb from '../../components/Breadcrumb';
import { useNavigate } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
import GenericFormMaterial from '../../components/GenericsMaterial/GenericFormMaterial';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import roleService from '../../services/roleService';
import { userRoleService } from '../../services/userRoleService';

const CreateUser: React.FC = () => {
    const navigate = useNavigate();
    const { designLibrary } = useTheme();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Lógica de creación
    const handleCreateUser = async (user: User) => {
        setLoading(true);
        setError(null);

        try {
            const createdUser = await userService.createUser(user);
            
            if (createdUser) {
                Swal.fire({
                    title: "¡Completado!",
                    text: "El usuario se ha creado correctamente",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
                console.log("Usuario creado con éxito:", createdUser);
                
                // Navegar después de un breve delay
                setTimeout(() => {
                    navigate("/users/list");
                }, 2000);
            } else {
                setError("Hubo un problema al crear el usuario. Por favor, intente nuevamente.");
                Swal.fire({
                    title: "Error",
                    text: "Existe un problema al momento de crear el registro",
                    icon: "error",
                    confirmButtonColor: "#10b981"
                });
            }
        } catch (error) {
            setError("Error al conectar con el servidor. Por favor, verifique su conexión.");
            Swal.fire({
                title: "Error",
                text: "Existe un problema al momento de crear el registro",
                icon: "error",
                confirmButtonColor: "#10b981"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate("/users/list");
    };

    // Renderizado condicional según el tema
    const renderContent = () => {
        if (designLibrary === 'bootstrap') {
            return (
                <Container fluid className="py-4">
                    <Row className="mb-4">
                        <Col>
                            <Breadcrumb pageName="Crear Usuario" />
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <div className="d-flex align-items-center gap-3">
                                    <button
                                        onClick={handleBack}
                                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                                        disabled={loading}
                                    >
                                        <ArrowLeft size={16} />
                                        Volver
                                    </button>
                                    <div>
                                        <h2 className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>
                                            Crear Nuevo Usuario
                                        </h2>
                                        <p className="text-muted mb-0">
                                            Complete el formulario para agregar un nuevo usuario al sistema
                                        </p>
                                    </div>
                                </div>
                                <ThemeSelector />
                            </div>
                        </Col>
                    </Row>

                    {error && (
                        <Alert variant="danger" dismissible onClose={() => setError(null)} className="shadow-sm mb-4">
                            <Alert.Heading as="h6">Error al crear usuario</Alert.Heading>
                            {error}
                        </Alert>
                    )}

                    {loading && (
                        <Alert variant="info" className="shadow-sm mb-4">
                            <div className="d-flex align-items-center gap-3">
                                <Spinner animation="border" size="sm" variant="info" />
                                <div>
                                    <strong>Creando usuario...</strong>
                                    <p className="mb-0 small">Por favor espere mientras se procesa la información</p>
                                </div>
                            </div>
                        </Alert>
                    )}

                    <Row>
                        <Col lg={8} xl={6}>
                            <Card className="shadow-sm border-0">
                                <Card.Header className="bg-white border-bottom py-3">
                                    <h5 className="mb-0 fw-semibold">Información del Usuario</h5>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <UserFormValidator handleCreate={handleCreateUser} mode={1} />
                                </Card.Body>
                            </Card>

                            <Card className="shadow-sm border-0 mt-3">
                                <Card.Body className="bg-light">
                                    <h6 className="fw-semibold mb-2">💡 Información</h6>
                                    <ul className="small text-muted mb-0 ps-3">
                                        <li>Todos los campos marcados con * son obligatorios</li>
                                        <li>La contraseña debe tener al menos 8 caracteres</li>
                                        <li>El correo electrónico debe ser único en el sistema</li>
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            );
        } else if (designLibrary === 'tailwind') {
            return (
                <div className="container mx-auto py-6">
                    <div className="mb-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleBack}
                                    disabled={loading}
                                    className="border border-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded flex items-center gap-2 text-sm"
                                >
                                    <ArrowLeft size={16} />
                                    Volver
                                </button>
                                <div>
                                    <h2 className="text-3xl font-bold text-green-500 mb-1">
                                        Crear Nuevo Usuario
                                    </h2>
                                    <p className="text-gray-600">
                                        Complete el formulario para agregar un nuevo usuario al sistema
                                    </p>
                                </div>
                            </div>
                            <ThemeSelector />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h6 className="font-semibold mb-1">Error al crear usuario</h6>
                                    <p>{error}</p>
                                </div>
                                <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                                <div>
                                    <strong>Creando usuario...</strong>
                                    <p className="text-sm">Por favor espere mientras se procesa la información</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="max-w-4xl">
                        <div className="bg-white rounded-lg shadow-md mb-4">
                            <div className="bg-gray-50 border-b px-6 py-4">
                                <h5 className="font-semibold text-lg">Información del Usuario</h5>
                            </div>
                            <div className="p-6">
                                <UserFormValidator handleCreate={handleCreateUser} mode={1} />
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg shadow-md p-6">
                            <h6 className="font-semibold mb-2">💡 Información</h6>
                            <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                                <li>Todos los campos marcados con * son obligatorios</li>
                                <li>La contraseña debe tener al menos 8 caracteres</li>
                                <li>El correo electrónico debe ser único en el sistema</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        } else if (designLibrary === 'material') {
            // Material UI implementation using GenericFormMaterial
            const [rolesOptions, setRolesOptions] = React.useState<Array<{label:string,value:any}>>([]);

            useEffect(() => {
                let mounted = true;
                (async () => {
                    try {
                        const roles = await roleService.getRoles();
                        if (!mounted) return;
                        setRolesOptions((roles || []).map(r => ({ label: r.name || String(r.id), value: r.id })));
                    } catch (e) {
                        console.error('No se pudieron cargar roles', e);
                    }
                })();
                return () => { mounted = false; };
            }, []);

            const fields = [
                { name: 'name', label: 'Nombre', type: 'text', required: true },
                { name: 'email', label: 'Correo electrónico', type: 'email', required: true },
                { name: 'password', label: 'Contraseña', type: 'password', required: true },
                { name: 'roles', label: 'Roles', type: 'multiselect', options: rolesOptions }
            ];

            const initialValues: Partial<User & { roles: any[] }> = { name: '', email: '', password: '', roles: [] };

            const onSubmit = async (values: any) => {
                setLoading(true);
                setError(null);
                try {
                    const payload: Omit<User, 'id'> = {
                        name: values.name?.trim(),
                        email: values.email?.trim(),
                        password: values.password,
                    };

                    const created = await userService.createUser(payload);
                    if (created && created.id) {
                        // assign roles if any (values.roles contain option objects)
                        const roleIds = (values.roles ?? []).map((r: any) => (r && r.value) ? Number(r.value) : Number(r));
                        if (roleIds.length) {
                            await userRoleService.assignRoles(Number(created.id), roleIds);
                        }

                        Swal.fire({ title: '¡Completado!', text: 'El usuario se ha creado correctamente', icon: 'success', timer: 1500, showConfirmButton: false });
                        setTimeout(() => navigate('/users/list'), 1500);
                    } else {
                        setError('Hubo un problema al crear el usuario.');
                        Swal.fire({ title: 'Error', text: 'Existe un problema al momento de crear el registro', icon: 'error' });
                    }
                } catch (err) {
                    console.error(err);
                    setError('Error al conectar con el servidor.');
                    Swal.fire({ title: 'Error', text: 'Existe un problema al momento de crear el registro', icon: 'error' });
                } finally {
                    setLoading(false);
                }
            };

            return (
                <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button variant="outlined" onClick={handleBack} disabled={loading}>Volver</Button>
                            <Box>
                                <Typography variant="h4" sx={{ color: '#ffb300' }}>Crear Nuevo Usuario</Typography>
                                <Typography variant="body2" color="text.secondary">Complete el formulario para agregar un nuevo usuario al sistema</Typography>
                            </Box>
                        </Box>
                        <ThemeSelector />
                    </Box>

                    {error && (
                        <Paper sx={{ p:2, mb:2, bgcolor: '#ffebee' }}>
                            <Typography color="error" variant="subtitle1">Error al crear usuario</Typography>
                            <Typography>{error}</Typography>
                        </Paper>
                    )}

                    {loading && (
                        <Paper sx={{ p:2, mb:2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CircularProgress size={20} />
                                <Box>
                                    <Typography><strong>Creando usuario...</strong></Typography>
                                    <Typography variant="body2">Por favor espere mientras se procesa la información</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    )}

                    <Paper sx={{ p: 3, maxWidth: 800 }}>
                        <GenericFormMaterial
                            mode="create"
                            initialValues={initialValues}
                            fields={fields}
                            onSubmit={onSubmit}
                            onCancel={handleBack}
                            submitLabel="Crear Usuario"
                            loading={loading}
                        />
                    </Paper>
                </Box>
            );

        } else {
            return (
                <div className="container mx-auto py-8">
                    <div className="mb-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={handleBack}
                                    disabled={loading}
                                    className="border-2 border-gray-400 hover:bg-gray-50 px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium"
                                >
                                    <ArrowLeft size={18} />
                                    Volver
                                </button>
                                <div>
                                    <h2 className="text-4xl font-bold text-green-600 mb-2">
                                        Crear Nuevo Usuario
                                    </h2>
                                    <p className="text-gray-700 text-lg">
                                        Complete el formulario para agregar un nuevo usuario al sistema
                                    </p>
                                </div>
                            </div>
                            <ThemeSelector />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-600 text-red-900 p-6 mb-6 rounded shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h6 className="font-bold text-lg mb-2">Error al crear usuario</h6>
                                    <p className="font-medium">{error}</p>
                                </div>
                                <button onClick={() => setError(null)} className="text-red-900 hover:text-red-700 text-2xl">
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div className="bg-blue-50 border-l-4 border-blue-600 text-blue-900 p-6 mb-6 rounded shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                                <div>
                                    <strong className="text-lg">Creando usuario...</strong>
                                    <p className="text-sm">Por favor espere mientras se procesa la información</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="max-w-5xl">
                        <div className="bg-white rounded-lg shadow-lg mb-6">
                            <div className="bg-gray-100 border-b-2 px-8 py-5">
                                <h5 className="font-bold text-xl">Información del Usuario</h5>
                            </div>
                            <div className="p-8">
                                <UserFormValidator handleCreate={handleCreateUser} mode={1} />
                            </div>
                        </div>

                        <div className="bg-gray-100 rounded-lg shadow-lg p-8">
                            <h6 className="font-bold text-lg mb-3">💡 Información</h6>
                            <ul className="text-gray-700 list-disc pl-6 space-y-2">
                                <li>Todos los campos marcados con * son obligatorios</li>
                                <li>La contraseña debe tener al menos 8 caracteres</li>
                                <li>El correo electrónico debe ser único en el sistema</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return renderContent();
};

export default CreateUser;
