/**
 * AnswerView - Gestión de Respuestas de Seguridad
 * 
 * NOTA: GenericCRUDView tiene limitaciones con relaciones complejas,
 * por lo que usamos el componente especializado UserSecurityQuestionsManager
 * o creamos respuestas manualmente especificando IDs.
 */

import React, { useState, useEffect } from 'react';
import { Container, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import answerService, { Answer } from '../../services/answerService';
import { userService } from '../../services/userService';
import securityQuestionService, { SecurityQuestion } from '../../services/securityQuestionService';
import GenericTable from '../../components/GenericTable';
import { useTheme } from '../../context/ThemeContext';

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
  const { designLibrary } = useTheme();
  const [answers, setAnswers] = useState<AnswerWithDetails[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAnswers, setShowAnswers] = useState<{ [key: number]: boolean }>({});

  // Mapeo de colores por tema
  const themeColors = {
    bootstrap: { primary: 'success', buttonClass: 'btn-success' },
    tailwind: { primary: 'primary', buttonClass: 'btn-primary' },
    material: { primary: 'warning', buttonClass: 'btn-warning' }
  };
  const currentTheme = themeColors[designLibrary as keyof typeof themeColors] || themeColors.bootstrap;
  
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

  // Preparar datos para GenericTable
  const tableData = answers.map(ans => ({
    id: ans.id,
    user_info: `${ans.user?.name || `Usuario #${ans.user_id}`} (${ans.user?.email || 'N/A'})`,
    question_name: ans.question?.name || `Pregunta #${ans.security_question_id}`,
    answer_content: showAnswers[ans.id!] ? ans.content : '••••••••',
    created_at: ans.created_at ? new Date(ans.created_at).toLocaleDateString('es-ES') : 'N/A',
    // Datos originales para acciones
    _original: ans,
    _isVisible: showAnswers[ans.id!]
  }));

  // Columnas
  const columns = ['id', 'user_info', 'question_name', 'answer_content', 'created_at'];

  // Acciones
  const actions = [
    {
      name: 'toggle',
      label: 'Ver/Ocultar',
      variant: 'secondary' as const,
      icon: 'view' as const
    },
    {
      name: 'edit',
      label: 'Editar',
      variant: currentTheme.primary as 'primary' | 'success' | 'warning',
      icon: 'edit' as const
    },
    {
      name: 'delete',
      label: 'Eliminar',
      variant: 'danger' as const,
      icon: 'delete' as const
    }
  ];

  // Manejador de acciones
  const handleAction = (actionName: string, row: any) => {
    const answer = row._original;
    
    switch (actionName) {
      case 'toggle':
        toggleShowAnswer(answer.id!);
        break;
      case 'edit':
        handleOpenModal(answer);
        break;
      case 'delete':
        handleDelete(answer.id!);
        break;
    }
  };

  if (loading) {
    return (
      <Container className="text-center p-5">
        <Spinner animation="border" variant={currentTheme.primary} />
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
        <Button variant={currentTheme.primary} onClick={() => handleOpenModal()}>
          <Plus size={20} className="me-2" />
          Nueva Respuesta
        </Button>
      </div>

      {answers.length === 0 ? (
        <Alert variant="info">
          📭 No hay respuestas de seguridad registradas
        </Alert>
      ) : (
        <GenericTable
          data={tableData}
          columns={columns}
          columnLabels={{
            id: 'ID',
            user_info: 'Usuario',
            question_name: 'Pregunta',
            answer_content: 'Respuesta',
            created_at: 'Fecha'
          }}
          actions={actions}
          onAction={handleAction}
        />
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
            <Button variant={currentTheme.primary} type="submit">
              {editingId ? 'Actualizar' : 'Crear'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AnswerView;
