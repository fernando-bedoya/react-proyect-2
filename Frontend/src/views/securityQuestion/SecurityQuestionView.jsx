// SecurityQuestionView.jsx - Vista completa para gestión de preguntas de seguridad
// Este componente permite listar, crear, editar y eliminar preguntas de seguridad del sistema
// Sirve para administrar el catálogo de preguntas que los usuarios pueden usar para recuperar contraseñas

import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Alert,
  Spinner,
  Form,
  InputGroup,
  Badge,
} from 'react-bootstrap';
import {
  FaPlus,
  FaQuestionCircle,
  FaSearch,
  FaTimes,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import { getAll, create, update, remove } from '../../services/baseService';
import EntityTable from '../../components/common/EntityTable';
import EntityForm from '../../components/common/EntityForm';
import ThemeSelector from '../../components/ThemeSelector';

const SecurityQuestionView = () => {
  // Estados principales
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // Estados de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos al montar el componente
  useEffect(() => {
    loadQuestions();
  }, []);

  // Filtrar preguntas cuando cambia el término de búsqueda
  useEffect(() => {
    filterQuestions();
  }, [searchTerm, questions]);

  /**
   * Carga todas las preguntas de seguridad
   */
  const loadQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAll('security-questions');
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar las preguntas de seguridad: ' + (err.response?.data?.message || err.message));
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtra las preguntas según el término de búsqueda
   */
  const filterQuestions = () => {
    if (!searchTerm.trim()) {
      setFilteredQuestions(questions);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = questions.filter((question) => {
      const questionText = (question.name || '').toLowerCase();
      const description = (question.description || '').toLowerCase();
      const id = question.id.toString();

      return questionText.includes(term) || description.includes(term) || id.includes(term);
    });

    setFilteredQuestions(filtered);
  };

  /**
   * Limpia el filtro de búsqueda
   */
  const clearSearch = () => {
    setSearchTerm('');
  };

  /**
   * Abre el modal para crear una nueva pregunta
   */
  const handleCreate = () => {
    setModalMode('create');
    setCurrentQuestion(null);
    setShowModal(true);
  };

  /**
   * Abre el modal para editar una pregunta existente
   */
  const handleEdit = (question) => {
    setModalMode('edit');
    setCurrentQuestion(question);
    setShowModal(true);
  };

  /**
   * Elimina una pregunta de seguridad
   */
  const handleDelete = async (question) => {
    const confirmDelete = window.confirm(
      `¿Está seguro de eliminar la pregunta "${question.name}"?\n\nNota: Esta acción no se puede deshacer y puede afectar a usuarios que tengan esta pregunta configurada.`
    );

    if (!confirmDelete) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await remove('security-questions', question.id);
      setSuccess('Pregunta de seguridad eliminada exitosamente');
      await loadQuestions();
    } catch (err) {
      setError('Error al eliminar la pregunta: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Guarda la pregunta de seguridad (crear o editar)
   */
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'create') {
        await create('security-questions', formData);
        setSuccess('Pregunta de seguridad creada exitosamente');
      } else {
        await update('security-questions', currentQuestion.id, formData);
        setSuccess('Pregunta de seguridad actualizada exitosamente');
      }

      await loadQuestions();
      handleCloseModal();
    } catch (err) {
      const errorMessage =
        modalMode === 'create'
          ? 'Error al crear la pregunta: '
          : 'Error al actualizar la pregunta: ';
      setError(errorMessage + (err.response?.data?.message || err.message));
      throw err; // Para que el formulario maneje el error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra el modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentQuestion(null);
  };

  /**
   * Configuración de campos para el formulario
   */
  const formFields = [
    {
      name: 'name',
      label: 'Texto de la Pregunta',
      type: 'textarea',
      required: true,
      minLength: 10,
      maxLength: 255,
      rows: 4,
      placeholder: 'Ej: ¿Cuál es el nombre de tu primera mascota?',
      colSize: 12,
      helpText: 'Escriba una pregunta clara que los usuarios puedan responder fácilmente',
      validate: (value) => {
        // Validar que termine con signo de interrogación
        if (value && !value.trim().endsWith('?')) {
          return 'La pregunta debe terminar con un signo de interrogación (?)';
        }
        return null;
      },
    },
    {
      name: 'description',
      label: 'Descripción (Opcional)',
      type: 'textarea',
      required: false,
      maxLength: 500,
      rows: 3,
      placeholder: 'Ej: Pregunta sobre información personal de tu infancia',
      colSize: 12,
      helpText: 'Descripción adicional sobre el propósito de esta pregunta (opcional)',
    },
  ];

  /**
   * Configuración de columnas para la tabla
   */
  const tableColumns = [
    {
      key: 'id',
      label: 'ID',
      cellClassName: 'text-center',
      style: { width: '80px' },
      render: (value) => <Badge bg="primary">{value}</Badge>,
    },
    {
      key: 'name',
      label: 'Pregunta de Seguridad',
      render: (value) => (
        <div className="d-flex align-items-start">
          <FaQuestionCircle className="me-2 mt-1 text-primary flex-shrink-0" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Descripción',
      render: (value) => (
        <span className="text-muted">{value || 'Sin descripción'}</span>
      ),
    },
  ];

  return (
    <Container fluid className="py-4">
      {/* Encabezado con Selector de Tema */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="mb-1">
                <FaQuestionCircle className="me-2" />
                Gestión de Preguntas de Seguridad
              </h2>
              <p className="text-muted mb-0">
                Administre el catálogo de preguntas de seguridad del sistema
              </p>
              <small className="text-info">
                <i className="fas fa-info-circle me-1"></i>
                Las respuestas de los usuarios se gestionan en un módulo separado
              </small>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <ThemeSelector />
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={loading}
              >
                <FaPlus className="me-2" />
                Nueva Pregunta
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Mensajes de éxito y error */}
      {success && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccess('')}
          className="mb-3"
        >
          <i className="fas fa-check-circle me-2"></i>
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError('')}
          className="mb-3"
        >
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Barra de búsqueda */}
      <Row className="mb-3">
        <Col md={6} lg={4}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar por ID o texto de pregunta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button variant="outline-secondary" onClick={clearSearch}>
                <FaTimes />
              </Button>
            )}
          </InputGroup>
        </Col>
        <Col md={6} lg={8} className="d-flex align-items-center">
          <small className="text-muted">
            {filteredQuestions.length === questions.length ? (
              <>Total: {questions.length} preguntas</>
            ) : (
              <>
                Mostrando {filteredQuestions.length} de {questions.length} preguntas (filtradas)
              </>
            )}
          </small>
        </Col>
      </Row>

      {/* Tabla de preguntas de seguridad */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FaQuestionCircle className="me-2" />
                Catálogo de Preguntas de Seguridad
              </h5>
            </Card.Header>
            <Card.Body>
              {loading && questions.length === 0 ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Cargando preguntas de seguridad...</p>
                </div>
              ) : (
                <>
                  <EntityTable
                    columns={tableColumns}
                    data={filteredQuestions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    striped
                    bordered
                    hover
                    responsive
                    emptyMessage="No se encontraron preguntas de seguridad. Cree la primera pregunta haciendo clic en 'Nueva Pregunta'"
                  />

                  {/* Información adicional */}
                  {questions.length > 0 && (
                    <div className="mt-3">
                      <Alert variant="info" className="mb-0">
                        <small>
                          <strong>Nota:</strong> Las preguntas de seguridad son utilizadas
                          por los usuarios para recuperar sus contraseñas. Asegúrese de
                          crear preguntas claras y fáciles de recordar.
                        </small>
                      </Alert>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estadísticas */}
      {questions.length > 0 && (
        <Row className="mt-4">
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-primary mb-2">{questions.length}</h3>
                <p className="text-muted mb-0">Total de Preguntas</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-success mb-2">
                  {filteredQuestions.length}
                </h3>
                <p className="text-muted mb-0">
                  {searchTerm ? 'Resultados de Búsqueda' : 'Preguntas Activas'}
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <h3 className="text-info mb-2">
                  {questions.length > 0
                    ? Math.round(
                        questions.reduce(
                          (acc, q) => acc + (q.name?.length || 0),
                          0
                        ) / questions.length
                      )
                    : 0}
                </h3>
                <p className="text-muted mb-0">Caracteres Promedio</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Modal para crear/editar pregunta */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'create' ? (
              <>
                <FaPlus className="me-2" />
                Nueva Pregunta de Seguridad
              </>
            ) : (
              <>
                <FaEdit className="me-2" />
                Editar Pregunta de Seguridad
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning" className="mb-3">
            <small>
              <strong>Recomendaciones:</strong>
              <ul className="mb-0 mt-2">
                <li>Escriba preguntas claras y específicas</li>
                <li>Las preguntas deben terminar con signo de interrogación (?)</li>
                <li>Evite preguntas cuyas respuestas puedan cambiar con el tiempo</li>
                <li>Use un lenguaje sencillo y directo</li>
              </ul>
            </small>
          </Alert>

          <EntityForm
            fields={formFields}
            onSubmit={handleSubmit}
            initialValues={currentQuestion || {}}
            submitButtonText={
              modalMode === 'create' ? 'Crear Pregunta' : 'Actualizar Pregunta'
            }
            showCancelButton={true}
            onCancel={handleCloseModal}
            isLoading={loading}
          />

          {/* Ejemplos de preguntas */}
          <div className="mt-4">
            <h6 className="text-muted">Ejemplos de buenas preguntas:</h6>
            <ul className="small text-muted">
              <li>¿Cuál es el nombre de tu primera mascota?</li>
              <li>¿En qué ciudad naciste?</li>
              <li>¿Cuál es el apellido de soltera de tu madre?</li>
              <li>¿Cuál fue el nombre de tu primera escuela?</li>
              <li>¿Cuál es tu comida favorita?</li>
            </ul>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SecurityQuestionView;
