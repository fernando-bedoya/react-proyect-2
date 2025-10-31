import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Alert, Spinner, Modal } from "react-bootstrap";
import { ArrowLeft } from "lucide-react";
import Breadcrumb from '../../components/Breadcrumb';
import Swal from 'sweetalert2';
import { permissionService } from '../../services/permissionService';
import { Permission } from '../../models/Permission';
import { useNavigate, useParams } from 'react-router-dom';
import PermissionFormValidators from '../../components/formValidators/PermissionFormValidators';

const UpdatePermission: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id?: string }>();
	const [showModal, setShowModal] = useState<boolean>(true);
	const [loading, setLoading] = useState<boolean>(true);
	const [saving, setSaving] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [permission, setPermission] = useState<Permission | null>(null);

	useEffect(() => {
		if (!id) {
			setError('ID de permiso no proporcionado');
			setLoading(false);
			return;
		}

		const fetchPermission = async () => {
			setLoading(true);
			const data = await permissionService.getPermissionById(Number(id));
			if (data) {
				setPermission(data);
			} else {
				setError('Permiso no encontrado');
			}
			setLoading(false);
		};

		fetchPermission();
	}, [id]);

	const handleClose = () => {
		setShowModal(false);
		navigate('/permissions/list');
	};

	const handleUpdate = async (values: Permission) => {
		if (!id) return;
		setSaving(true);
		setError(null);
		try {
			const updated = await permissionService.updatePermission(Number(id), values);
			if (updated) {
				// close modal first to avoid aria-hidden/focus issues
				setShowModal(false);
				Swal.fire({ title: '¡Actualizado!', text: 'El permiso se ha actualizado correctamente.', icon: 'success', timer: 1400, showConfirmButton: false });
				setTimeout(() => navigate('/permissions/list'), 700);
			} else {
				setError('No se pudo actualizar el permiso');
				Swal.fire('Error', 'No se pudo actualizar el permiso', 'error');
			}
		} catch (err) {
			console.error('Error updating permission:', err);
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
					<Breadcrumb pageName="Actualizar Permiso" />
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
							<h2 className="h3 fw-bold mb-1" style={{ color: '#0ea5a4' }}>
								Editar Permiso
							</h2>
							<p className="text-muted mb-0">Modifique la URL, método o entidad y guarde los cambios.</p>
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
								<h5 className="mb-0">Editar permiso</h5>
							</div>
							<p className="small text-muted">Los cambios se enviarán al backend al guardar.</p>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			<Modal show={showModal} onHide={handleClose} centered>
				<Modal.Header closeButton className="bg-light">
					<Modal.Title>Actualizar Permiso</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{loading ? (
						<div className="text-center py-4">
							<Spinner animation="border" />
						</div>
					) : permission ? (
						<PermissionFormValidators mode={2} permission={permission} handleUpdate={handleUpdate} />
					) : (
						<div className="text-center py-3">No hay datos para mostrar</div>
					)}
				</Modal.Body>
				<Modal.Footer className="bg-light">
					<Button variant="outline-secondary" onClick={handleClose} disabled={saving}>Cancelar</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	);
};

export default UpdatePermission;

