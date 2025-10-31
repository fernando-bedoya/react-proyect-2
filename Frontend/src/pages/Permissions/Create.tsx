import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Alert, Spinner, Modal } from "react-bootstrap";
import { ArrowLeft, Plus } from "lucide-react";
import Breadcrumb from '../../components/Breadcrumb';
import Swal from 'sweetalert2';
import { permissionService } from '../../services/permissionService';
import { Permission } from '../../models/Permission';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GenericEntityForm, { FieldDef } from '../../components/formValidators/GenericEntityForm';

const CreatePermission: React.FC = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState<boolean>(true); // abrir modal al cargar la página
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const [editMode, setEditMode] = useState<boolean>(false);
    const [loadingEdit, setLoadingEdit] = useState<boolean>(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

    useEffect(() => {
        // abrir modal al montarse
        setShowModal(true);
    }, []);

    const handleClose = () => {
        setShowModal(false);
        // volver a la lista
        navigate('/permissions/list');
    };

    // fields will adapt when in editMode (id read-only, only url & method editable)
    const baseFields: FieldDef[] = [
        { name: 'url', label: 'URL', type: 'text', required: true, placeholder: '/api/users' },
        { name: 'method', label: 'Método', type: 'select', required: true, options: [
            { value: 'GET', label: 'GET' },
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
            { value: 'DELETE', label: 'DELETE' },
            { value: 'PATCH', label: 'PATCH' },
        ]},
    ];

    const fields = editMode ? [
        { name: 'id', label: 'ID', type: 'text', readOnly: true },
        ...baseFields
    ] : baseFields;

    const deriveEntityFromUrl = (url?: string) => {
        if (!url) return '';
        try {
            const clean = String(url).split('?')[0].split('#')[0];
            const parts = clean.split('/').filter(Boolean);
            // prefer the first segment after possible api/version prefixes
            // if route starts with 'api' or 'v1' choose the next segment
            if (parts.length === 0) return '';
            if (parts[0].toLowerCase() === 'api' && parts.length > 1) return parts[1];
            if (/^v\d+/i.test(parts[0]) && parts.length > 1) return parts[1];
            // normalize entity names to match backend conventions
            const seg = parts[0];
            const lower = seg.toLowerCase();
            // special-case: 'roles' should map to singular 'Role'
            if (lower === 'roles') return 'Role';
            // default: capitalize first letter (e.g. users -> Users)
            return seg.charAt(0).toUpperCase() + seg.slice(1);
        } catch (e) {
            return '';
        }
    };

    const handleCreate = async (values: any) => {
        setError(null);
        try {
            const derivedEntity = deriveEntityFromUrl(values.url);
            const payload: Omit<Permission, 'id' | 'created_at' | 'updated_at'> = {
                url: values.url?.trim(),
                method: values.method?.trim(),
                // always prefer derived entity from URL; fall back to any provided value
                entity: derivedEntity || (values.entity && values.entity.trim()) || ''
            };

            const created = await permissionService.createPermission(payload as any);
            if (created) {
                // close modal first to avoid focus/aria-hidden conflicts
                setShowModal(false);
                Swal.fire({ title: '¡Completado!', text: 'El permiso se ha creado correctamente.', icon: 'success', timer: 1400, showConfirmButton: false });
                setTimeout(() => navigate('/permissions/list'), 700);
                return created;
            } else {
                setError('No se pudo crear el permiso. Verifica los datos.');
                Swal.fire('Error', 'No se pudo crear el permiso', 'error');
                return null;
            }
        } catch (err: any) {
            console.error('Error creating permission:', err);
            // if server returned a message, show it
            const serverMessage = err?.response?.data?.message || err?.response?.data || err?.message;
            setError(typeof serverMessage === 'string' ? serverMessage : 'Error al conectar con el servidor.');
            Swal.fire('Error', typeof serverMessage === 'string' ? serverMessage : 'Error al conectar con el servidor', 'error');
            return null;
        }
    };

    // fetch edit param and load permission if present
    useEffect(() => {
        const editId = searchParams.get('edit');
        if (editId) {
            (async () => {
                setLoadingEdit(true);
                setEditMode(true);
                try {
                    const perm = await permissionService.getPermissionById(Number(editId));
                    if (perm) {
                        setEditingPermission(perm);
                        // ensure modal open
                        setShowModal(true);
                    } else {
                        setError('Permiso a editar no encontrado');
                    }
                } catch (err: any) {
                    console.error('Error fetching permission for edit:', err);
                    setError('Error al cargar permiso para editar');
                } finally {
                    setLoadingEdit(false);
                }
            })();
        }
    }, [searchParams]);

    const handleUpdate = async (values: any) => {
        setError(null);
        try {
            const id = editingPermission?.id;
            if (!id) {
                setError('ID de permiso no disponible para actualizar');
                return null;
            }
            const derivedEntity = deriveEntityFromUrl(values.url);
            const payload: Partial<Permission> = {
                url: values.url?.trim(),
                method: values.method?.trim(),
                // always prefer derived entity from URL when updating
                entity: derivedEntity || (values.entity && values.entity.trim()) || ''
            };

            const updated = await permissionService.updatePermission(Number(id), payload);
            if (updated) {
                setShowModal(false);
                Swal.fire({ title: '¡Actualizado!', text: 'El permiso se ha actualizado correctamente.', icon: 'success', timer: 1400, showConfirmButton: false });
                setTimeout(() => navigate('/permissions/list'), 700);
                return updated;
            } else {
                setError('No se pudo actualizar el permiso');
                Swal.fire('Error', 'No se pudo actualizar el permiso', 'error');
                return null;
            }
        } catch (err: any) {
            console.error('Error updating permission:', err);
            const serverMessage = err?.response?.data?.message || err?.response?.data || err?.message;
            setError(typeof serverMessage === 'string' ? serverMessage : 'Error al conectar con el servidor.');
            Swal.fire('Error', typeof serverMessage === 'string' ? serverMessage : 'Error al conectar con el servidor', 'error');
            return null;
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
                        {loadingEdit ? (
                            <div className="text-center py-4">
                                <Spinner animation="border" />
                            </div>
                        ) : (
                            <GenericEntityForm
                                key={editMode ? `edit-${editingPermission?.id}` : 'create'}
                                mode={(editMode ? 2 : 1) as 1 | 2}
                                fields={fields}
                                initialValues={editMode && editingPermission ? {
                                    id: String(editingPermission.id),
                                    url: editingPermission.url || '',
                                    method: editingPermission.method || '',
                                    entity: editingPermission.entity || ''
                                } : undefined}
                                onCreate={handleCreate}
                                onUpdate={handleUpdate}
                            />
                        )}
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="outline-secondary" onClick={handleClose}>Cancelar</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CreatePermission;


