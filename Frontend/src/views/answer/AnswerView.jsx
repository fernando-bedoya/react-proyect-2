// AnswerView.jsx - Vista completa para gestión de respuestas de seguridad de usuarios
// Este componente permite listar, crear, editar y eliminar respuestas a preguntas de seguridad
// Sirve para administrar las respuestas que los usuarios dan a las preguntas de seguridad del sistema

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
  FaShieldAlt,
  FaSearch,
  FaTimes,
  FaEdit,
  FaTrash,
  FaUser,
  FaQuestionCircle,
} from 'react-icons/fa';
import { getAll, create, update, remove } from '../../services/baseService';
import EntityTable from '../../components/common/EntityTable';
import EntityForm from '../../components/common/EntityForm';
import ThemeSelector from '../../components/ThemeSelector';

const AnswerView = () => {
  // Estados principales
  const [answers, setAnswers] = useState([]);
  const [filteredAnswers, setFilteredAnswers] = useState([]);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
  const [currentAnswer, setCurrentAnswer] = useState(null);

  // Estados de búsqueda y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAnswers();
    loadUsers();
    loadQuestions();
  }, []);

  // Filtrar respuestas cuando cambia el término de búsqueda
  useEffect(() => {
    filterAnswers();
  }, [searchTerm, answers]);

  /**
   * Carga todas las respuestas de seguridad
   */
  const loadAnswers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAll('answers');
      setAnswers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar las respuestas: ' + (err.response?.data?.message || err.message));
      setAnswers([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga la lista de usuarios para el selector
   */
  const loadUsers = async () => {
    try {
      const data = await getAll('users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setUsers([]);
    }
  };

  /**
   * Carga la lista de preguntas de seguridad para el selector
   */
  const loadQuestions = async () => {
    try {
      const data = await getAll('security-questions');
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar preguntas de seguridad:', err);
      setQuestions([]);
    }
  };

  /**
   * Filtra las respuestas según el término de búsqueda
   */
  const filterAnswers = () => {
    if (!searchTerm.trim()) {
      setFilteredAnswers(answers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = answers.filter((answer) => {
      const userName = getUserName(answer.user_id).toLowerCase();
      const questionText = getQuestionText(answer.question_id).toLowerCase();
      const answerText = (answer.answer_text || '').toLowerCase();

      return (
        answer.id.toString().includes(term) ||
        userName.includes(term) ||
        questionText.includes(term) ||
        answerText.includes(term)
      );
    });

    setFilteredAnswers(filtered);
    setCurrentPage(1); // Resetear a la primera página
  };

  /**
   * Obtiene el nombre del usuario por ID
   */
  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.username || user.name || user.email : `Usuario ${userId}`;
  };

  /**
   * Obtiene el texto de la pregunta por ID
   */
  const getQuestionText = (questionId) => {
    const question = questions.find((q) => q.id === questionId);
    return question ? question.question_text : `Pregunta ${questionId}`;
  };

  /**
   * Limpia el filtro de búsqueda
   */
  const clearSearch = () => {
    setSearchTerm('');
  };

  /**
   * Abre el modal para crear una nueva respuesta
   */
  const handleCreate = () => {
    setModalMode('create');
    setCurrentAnswer(null);
    setShowModal(true);
  };

  /**
   * Abre el modal para editar una respuesta existente
   */
  const handleEdit = (answer) => {
    setModalMode('edit');
    setCurrentAnswer(answer);
    setShowModal(true);
  };

  /**
   * Elimina una respuesta
   */
  const handleDelete = async (answer) => {
    const userName = getUserName(answer.user_id);
    const questionText = getQuestionText(answer.question_id);
    
    const confirmDelete = window.confirm(
      `¿Está seguro de eliminar la respuesta?\n\nUsuario: ${userName}\nPregunta: ${questionText}\n\nNota: Esta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await remove('answers', answer.id);
      setSuccess('Respuesta eliminada exitosamente');
      await loadAnswers();
    } catch (err) {
      setError('Error al eliminar la respuesta: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Guarda la respuesta (crear o editar)
   */
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'create') {
        // El backend espera POST a /answers/user/{user_id}/question/{question_id}
        const { user_id, security_question_id, ...answerData } = formData;
        await create(`answers/user/${user_id}/question/${security_question_id}`, answerData);
        setSuccess('Respuesta creada exitosamente');
      } else {
        // El backend espera PUT a /answers/{answer_id}
        await update('answers', currentAnswer.id, formData);
        setSuccess('Respuesta actualizada exitosamente');
      }

      await loadAnswers();
      handleCloseModal();
    } catch (err) {
      const errorMessage =
        modalMode === 'create'
          ? 'Error al crear la respuesta: '
          : 'Error al actualizar la respuesta: ';
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
    setCurrentAnswer(null);
  };

  /**
   * Configuración de campos para el formulario
   */
  const formFields = [
    {
      name: 'user_id',
      label: 'Usuario',
      type: 'select',
      required: true,
      options: users.map((user) => ({
        value: user.id,
        label: `${user.username || user.name || user.email} (ID: ${user.id})`,
      })),
      colSize: 12,
      helpText: 'Seleccione el usuario que responde la pregunta de seguridad',
    },
    {
      name: 'question_id',
      label: 'Pregunta de Seguridad',
      type: 'select',
      required: true,
      options: questions.map((question) => ({
        value: question.id,
        label: question.question_text,
      })),
      colSize: 12,
      helpText: 'Seleccione la pregunta de seguridad',
    },
    {
      name: 'answer_text',
      label: 'Respuesta',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 200,
      placeholder: 'Ingrese la respuesta a la pregunta de seguridad',
      colSize: 12,
      helpText: 'La respuesta debe ser fácil de recordar para el usuario',
      validate: (value, formData) => {
        // Validar que la respuesta no sea solo espacios
        if (value && value.trim().length < 2) {
          return 'La respuesta debe tener al menos 2 caracteres válidos';
        }
        return null;
      },
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
      render: (value) => <Badge bg="secondary">{value}</Badge>,
    },
    {
      key: 'user_id',
      label: 'Usuario',
      render: (value) => (
        <div className="d-flex align-items-center">
          <FaUser className="me-2 text-primary" />
          <span className="fw-bold">{getUserName(value)}</span>
        </div>
      ),
    },
    {
      key: 'question_id',
      label: 'Pregunta de Seguridad',
      render: (value) => (
        <div className="d-flex align-items-start">
          <FaQuestionCircle className="me-2 mt-1 text-info flex-shrink-0" />
          <span className="text-truncate" style={{ maxWidth: '300px' }} title={getQuestionText(value)}>
            {getQuestionText(value)}
          </span>
        </div>
      ),
    },
    {
      key: 'answer_text',
      label: 'Respuesta',
      render: (value) => (
        <span className="text-muted" style={{ fontStyle: 'italic' }}>
          {value ? '••••••••' : 'Sin respuesta'}
        </span>
      ),
    },
  ];

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAnswers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAnswers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container fluid className="py-4">
      {/* Encabezado con Selector de Tema */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="mb-1">
                <FaShieldAlt className="me-2" />
                Gestión de Respuestas de Seguridad
              </h2>
              <p className="text-muted mb-0">
                Administre las respuestas de los usuarios a las preguntas de seguridad
              </p>
              <small className="text-warning">
                <i className="fas fa-exclamation-triangle me-1"></i>
                Las respuestas son confidenciales y se muestran ocultas por seguridad
              </small>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <ThemeSelector />
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={loading || users.length === 0 || questions.length === 0}
                title={
                  users.length === 0 || questions.length === 0
                    ? 'Debe tener usuarios y preguntas de seguridad registrados'
                    : 'Crear nueva respuesta'
                }
              >
                <FaPlus className="me-2" />
                Nueva Respuesta
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Advertencias */}
      {(users.length === 0 || questions.length === 0) && (
        <Alert variant="warning" className="mb-3">
          <strong>Atención:</strong> Para crear respuestas, primero debe tener{' '}
          {users.length === 0 && 'usuarios registrados'}
          {users.length === 0 && questions.length === 0 && ' y '}
          {questions.length === 0 && 'preguntas de seguridad creadas'}.
        </Alert>
      )}

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
              placeholder="Buscar por ID, usuario o pregunta..."
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
            Mostrando {currentItems.length} de {filteredAnswers.length} respuestas
            {searchTerm && ' (filtradas)'}
          </small>
        </Col>
      </Row>

      {/* Tabla de respuestas */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FaShieldAlt className="me-2" />
                Respuestas de Seguridad
              </h5>
            </Card.Header>
            <Card.Body>
              {loading && answers.length === 0 ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Cargando respuestas de seguridad...</p>
                </div>
              ) : (
                <>
                  <EntityTable
                    columns={tableColumns}
                    data={currentItems}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    striped
                    bordered
                    hover
                    responsive
                    emptyMessage="No se encontraron respuestas. Cree la primera respuesta haciendo clic en 'Nueva Respuesta'"
                  />

                  {/* Información de seguridad */}
                  {answers.length > 0 && (
                    <div className="mt-3">
                      <Alert variant="info" className="mb-0">
                        <small>
                          <FaShieldAlt className="me-2" />
                          <strong>Seguridad:</strong> Las respuestas se muestran ocultas
                          (••••••••) para proteger la información sensible de los usuarios.
                          Solo pueden ser editadas por administradores autorizados.
                        </small>
                      </Alert>
                    </div>
                  )}

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-3">
                      <nav>
                        <ul className="pagination mb-0">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Anterior
                            </button>
                          </li>

                          {[...Array(totalPages)].map((_, index) => {
                            const pageNumber = index + 1;
                            // Mostrar solo páginas cercanas a la actual
                            if (
                              pageNumber === 1 ||
                              pageNumber === totalPages ||
                              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                            ) {
                              return (
                                <li
                                  key={pageNumber}
                                  className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => handlePageChange(pageNumber)}
                                  >
                                    {pageNumber}
                                  </button>
                                </li>
                              );
                            } else if (
                              pageNumber === currentPage - 2 ||
                              pageNumber === currentPage + 2
                            ) {
                              return (
                                <li key={pageNumber} className="page-item disabled">
                                  <span className="page-link">...</span>
                                </li>
                              );
                            }
                            return null;
                          })}

                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Siguiente
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Estadísticas */}
      {answers.length > 0 && (
        <Row className="mt-4">
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <FaShieldAlt size={32} className="text-primary mb-2" />
                <h3 className="text-primary mb-2">{answers.length}</h3>
                <p className="text-muted mb-0">Total de Respuestas</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <FaUser size={32} className="text-success mb-2" />
                <h3 className="text-success mb-2">
                  {new Set(answers.map((a) => a.user_id)).size}
                </h3>
                <p className="text-muted mb-0">Usuarios con Respuestas</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center">
              <Card.Body>
                <FaQuestionCircle size={32} className="text-info mb-2" />
                <h3 className="text-info mb-2">
                  {new Set(answers.map((a) => a.question_id)).size}
                </h3>
                <p className="text-muted mb-0">Preguntas Respondidas</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Modal para crear/editar respuesta */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'create' ? (
              <>
                <FaPlus className="me-2" />
                Nueva Respuesta de Seguridad
              </>
            ) : (
              <>
                <FaEdit className="me-2" />
                Editar Respuesta de Seguridad
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-3">
            <small>
              <FaShieldAlt className="me-2" />
              <strong>Información de Seguridad:</strong>
              <ul className="mb-0 mt-2">
                <li>Las respuestas son confidenciales y se almacenan de forma segura</li>
                <li>Asegúrese de que el usuario pueda recordar fácilmente su respuesta</li>
                <li>La respuesta debe ser específica y personal</li>
                <li>Evite respuestas genéricas que otros puedan adivinar</li>
              </ul>
            </small>
          </Alert>

          <EntityForm
            fields={formFields}
            onSubmit={handleSubmit}
            initialValues={currentAnswer || {}}
            submitButtonText={
              modalMode === 'create' ? 'Crear Respuesta' : 'Actualizar Respuesta'
            }
            showCancelButton={true}
            onCancel={handleCloseModal}
            isLoading={loading}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AnswerView;
