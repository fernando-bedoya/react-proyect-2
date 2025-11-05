/**
 * AnswerView - Gestión de Respuestas de Seguridad
 * 
 * NOTA: GenericCRUDView tiene limitaciones con relaciones complejas,
 * por lo que usamos el componente especializado UserSecurityQuestionsManager
 * o creamos respuestas manualmente especificando IDs.
 */

import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import answerService, { Answer } from '../../services/answerService';
import { userService } from '../../services/userService';
import securityQuestionService, { SecurityQuestion } from '../../services/securityQuestionService';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AnswerWithDetails extends Answer {
  user?: User;
  question?: SecurityQuestion;
}

const AnswerView: React.FC = () => {
  const [answers, setAnswers] = useState<AnswerWithDetails[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAnswers, setShowAnswers] = useState<{ [key: number]: boolean }>({});
  
  // Form state
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [answerContent, setAnswerContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar todas las respuestas
      const answersData = await answerService.getAll();
      
      // Cargar usuarios
      const usersData = await userService.getUsers();
      
      // Cargar preguntas
      const questionsData = await securityQuestionService.getAll();
      
      // Combinar datos
      const answersWithDetails = answersData.map(ans => ({
        ...ans,
        user: usersData.find((u: User) => u.id === ans.user_id),
        question: questionsData.find((q: SecurityQuestion) => q.id === ans.security_question_id)
      }));
      
      setAnswers(answersWithDetails);
      setUsers(usersData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (answer?: AnswerWithDetails) => {
    if (answer) {
      setEditingId(answer.id!);
      setSelectedUserId(answer.user_id);
      setSelectedQuestionId(answer.security_question_id);
      setAnswerContent(answer.content);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedUserId(null);
    setSelectedQuestionId(null);
    setAnswerContent('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId || !selectedQuestionId || !answerContent.trim()) {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
      return;
    }

    try {
      if (editingId) {
        // Actualizar
        await answerService.update(editingId, answerContent);
        Swal.fire('¡Actualizado!', 'Respuesta actualizada correctamente', 'success');
      } else {
        // Crear
        await answerService.create(selectedUserId, selectedQuestionId, answerContent);
        Swal.fire('¡Creado!', 'Respuesta creada correctamente', 'success');
      }
      
      handleCloseModal();
      loadData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Error al guardar la respuesta';
      Swal.fire('Error', errorMsg, 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Eliminar respuesta?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await answerService.delete(id);
        Swal.fire('¡Eliminado!', 'Respuesta eliminada correctamente', 'success');
        loadData();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la respuesta', 'error');
      }
    }
  };

  const toggleShowAnswer = (id: number) => {
    setShowAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <Container className="text-center p-5">
        <Spinner animation="border" />
        <p className="mt-3">Cargando respuestas...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>💬 Respuestas de Seguridad</h2>
          <p className="text-muted">Gestión de respuestas de usuarios a preguntas de seguridad</p>
        </div>
        <Button variant="success" onClick={() => handleOpenModal()}>
          <Plus size={20} className="me-2" />
          Nueva Respuesta
        </Button>
      </div>

      {answers.length === 0 ? (
        <Alert variant="info">
          📭 No hay respuestas de seguridad registradas
        </Alert>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Pregunta</th>
                  <th>Respuesta</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {answers.map(answer => (
                  <tr key={answer.id}>
                    <td>{answer.id}</td>
                    <td>
                      <div>
                        <strong>{answer.user?.name || `Usuario #${answer.user_id}`}</strong>
                        <br />
                        <small className="text-muted">{answer.user?.email}</small>
                      </div>
                    </td>
                    <td>{answer.question?.name || `Pregunta #${answer.security_question_id}`}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <code>
                          {showAnswers[answer.id!] ? answer.content : '••••••••'}
                        </code>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => toggleShowAnswer(answer.id!)}
                        >
                          {showAnswers[answer.id!] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </td>
                    <td>
                      <small>{new Date(answer.created_at!).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleOpenModal(answer)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(answer.id!)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Modal para crear/editar */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId ? 'Editar Respuesta' : 'Nueva Respuesta'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Usuario *</Form.Label>
              <Form.Select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                required
                disabled={!!editingId}
              >
                <option value="">-- Seleccionar usuario --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Selecciona el usuario que responde
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Pregunta de Seguridad *</Form.Label>
              <Form.Select
                value={selectedQuestionId || ''}
                onChange={(e) => setSelectedQuestionId(Number(e.target.value))}
                required
                disabled={!!editingId}
              >
                <option value="">-- Seleccionar pregunta --</option>
                {questions.map(question => (
                  <option key={question.id} value={question.id}>
                    {question.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Selecciona la pregunta a responder
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Respuesta *</Form.Label>
              <Form.Control
                type="text"
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder="Escribe la respuesta aquí..."
                required
              />
              <Form.Text className="text-muted">
                La respuesta del usuario a la pregunta de seguridad
              </Form.Text>
            </Form.Group>

            {!editingId && (
              <Alert variant="warning">
                <strong>⚠️ Importante:</strong> Un usuario solo puede responder cada pregunta una vez.
                Si ya existe una respuesta para esta combinación, recibirás un error.
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="success" type="submit">
              {editingId ? 'Actualizar' : 'Crear'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AnswerView;
