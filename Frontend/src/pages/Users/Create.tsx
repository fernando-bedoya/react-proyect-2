import React, { useState } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import { User } from '../../models/User';
import UserFormValidator from '../../components/UserFormValidator';
import Swal from 'sweetalert2';
import { userService } from "../../services/userService";
import Breadcrumb from '../../components/Breadcrumb';
import { useNavigate } from "react-router-dom";

const CreateUser: React.FC = () => {
    const navigate = useNavigate();
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

    return (
        <Container fluid className="py-4">
            {/* Breadcrumb y título */}
            <Row className="mb-4">
                <Col>
                    <Breadcrumb pageName="Crear Usuario" />
                    <div className="d-flex align-items-center gap-3 mt-3">
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
                </Col>
            </Row>

            {/* Alertas de error */}
            {error && (
                <Alert 
                    variant="danger" 
                    dismissible 
                    onClose={() => setError(null)}
                    className="shadow-sm mb-4"
                >
                    <Alert.Heading as="h6">Error al crear usuario</Alert.Heading>
                    {error}
                </Alert>
            )}

            {/* Spinner de carga */}
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

            {/* Formulario */}
            <Row>
                <Col lg={8} xl={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom py-3">
                            <h5 className="mb-0 fw-semibold">Información del Usuario</h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <UserFormValidator
                                handleCreate={handleCreateUser}
                                mode={1} // 1 significa creación
                            />
                        </Card.Body>
                    </Card>

                    {/* Tarjeta de ayuda */}
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
};

export default CreateUser;
