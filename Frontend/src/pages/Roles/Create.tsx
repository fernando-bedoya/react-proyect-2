import React, { useState } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Breadcrumb from '../../components/Breadcrumb';
import GenericEntityForm, { FieldDef } from '../../components/formValidators/GenericEntityForm';
import { Role } from '../../models/Role';
import { roleService } from '../../services/Role/roleService';

const CreateRole: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRole = async (role: Role) => {
    setLoading(true);
    setError(null);

    try {
      // Prepare payload (backend usually doesn't expect an id when creating)
      const payload = { name: (role.name || '').trim(), description: role.description };
      const created = await roleService.createRole(payload);

      if (!created) {
        throw new Error('No se pudo crear el rol en el servidor');
      }

      Swal.fire({
        title: '¡Completado!',
        text: 'El rol se ha creado correctamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => navigate('/roles/list'), 1200);
    } catch (err) {
      console.error('Error create role:', err);
      setError('Error al guardar el rol');
      Swal.fire({ title: 'Error', text: 'Existe un problema al crear el rol', icon: 'error', confirmButtonColor: '#10b981' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => navigate('/roles/list');

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Breadcrumb pageName="Crear Rol" />
          <div className="d-flex align-items-center gap-3 mt-3">
            <button onClick={handleBack} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" disabled={loading}>
              <ArrowLeft size={16} />
              Volver
            </button>
            <div>
              <h2 className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>Crear Nuevo Rol</h2>
              <p className="text-muted mb-0">Complete el formulario para agregar un nuevo rol al sistema</p>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="shadow-sm mb-4">
          <Alert.Heading as="h6">Error al crear rol</Alert.Heading>
          {error}
        </Alert>
      )}

      {loading && (
        <Alert variant="info" className="shadow-sm mb-4">
          <div className="d-flex align-items-center gap-3">
            <Spinner animation="border" size="sm" variant="info" />
            <div>
              <strong>Creando rol...</strong>
              <p className="mb-0 small">Por favor espere mientras se procesa la información</p>
            </div>
          </div>
        </Alert>
      )}

      <Row>
        <Col lg={8} xl={6}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-semibold">Información del Rol</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <GenericEntityForm
                mode={1}
                fields={[
                  { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Nombre del rol' },
                  { name: 'description', label: 'Descripción', type: 'textarea', required: false, placeholder: 'Descripción corta (opcional)' },
                ] as FieldDef[]}
                onCreate={async (values: any) => {
                  // adapt values to Role payload
                  const payload = { name: (values.name || '').trim(), description: values.description };
                  return await handleCreateRole(payload as any);
                }}
              />
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0 mt-3">
            <Card.Body className="bg-light">
              <h6 className="fw-semibold mb-2">💡 Información</h6>
              <ul className="small text-muted mb-0 ps-3">
                <li>Todos los campos marcados con * son obligatorios</li>
                <li>Proporcione una descripción corta del rol (opcional)</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateRole;
