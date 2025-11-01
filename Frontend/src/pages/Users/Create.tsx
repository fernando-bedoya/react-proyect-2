import React, { useState } from 'react';
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

const CreateUser: React.FC = () => {
    const navigate = useNavigate();
    const { designLibrary } = useTheme();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Configuración de campos del formulario
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

    // Lógica de creación
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
            const errorMsg = error.response?.data?.error || "Error al conectar con el servidor.";
            setError(errorMsg);
            Swal.fire({
                title: "Error",
                text: errorMsg,
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
