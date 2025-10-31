import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import Breadcrumb from '../../components/Breadcrumb';
import RoleFormValidator from '../../components/RoleFormValidator';
import { Role } from '../../models/Role';
import { roleService } from '../../services/Role/roleService';

const UpdateRole: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const rid = Number(id);
        const found = await roleService.getRoleById(rid);
        setRole(found);
      } catch (err) {
        console.error('Error fetching role:', err);
        setError('Error al cargar el rol');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleUpdateRole = (values: Role) => {
    if (!role) {
      setError('Rol no encontrado');
      return;
    }

    if (!values.name || !values.name.trim()) {
      setError('El nombre del rol es requerido');
      return;
    }

    setSaving(true);
    (async () => {
      try {
        const updated = await roleService.updateRole(role.id as number, { name: values.name?.trim(), description: values.description });
        if (!updated) throw new Error('No se pudo actualizar en el servidor');

        Swal.fire({ title: '¡Completado!', text: 'Rol actualizado correctamente', icon: 'success', timer: 1500, showConfirmButton: false });
        setTimeout(() => navigate('/roles/list'), 1200);
      } catch (err) {
        console.error('Error updating role:', err);
        setError('Error al actualizar el rol');
        Swal.fire({ title: 'Error', text: 'Existe un problema al momento de actualizar', icon: 'error', confirmButtonColor: '#10b981' });
      } finally {
        setSaving(false);
      }
    })();
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <Row>
          <Col>
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!role) {
    return (
      <Container fluid className="py-4">
        <Row>
          <Col>
            <Alert variant="warning">Rol no encontrado.</Alert>
            <button className="btn btn-outline-secondary" onClick={() => navigate('/roles/list')}>Volver</button>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Breadcrumb pageName="Editar Rol" />
          <div className="d-flex align-items-center gap-3 mt-3">
            <button onClick={() => navigate('/roles/list')} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" disabled={saving}>
              <ArrowLeft size={16} />
              Volver
            </button>
            <div>
              <h2 className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>Editar Rol</h2>
              <p className="text-muted mb-0">Editar los datos del rol seleccionado.</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8} xl={6}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-semibold">Información del Rol</h5>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              <RoleFormValidator mode={2} role={role} handleUpdate={handleUpdateRole} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UpdateRole;
