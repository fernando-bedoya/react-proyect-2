import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import Swal from "sweetalert2";
import { User } from '../../models/User';
import UserFormValidator from '../../components/UserFormValidator';
import GenericFormMaterial from '../../components/GenericsMaterial/GenericFormMaterial';
import ThemeSelector from '../../components/ThemeSelector';
import Breadcrumb from "../../components/Breadcrumb";

const UpdateUser: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [updating, setUpdating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar datos del usuario después del montaje
    useEffect(() => {
        console.log("Id->" + id);
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        if (!id) {
            setError("ID de usuario no válido");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const userData = await userService.getUserById(parseInt(id));
            setUser(userData);
        } catch (error) {
            console.error("Error fetching user:", error);
            setError("Error al cargar los datos del usuario. Por favor, intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (theUser: User) => {
        setUpdating(true);
        setError(null);

        try {
            const updatedUser = await userService.updateUser(theUser.id || 0, theUser);
            if (updatedUser) {
                Swal.fire({
                    title: "¡Completado!",
                    text: "El usuario se ha actualizado correctamente",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
                
                setTimeout(() => {
                    navigate("/users/list");
                }, 2000);
            } else {
                setError("Hubo un problema al actualizar el usuario. Por favor, intente nuevamente.");
                Swal.fire({
                    title: "Error",
                    text: "Existe un problema al momento de actualizar el registro",
                    icon: "error",
                    confirmButtonColor: "#10b981"
                });
            }
        } catch (error) {
            setError("Error al conectar con el servidor. Por favor, verifique su conexión.");
            Swal.fire({
                title: "Error",
                text: "Existe un problema al momento de actualizar el registro",
                icon: "error",
                confirmButtonColor: "#10b981"
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleBack = () => {
        navigate("/users/list");
    };

    if (loading) {
        return (
            <Container fluid className="py-5">
                <div className="text-center">
                    <Spinner animation="border" variant="success" style={{ width: '3rem', height: '3rem' }} />
                    <p className="mt-3 text-muted">Cargando datos del usuario...</p>
                </div>
            </Container>
        );
    }

    if (!user && !loading) {
        return (
            <Container fluid className="py-4">
                <Alert variant="danger">
                    <Alert.Heading>Usuario no encontrado</Alert.Heading>
                    <p>No se pudo encontrar el usuario solicitado.</p>
                    <hr />
                    <div className="d-flex justify-content-end">
                        <button className="btn btn-outline-danger" onClick={handleBack}>
                            Volver al listado
                        </button>
                    </div>
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            {/* Breadcrumb y título */}
            <Row className="mb-4">
                <Col>
                    <Breadcrumb pageName="Actualizar Usuario" />
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="d-flex align-items-center gap-3">
                            <button
                                onClick={handleBack}
                                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                                disabled={updating}
                            >
                                <ArrowLeft size={16} />
                                Volver
                            </button>
                            <div>
                                <h2 className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>
                                    Actualizar Usuario
                                </h2>
                                <p className="text-muted mb-0">
                                    Modifique la información del usuario <strong>{user?.name}</strong>
                                </p>
                            </div>
                        </div>
                        <ThemeSelector />
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
                    <Alert.Heading as="h6">Error al actualizar usuario</Alert.Heading>
                    {error}
                </Alert>
            )}

            {/* Spinner de carga durante actualización */}
            {updating && (
                <Alert variant="info" className="shadow-sm mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <Spinner animation="border" size="sm" variant="info" />
                        <div>
                            <strong>Actualizando usuario...</strong>
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
                            {user && (
                                <GenericFormMaterial
                                    mode="edit"
                                    initialValues={user}
                                    fields={[
                                        { name: 'name', label: 'Nombre', required: true },
                                        { name: 'email', label: 'Email', type: 'email', required: true },
                                        { name: 'phone', label: 'Teléfono' },
                                    ]}
                                    submitLabel="Actualizar"
                                    loading={updating}
                                    onSubmit={(values) => handleUpdateUser(values as any)}
                                    onCancel={() => navigate('/users/list')}
                                />
                            )}
                        </Card.Body>
                    </Card>

                    {/* Tarjeta de información */}
                    <Card className="shadow-sm border-0 mt-3">
                        <Card.Body className="bg-light">
                            <h6 className="fw-semibold mb-2">💡 Información</h6>
                            <ul className="small text-muted mb-0 ps-3">
                                <li>Los cambios se aplicarán inmediatamente</li>
                                <li>No puede modificar el ID del usuario</li>
                                <li>Si cambia el correo, debe ser único en el sistema</li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UpdateUser;