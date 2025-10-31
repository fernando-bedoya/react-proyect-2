import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Alert, Spinner, Modal, Form } from "react-bootstrap";
import { ArrowLeft, Plus } from "lucide-react";
import Breadcrumb from '../../components/Breadcrumb';
import Swal from 'sweetalert2';
import { permissionService } from '../../services/permissionService';
import { Permission } from '../../models/Permission';
import { useNavigate } from 'react-router-dom';

const CreatePermission: React.FC = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState<boolean>(true); // abrir modal al cargar la página
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<Partial<Permission>>({
        url: '',
        method: 'GET',
        entity: ''
    });

    useEffect(() => {
        // abrir modal al montarse
        setShowModal(true);
    }, []);

    const handleClose = () => {
        setShowModal(false);
        // volver a la lista
        navigate('/permissions/list');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const validate = (): string | null => {
        if (!form.url || form.url.trim() === '') return 'La URL es obligatoria.';
        if (!form.method || form.method.trim() === '') return 'El método es obligatorio.';
        if (!form.entity || form.entity.trim() === '') return 'La entidad es obligatoria.';
        return null;
    };

    const handleSave = async () => {
        const v = validate();
        if (v) {
            setError(v);
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const payload: Omit<Permission, 'id' | 'created_at' | 'updated_at'> = {
                url: form.url!.trim(),
                method: form.method!.trim(),
                entity: form.entity!.trim()
            };

            const created = await permissionService.createPermission(payload as any);
            if (created) {
                Swal.fire({
                    title: '¡Completado!',
                    text: 'El permiso se ha creado correctamente.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                // cerrar modal y volver a la lista
                setTimeout(() => navigate('/permissions/list'), 800);
            } else {
                setError('No se pudo crear el permiso. Verifica los datos.');
                Swal.fire('Error', 'No se pudo crear el permiso', 'error');
            }
        } catch (err) {
            console.error('Error creating permission:', err);
            setError('Error al conectar con el servidor.');
            Swal.fire('Error', 'Error al conectar con el servidor', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <Breadcrumb pageName="Crear Permiso" />
                    <div className="d-flex align-items-center gap-3 mt-3">
                        <button
                            onClick={() => navigate('/permissions/list')}
                            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                            disabled={saving}
                        >
                            <ArrowLeft size={16} />
                            Volver
                        </button>
                        <div>
                            <h2 className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>
                                Crear Nuevo Permiso
                            </h2>
                            <p className="text-muted mb-0">Complete los campos para crear un permiso</p>
                        </div>
                    </div>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)} className="shadow-sm mb-4">
                    {error}
                </Alert>
            )}

            <Row>
                <Col lg={8} xl={6}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">Formulario rápido</h5>
                                <Button variant="success" size="sm" onClick={() => setShowModal(true)}>
                                    <Plus size={14} /> Abrir formulario
                                </Button>
                            </div>
                            <p className="small text-muted">Al guardar, el permiso será enviado al backend.</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>Nuevo Permiso</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="perm-url">
                            <Form.Label>URL</Form.Label>
                            <Form.Control
                                type="text"
                                name="url"
                                value={form.url}
                                onChange={handleChange}
                                placeholder="/api/users"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="perm-method">
                            <Form.Label>Método</Form.Label>
                            <Form.Select name="method" value={form.method} onChange={handleChange}>
                                <option>GET</option>
                                <option>POST</option>
                                <option>PUT</option>
                                <option>DELETE</option>
                                <option>PATCH</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="perm-entity">
                            <Form.Label>Entidad</Form.Label>
                            <Form.Control
                                type="text"
                                name="entity"
                                value={form.entity}
                                onChange={handleChange}
                                placeholder="users, roles, settings"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="outline-secondary" onClick={handleClose} disabled={saving}>Cancelar</Button>
                    <Button variant="success" onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Guardando...
                            </>
                        ) : (
                            'Guardar'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CreatePermission;


