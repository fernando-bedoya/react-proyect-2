import React, { useState } from 'react';
import {
  Button,
  Form,
  Alert,
  Card,
  Badge,
  Spinner,
  Toast,
  ToastContainer,
  Accordion,
  ListGroup,
  ProgressBar,
} from 'react-bootstrap';

/**
 * Colección de ejemplos prácticos de componentes Bootstrap
 * que pueden ser copiados y usados en el proyecto
 */

// ============================================================================
// 1. FORMULARIO DE LOGIN
// ============================================================================
export const LoginForm: React.FC = () => {
  const [validated, setValidated] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card style={{ width: '400px' }} className="shadow-lg">
        <Card.Body>
          <h2 className="text-2xl font-bold text-center mb-4">Iniciar Sesión</h2>
          
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                type="email"
                placeholder="ejemplo@email.com"
              />
              <Form.Control.Feedback type="invalid">
                Por favor ingresa un email válido.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                required
                type="password"
                placeholder="Contraseña"
              />
              <Form.Control.Feedback type="invalid">
                Por favor ingresa tu contraseña.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check type="checkbox" label="Recordarme" />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              Ingresar
            </Button>
          </Form>

          <div className="text-center mt-3">
            <small className="text-gray-600">
              ¿No tienes cuenta? <a href="#" className="text-blue-600">Regístrate</a>
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

// ============================================================================
// 2. SISTEMA DE NOTIFICACIONES (TOASTS)
// ============================================================================
export const NotificationExample: React.FC = () => {
  const [showA, setShowA] = useState(false);
  const [showB, setShowB] = useState(false);

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-4">Sistema de Notificaciones</h3>
      
      <div className="flex gap-3 mb-4">
        <Button onClick={() => setShowA(true)} variant="primary">
          Mostrar Toast Success
        </Button>
        <Button onClick={() => setShowB(true)} variant="danger">
          Mostrar Toast Error
        </Button>
      </div>

      <ToastContainer position="top-end" className="p-3">
        <Toast show={showA} onClose={() => setShowA(false)} delay={3000} autohide>
          <Toast.Header>
            <strong className="me-auto">✅ Éxito</strong>
            <small>Hace 1 segundo</small>
          </Toast.Header>
          <Toast.Body>La operación se completó correctamente!</Toast.Body>
        </Toast>

        <Toast show={showB} onClose={() => setShowB(false)} bg="danger">
          <Toast.Header closeButton={false}>
            <strong className="me-auto text-white">❌ Error</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Hubo un problema al procesar tu solicitud.
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

// ============================================================================
// 3. CARDS CON ESTADÍSTICAS
// ============================================================================
export const StatsCards: React.FC = () => {
  const stats = [
    { title: 'Total Usuarios', value: '2,543', change: '+12%', variant: 'primary' },
    { title: 'Ventas', value: '$45,231', change: '+23%', variant: 'success' },
    { title: 'Pedidos', value: '1,234', change: '-5%', variant: 'warning' },
    { title: 'Conversión', value: '3.2%', change: '+0.5%', variant: 'info' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-sm">
          <Card.Body>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
              <Badge bg={stat.variant as any}>{stat.change}</Badge>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

// ============================================================================
// 4. LISTA DE TAREAS CON BADGES
// ============================================================================
export const TaskList: React.FC = () => {
  const tasks = [
    { id: 1, title: 'Diseñar dashboard', status: 'Completado', priority: 'high' },
    { id: 2, title: 'Implementar API', status: 'En progreso', priority: 'high' },
    { id: 3, title: 'Revisar código', status: 'Pendiente', priority: 'medium' },
    { id: 4, title: 'Testing', status: 'Pendiente', priority: 'low' },
  ];

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Completado': return 'success';
      case 'En progreso': return 'primary';
      case 'Pendiente': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h3 className="text-2xl font-bold mb-4">Lista de Tareas</h3>
      
      <ListGroup>
        {tasks.map((task) => (
          <ListGroup.Item key={task.id} className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">{task.title}</h5>
              <small>
                <Badge bg={getPriorityBadge(task.priority)} className="me-2">
                  {task.priority.toUpperCase()}
                </Badge>
              </small>
            </div>
            <Badge bg={getBadgeVariant(task.status) as any}>
              {task.status}
            </Badge>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

// ============================================================================
// 5. ACCORDION CON FAQ
// ============================================================================
export const FAQAccordion: React.FC = () => {
  const faqs = [
    {
      question: '¿Cómo instalo Bootstrap?',
      answer: 'Puedes instalar Bootstrap usando npm install bootstrap react-bootstrap y luego importar los estilos en tu archivo principal.',
    },
    {
      question: '¿Puedo usar Bootstrap con Tailwind?',
      answer: 'Sí! Puedes usar ambos juntos. Solo asegúrate de usar componentes de React-Bootstrap y clases de Tailwind de manera separada para evitar conflictos.',
    },
    {
      question: '¿Cómo personalizo los estilos?',
      answer: 'Puedes sobrescribir las variables CSS de Bootstrap o usar las clases de utilidad de Tailwind para personalizar los estilos según tus necesidades.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h3 className="text-2xl font-bold mb-4">Preguntas Frecuentes</h3>
      
      <Accordion defaultActiveKey="0">
        {faqs.map((faq, index) => (
          <Accordion.Item key={index} eventKey={index.toString()}>
            <Accordion.Header>{faq.question}</Accordion.Header>
            <Accordion.Body>{faq.answer}</Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};

// ============================================================================
// 6. BARRA DE PROGRESO
// ============================================================================
export const ProgressExample: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h3 className="text-2xl font-bold mb-4">Progreso del Proyecto</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span>Diseño</span>
            <span>100%</span>
          </div>
          <ProgressBar now={100} variant="success" />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>Backend</span>
            <span>75%</span>
          </div>
          <ProgressBar now={75} variant="primary" />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>Frontend</span>
            <span>60%</span>
          </div>
          <ProgressBar now={60} variant="info" />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>Testing</span>
            <span>30%</span>
          </div>
          <ProgressBar now={30} variant="warning" />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>Documentación</span>
            <span>10%</span>
          </div>
          <ProgressBar now={10} variant="danger" />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. ALERTAS CON ÍCONOS
// ============================================================================
export const AlertExamples: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h3 className="text-2xl font-bold mb-4">Ejemplos de Alertas</h3>
      
      <div className="space-y-3">
        <Alert variant="success">
          <Alert.Heading>✅ ¡Operación Exitosa!</Alert.Heading>
          <p className="mb-0">
            Los cambios se han guardado correctamente en la base de datos.
          </p>
        </Alert>

        <Alert variant="info">
          <Alert.Heading>ℹ️ Información</Alert.Heading>
          <p className="mb-0">
            Esta función estará disponible en la próxima versión.
          </p>
        </Alert>

        <Alert variant="warning">
          <Alert.Heading>⚠️ Advertencia</Alert.Heading>
          <p className="mb-0">
            Tu sesión expirará en 5 minutos. Por favor guarda tu trabajo.
          </p>
        </Alert>

        <Alert variant="danger">
          <Alert.Heading>❌ Error</Alert.Heading>
          <p className="mb-0">
            No se pudo conectar al servidor. Verifica tu conexión a internet.
          </p>
        </Alert>
      </div>
    </div>
  );
};

// ============================================================================
// 8. BOTONES CON SPINNERS
// ============================================================================
export const ButtonSpinnerExample: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-4">Botones con Loading</h3>
      
      <div className="flex gap-3">
        <Button variant="primary" onClick={handleClick} disabled={loading}>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Cargando...
            </>
          ) : (
            'Guardar Cambios'
          )}
        </Button>

        <Button variant="success" disabled>
          <Spinner
            as="span"
            animation="grow"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-2"
          />
          Procesando...
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL QUE MUESTRA TODOS LOS EJEMPLOS
// ============================================================================
const BootstrapExamples: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b mb-6">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-800">
            📚 Ejemplos de Componentes Bootstrap
          </h1>
          <p className="text-gray-600 mt-2">
            Colección de componentes listos para usar en tu proyecto
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <StatsCards />
        <hr />
        <LoginForm />
        <hr />
        <NotificationExample />
        <hr />
        <TaskList />
        <hr />
        <FAQAccordion />
        <hr />
        <ProgressExample />
        <hr />
        <AlertExamples />
        <hr />
        <ButtonSpinnerExample />
      </div>
    </div>
  );
};

export default BootstrapExamples;
