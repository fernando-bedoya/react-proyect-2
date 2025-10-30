import React, { useState } from 'react';
import { Button, Alert, Card, Modal, Form, Badge } from 'react-bootstrap';

/**
 * Componente de prueba para verificar la integración de Bootstrap
 * Este componente muestra varios componentes de React-Bootstrap funcionando
 */
const BootstrapTest: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  return (
    // Usando Tailwind para el contenedor principal
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Título con Tailwind */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Prueba de Integración: Bootstrap + Tailwind
        </h1>

        {/* Alert de Bootstrap */}
        {showAlert && (
          <Alert variant="success" onClose={() => setShowAlert(false)} dismissible>
            <Alert.Heading>¡Bootstrap está funcionando correctamente! ✅</Alert.Heading>
            <p>
              Este es un componente Alert de React-Bootstrap. Los estilos se aplican correctamente
              sin conflictos con Tailwind CSS.
            </p>
          </Alert>
        )}

        {/* Grid con Tailwind conteniendo Cards de Bootstrap */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Card 1 - Bootstrap */}
          <Card className="shadow-sm">
            <Card.Header as="h5">
              Componentes Bootstrap <Badge bg="primary">New</Badge>
            </Card.Header>
            <Card.Body>
              <Card.Title>Card de Bootstrap</Card.Title>
              <Card.Text>
                Este es un componente Card de React-Bootstrap con estilos nativos.
              </Card.Text>
              <Button variant="primary" onClick={handleShow}>
                Abrir Modal
              </Button>
            </Card.Body>
          </Card>

          {/* Card 2 - Tailwind */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-xl font-bold text-gray-800">Card de Tailwind</h5>
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">CSS</span>
            </div>
            <p className="text-gray-600 mb-4">
              Este es un card creado con utilidades de Tailwind CSS.
            </p>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">
              Acción Tailwind
            </button>
          </div>

          {/* Card 3 - Mixto */}
          <Card className="shadow-lg"> {/* Bootstrap Card */}
            <Card.Body>
              <div className="flex items-center gap-3 mb-3"> {/* Tailwind flex */}
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🎨</span>
                </div>
                <div>
                  <h5 className="text-lg font-semibold mb-0">Componente Mixto</h5>
                  <small className="text-gray-500">Bootstrap + Tailwind</small>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Combinando lo mejor de ambos frameworks sin conflictos.
              </p>
            </Card.Body>
          </Card>
        </div>

        {/* Formulario de Bootstrap con estilos Tailwind en el contenedor */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Formulario de Bootstrap</h3>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="Enter email" />
              <Form.Text className="text-muted">
                Nunca compartiremos tu email con nadie más.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check type="checkbox" label="Recordarme" />
            </Form.Group>

            <div className="flex gap-3"> {/* Tailwind flex para botones */}
              <Button variant="primary" type="submit">
                Enviar
              </Button>
              <Button variant="outline-secondary" type="reset">
                Limpiar
              </Button>
            </div>
          </Form>
        </div>

        {/* Botones de variantes de Bootstrap */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Variantes de Botones</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="info">Info</Button>
            <Button variant="light">Light</Button>
            <Button variant="dark">Dark</Button>
            <Button variant="link">Link</Button>
          </div>

          <hr className="my-4" />

          <h4 className="text-xl font-semibold text-gray-700 mb-3">Botones Outline</h4>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline-primary">Primary</Button>
            <Button variant="outline-secondary">Secondary</Button>
            <Button variant="outline-success">Success</Button>
            <Button variant="outline-danger">Danger</Button>
          </div>
        </div>

        {/* Modal de Bootstrap */}
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Modal de Bootstrap</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4"> {/* Tailwind spacing */}
              <p>Este es un modal de React-Bootstrap funcionando correctamente.</p>
              <Alert variant="info" className="mb-0">
                Los modales de Bootstrap funcionan perfectamente con React-Bootstrap!
              </Alert>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cerrar
            </Button>
            <Button variant="primary" onClick={handleClose}>
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Modal>

      </div>
    </div>
  );
};

export default BootstrapTest;
