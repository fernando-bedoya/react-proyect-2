import { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FileText, Users, Settings } from 'lucide-react';
import GenericTable from './GenericTable';
import GenericForm from './GenericForm';
import GenericModal from './GenericModal';
import type { FieldConfig } from './GenericForm';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

const GenericComponentsExamples = () => {
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // ========================================
  // EJEMPLO 1: GenericTable
  // ========================================
  const sampleUsers: User[] = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'Admin',
      active: true,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria@example.com',
      role: 'Editor',
      active: true,
      createdAt: '2024-02-20'
    },
    {
      id: 3,
      name: 'Carlos López',
      email: 'carlos@example.com',
      role: 'Viewer',
      active: false,
      createdAt: '2024-03-10'
    },
  ];

  const columns = ['id', 'name', 'email', 'role', 'active', 'createdAt'];

  const actions = [
    {
      name: 'edit',
      label: 'Editar',
      icon: 'edit' as const,
      variant: 'primary' as const,
    },
    {
      name: 'delete',
      label: 'Eliminar',
      icon: 'delete' as const,
      variant: 'danger' as const,
    },
    {
      name: 'view',
      label: 'Ver',
      icon: 'view' as const,
      variant: 'info' as const,
    },
  ];

  const handleAction = (actionName: string, item: Record<string, any>) => {
    const user = item as User;
    switch (actionName) {
      case 'edit':
        setSelectedUser(user);
        setShowFormModal(true);
        break;
      case 'delete':
        console.log('Eliminar usuario:', user);
        alert(`¿Eliminar a ${user.name}?`);
        break;
      case 'view':
        setSelectedUser(user);
        setShowModal(true);
        break;
    }
  };

  // ========================================
  // EJEMPLO 2: GenericForm
  // ========================================
  const userFormFields: FieldConfig[] = [
    {
      name: 'name',
      label: 'Nombre Completo',
      type: 'text',
      placeholder: 'Ingrese el nombre',
      required: true,
      validation: (value: string) => {
        if (value.length < 3) {
          return 'El nombre debe tener al menos 3 caracteres';
        }
        return null;
      }
    },
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      placeholder: 'ejemplo@correo.com',
      required: true,
      validation: (value: string) => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Correo electrónico inválido';
        }
        return null;
      }
    },
    {
      name: 'phone',
      label: 'Teléfono',
      type: 'tel',
      placeholder: '(555) 123-4567',
      required: false
    },
    {
      name: 'role',
      label: 'Rol',
      type: 'select',
      required: true,
      options: [
        { value: '', label: '-- Seleccione un rol --' },
        { value: 'admin', label: 'Administrador' },
        { value: 'editor', label: 'Editor' },
        { value: 'viewer', label: 'Visualizador' }
      ]
    },
    {
      name: 'department',
      label: 'Departamento',
      type: 'select',
      required: true,
      options: [
        { value: '', label: '-- Seleccione un departamento --' },
        { value: 'it', label: 'Tecnología' },
        { value: 'sales', label: 'Ventas' },
        { value: 'hr', label: 'Recursos Humanos' },
        { value: 'marketing', label: 'Marketing' }
      ]
    },
    {
      name: 'startDate',
      label: 'Fecha de Inicio',
      type: 'date',
      required: true
    },
    {
      name: 'active',
      label: 'Usuario Activo',
      type: 'checkbox',
      required: false
    },
    {
      name: 'notifications',
      label: 'Tipo de Notificaciones',
      type: 'radio',
      required: true,
      options: [
        { value: 'all', label: 'Todas las notificaciones' },
        { value: 'important', label: 'Solo importantes' },
        { value: 'none', label: 'Ninguna' }
      ]
    },
    {
      name: 'bio',
      label: 'Biografía',
      type: 'textarea',
      placeholder: 'Cuéntanos sobre ti...',
      required: false,
      rows: 4
    }
  ];

  const handleFormSubmit = (data: any) => {
    console.log('Formulario enviado:', data);
    setFormData(data);
    setShowFormModal(false);
    alert('¡Formulario enviado correctamente!');
  };

  const handleFormCancel = () => {
    console.log('Formulario cancelado');
    setShowFormModal(false);
    setSelectedUser(null);
  };

  // ========================================
  // EJEMPLO 3: GenericModal
  // ========================================
  const handleConfirmAction = () => {
    console.log('Acción confirmada');
    setShowModal(false);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h2 fw-bold" style={{ color: '#10b981' }}>
            Componentes Genéricos con Bootstrap
          </h1>
          <p className="text-muted">
            Ejemplos de uso de GenericTable, GenericForm y GenericModal
          </p>
        </Col>
      </Row>

      {/* Resultado del formulario */}
      {formData && (
        <Alert variant="success" dismissible onClose={() => setFormData(null)}>
          <Alert.Heading>¡Formulario Enviado!</Alert.Heading>
          <pre className="mb-0">{JSON.stringify(formData, null, 2)}</pre>
        </Alert>
      )}

      {/* EJEMPLO 1: Tabla Genérica */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex align-items-center gap-2">
                <Users size={24} style={{ color: '#10b981' }} />
                <h5 className="mb-0 fw-bold">Ejemplo 1: GenericTable</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-3">
                Tabla reutilizable con acciones personalizables, estilos y formateo automático
              </p>
              
              <GenericTable
                data={sampleUsers}
                columns={columns}
                actions={actions}
                onAction={handleAction}
                striped
                hover
                bordered
                responsive
                size="sm"
                emptyMessage="No hay usuarios registrados"
              />

              <div className="mt-3 p-3 bg-light rounded">
                <h6 className="fw-bold mb-2">Código de ejemplo:</h6>
                <pre className="mb-0" style={{ fontSize: '0.85rem' }}>
{`<GenericTable
  data={users}
  columns={['id', 'name', 'email', 'role', 'active']}
  actions={[
    {
      label: 'Editar',
      icon: 'edit',
      onClick: (user) => handleEdit(user),
      variant: 'primary'
    },
    {
      label: 'Eliminar',
      icon: 'delete',
      onClick: (user) => handleDelete(user),
      variant: 'danger'
    }
  ]}
  striped
  hover
  responsive
/>`}
                </pre>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* EJEMPLO 2: Formulario Genérico */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex align-items-center gap-2">
                <FileText size={24} style={{ color: '#10b981' }} />
                <h5 className="mb-0 fw-bold">Ejemplo 2: GenericForm</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-3">
                Formulario dinámico con validación, múltiples tipos de campos y manejo de errores
              </p>

              <Button
                variant="success"
                onClick={() => setShowFormModal(true)}
                className="mb-3"
              >
                Abrir Formulario de Ejemplo
              </Button>

              <div className="p-3 bg-light rounded">
                <h6 className="fw-bold mb-2">Características:</h6>
                <ul className="mb-2">
                  <li>12 tipos de campos: text, email, number, password, tel, url, date, time, select, textarea, checkbox, radio</li>
                  <li>Validación personalizada con mensajes de error</li>
                  <li>Estado de carga y deshabilitado</li>
                  <li>Grid responsivo automático</li>
                  <li>Estilos Bootstrap optimizados</li>
                </ul>

                <h6 className="fw-bold mb-2 mt-3">Configuración de campos:</h6>
                <pre className="mb-0" style={{ fontSize: '0.85rem' }}>
{`const fields: FieldConfig[] = [
  {
    name: 'email',
    label: 'Correo',
    type: 'email',
    required: true,
    validators: [
      {
        validate: (value) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value),
        message: 'Email inválido'
      }
    ]
  },
  {
    name: 'role',
    label: 'Rol',
    type: 'select',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'Usuario' }
    ]
  }
];`}
                </pre>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* EJEMPLO 3: Modal Genérico */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex align-items-center gap-2">
                <Settings size={24} style={{ color: '#10b981' }} />
                <h5 className="mb-0 fw-bold">Ejemplo 3: GenericModal</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <p className="text-muted mb-3">
                Modal reutilizable con diferentes tamaños, tipos de alerta y botones personalizables
              </p>

              <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant="primary"
                  onClick={() => setShowModal(true)}
                >
                  Modal Simple
                </Button>
              </div>

              <div className="mt-3 p-3 bg-light rounded">
                <h6 className="fw-bold mb-2">Propiedades disponibles:</h6>
                <ul className="mb-0">
                  <li><code>size</code>: 'sm', 'lg', 'xl'</li>
                  <li><code>centered</code>: Centrado vertical</li>
                  <li><code>scrollable</code>: Contenido con scroll</li>
                  <li><code>fullscreen</code>: Pantalla completa (responsive)</li>
                  <li><code>alertType</code>: 'info', 'success', 'warning', 'danger'</li>
                  <li><code>primaryButton</code>: Botón principal con loading</li>
                  <li><code>secondaryButton</code>: Botón secundario</li>
                  <li><code>customFooter</code>: Footer personalizado</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de ejemplo simple */}
      <GenericModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Detalle del Usuario"
        size="lg"
        alertType="info"
        primaryButton={{
          label: 'Confirmar',
          onClick: handleConfirmAction,
          variant: 'success'
        }}
        secondaryButton={{
          label: 'Cerrar',
          onClick: () => setShowModal(false),
          variant: 'outline-secondary'
        }}
      >
        {selectedUser && (
          <div>
            <Row className="mb-3">
              <Col md={4}><strong>ID:</strong></Col>
              <Col md={8}>{selectedUser.id}</Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}><strong>Nombre:</strong></Col>
              <Col md={8}>{selectedUser.name}</Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}><strong>Email:</strong></Col>
              <Col md={8}>{selectedUser.email}</Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}><strong>Rol:</strong></Col>
              <Col md={8}>{selectedUser.role}</Col>
            </Row>
            <Row className="mb-3">
              <Col md={4}><strong>Estado:</strong></Col>
              <Col md={8}>
                <span className={`badge ${selectedUser.active ? 'bg-success' : 'bg-danger'}`}>
                  {selectedUser.active ? 'Activo' : 'Inactivo'}
                </span>
              </Col>
            </Row>
            <Row>
              <Col md={4}><strong>Creado:</strong></Col>
              <Col md={8}>{selectedUser.createdAt}</Col>
            </Row>
          </div>
        )}
      </GenericModal>

      {/* Modal con formulario */}
      <GenericModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="xl"
        scrollable
        showFooter={false}
      >
        <GenericForm
          fields={userFormFields}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={selectedUser || undefined}
          submitLabel={selectedUser ? 'Actualizar' : 'Crear Usuario'}
          cancelLabel="Cancelar"
          resetLabel="Limpiar Formulario"
          showReset
        />
      </GenericModal>
    </Container>
  );
};

export default GenericComponentsExamples;
