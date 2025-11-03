import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import { User } from '../../models/User';
import GenericForm, { FieldConfig } from '../../components/GenericForm';
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
    const [rolesOptions, setRolesOptions] = useState<Array<{label:string,value:any}>>([]);

    // Helper para detectar error de correo duplicado a partir de la respuesta del servidor
    const isDuplicateEmailError = (err: any) => {
        const resp = err?.response;
        if (!resp) return false;
        // Caso ideal: backend responde 409 Conflict (o 400 con mensaje claro)
        if (resp.status === 409) return true;
        // Fallback: inspeccionar mensajes comunes (es/en) -- incluir 'registered'
        const msg = String(resp.data?.error || resp.data?.message || resp.data || '');
        return /correo.*existe|email.*existe|already exists|already registered|email.*exists|duplicate.*email|correo.*duplicado|duplicate|registered/i.test(msg);
    };

    // Cargar roles al montar el componente
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

    // Configuración de campos del formulario para Bootstrap
    const formFields: FieldConfig[] = [
        {
            name: 'name',
            label: 'Nombre Completo',
            type: 'text',
            placeholder: 'Ej: Juan Pérez',
            required: true,
            cols: 12
        },
        {
            name: 'email',
            label: 'Correo Electrónico',
            type: 'email',
            placeholder: 'usuario@ejemplo.com',
            required: true,
            cols: 12
        }
    ];

    // Configuración de campos para Material UI
    const materialFields = [
        { name: 'name', label: 'Nombre', type: 'text', required: true },
        { name: 'email', label: 'Correo electrónico', type: 'email', required: true },
    ];

    const initialValues: Partial<User & { roles: any[] }> = { name: '', email: '', password: '', roles: [] };

    // Lógica de creación para Bootstrap
    const handleCreateUser = async (formData: Record<string, any>) => {
        setLoading(true);
        setError(null);

        try {
            const userData: Omit<User, 'id'> = {
                name: formData.name,
                email: formData.email
            };

            const createdUser = await userService.createUser(userData);
            
            if (createdUser) {
                Swal.fire({
                    title: "¡Completado!",
                    text: "El usuario se ha creado correctamente",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
                
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
        } catch (error: any) {
            if (isDuplicateEmailError(error)) {
                const dupMsg = 'El correo ya está registrado. Use otro correo.';
                setError(dupMsg);
                Swal.fire({ title: 'Error', text: dupMsg, icon: 'error', confirmButtonColor: '#10b981' });
            } else {
                const errorMsg = error.response?.data?.error || "Error al conectar con el servidor.";
                setError(errorMsg);
                Swal.fire({
                    title: "Error",
                    text: errorMsg,
                    icon: "error",
                    confirmButtonColor: "#10b981"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Lógica de creación para Material UI
    const handleMaterialSubmit = async (values: any) => {
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

                Swal.fire({ 
                    title: '¡Completado!', 
                    text: 'El usuario se ha creado correctamente', 
                    icon: 'success', 
                    timer: 1500, 
                    showConfirmButton: false 
                });
                setTimeout(() => navigate('/users/list'), 1500);
            } else {
                setError('Hubo un problema al crear el usuario.');
                Swal.fire({ 
                    title: 'Error', 
                    text: 'Existe un problema al momento de crear el registro', 
                    icon: 'error' 
                });
            }
        } catch (err) {
            console.error(err);
            if (isDuplicateEmailError(err)) {
                const dupMsg = 'El correo ya está registrado. Use otro correo.';
                setError(dupMsg);
                Swal.fire({ title: 'Error', text: dupMsg, icon: 'error' });
            } else {
                setError('Error al conectar con el servidor.');
                Swal.fire({ 
                    title: 'Error', 
                    text: 'Existe un problema al momento de crear el registro', 
                    icon: 'error' 
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate("/users/list");
    };

    // Renderizado condicional según la librería de diseño
    if (designLibrary === 'material') {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button variant="outlined" onClick={handleBack} disabled={loading}>
                            <ArrowLeft size={18} style={{ marginRight: '8px' }} />
                            Volver
                        </Button>
                        <Box>
                            <Typography variant="h4" sx={{ color: '#ffb300' }}>Crear Nuevo Usuario</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Complete el formulario para agregar un nuevo usuario al sistema
                            </Typography>
                        </Box>
                    </Box>
                    <ThemeSelector />
                </Box>

                {error && (
                    <Paper sx={{ p:2, mb:2, bgcolor: '#ffebee' }}>
                        <Typography color="error" variant="subtitle1">⚠️ Error al crear usuario</Typography>
                        <Typography>{error}</Typography>
                    </Paper>
                )}

                {loading && (
                    <Paper sx={{ p:2, mb:2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CircularProgress size={20} />
                            <Box>
                                <Typography><strong>⏳ Creando usuario...</strong></Typography>
                                <Typography variant="body2">Por favor espere mientras se procesa la información</Typography>
                            </Box>
                        </Box>
                    </Paper>
                )}

                <Paper sx={{ p: 3, maxWidth: 800 }}>
                    <GenericFormMaterial
                        mode="create"
                        initialValues={initialValues}
                        fields={materialFields}
                        onSubmit={handleMaterialSubmit}
                        onCancel={handleBack}
                        submitLabel="Crear Usuario"
                        loading={loading}
                    />
                    
                    <Paper sx={{ p: 2, mt: 3, bgcolor: '#f0fdf4', border: '2px solid #10b981' }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#065f46' }}>
                            💡 Información Importante
                        </Typography>
                        <Box component="ul" sx={{ color: '#047857', pl: 3 }}>
                            <li>Todos los campos marcados con <strong style={{ color: '#dc2626' }}>*</strong> son obligatorios</li>
                            <li>El correo electrónico debe ser <strong>único</strong> en el sistema</li>
                            <li>Asegúrese de verificar la información antes de enviar</li>
                        </Box>
                    </Paper>
                </Paper>
            </Box>
        );
    }

    // Renderizado Bootstrap (por defecto)
    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <Breadcrumb pageName="Crear Usuario" />
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="d-flex align-items-center gap-3">
                            <button
                                onClick={handleBack}
                                className="btn btn-outline-success d-flex align-items-center gap-2"
                                disabled={loading}
                                style={{
                                    borderWidth: '2px',
                                    borderColor: '#10b981',
                                    color: '#059669',
                                    fontWeight: '700',
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#d1fae5';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <ArrowLeft size={18} />
                                Volver
                            </button>
                            <div>
                                <h2 className="h2 fw-bold mb-2" style={{ 
                                    color: '#065f46',
                                    fontFamily: '"Segoe UI", sans-serif',
                                    letterSpacing: '-0.5px'
                                }}>
                                    ➕ Crear Nuevo Usuario
                                </h2>
                                <p className="mb-0" style={{ color: '#047857', fontSize: '1rem' }}>
                                    Complete el formulario para agregar un nuevo usuario al sistema
                                </p>
                            </div>
                        </div>
                        <ThemeSelector />
                    </div>
                </Col>
            </Row>

            {error && (
                <Alert 
                    variant="danger" 
                    dismissible 
                    onClose={() => setError(null)}
                    style={{
                        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                        border: '2px solid #ef4444',
                        borderRadius: '12px',
                        color: '#991b1b',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                        marginBottom: '24px'
                    }}
                >
                    <Alert.Heading as="h6" style={{ fontWeight: '800', color: '#991b1b' }}>
                        ⚠️ Error al crear usuario
                    </Alert.Heading>
                    {error}
                </Alert>
            )}

            {loading && (
                <Alert 
                    variant="info"
                    style={{
                        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                        border: '2px solid #3b82f6',
                        borderRadius: '12px',
                        color: '#1e40af',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                        marginBottom: '24px'
                    }}
                >
                    <div className="d-flex align-items-center gap-3">
                        <Spinner 
                            animation="border" 
                            variant="primary"
                            style={{ width: '2rem', height: '2rem' }}
                        />
                        <div>
                            <strong style={{ fontSize: '1.1rem' }}>⏳ Creando usuario...</strong>
                            <p className="mb-0 small">Por favor espere mientras se procesa la información</p>
                        </div>
                    </div>
                </Alert>
            )}

            <Row>
                <Col lg={10} xl={8}>
                    <GenericForm
                        fields={formFields}
                        onSubmit={handleCreateUser}
                        onCancel={handleBack}
                        submitLabel="Crear Usuario"
                        cancelLabel="Cancelar"
                        loading={loading}
                        showReset={true}
                        resetLabel="Limpiar"
                    />

                    <div 
                        className="mt-4 p-4"
                        style={{
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                            border: '2px solid #10b981',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                        }}
                    >
                        <h6 className="fw-bold mb-3" style={{ color: '#065f46', fontSize: '1.1rem' }}>
                            💡 Información Importante
                        </h6>
                        <ul className="mb-0" style={{ color: '#047857', fontSize: '0.95rem', lineHeight: '1.8' }}>
                            <li>Todos los campos marcados con <strong style={{ color: '#dc2626' }}>*</strong> son obligatorios</li>
                            <li>El correo electrónico debe ser <strong>único</strong> en el sistema</li>
                            <li>Asegúrese de verificar la información antes de enviar</li>
                        </ul>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateUser;