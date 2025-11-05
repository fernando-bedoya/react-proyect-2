/**
 * UserSecurityQuestionsManager - Componente para que un usuario gestione sus preguntas de seguridad
 * 
 * FLUJO:
 * 1. Cargar todas las preguntas disponibles
 * 2. Cargar respuestas existentes del usuario
 * 3. Permitir agregar nuevas respuestas
 * 4. Mostrar preguntas ya respondidas
 * 5. Permitir actualizar o eliminar respuestas
 * 
 * USO:
 * <UserSecurityQuestionsManager userId={123} />
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { Eye, EyeOff, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import Swal from 'sweetalert2';
import securityQuestionService, { SecurityQuestion } from '../../services/securityQuestionService';
import answerService, { Answer } from '../../services/answerService';

interface Props {
  userId: number;
  title?: string;
  showTitle?: boolean;
  maxQuestions?: number; // Límite de preguntas que puede responder
  onUpdate?: () => void; // Callback cuando se actualiza algo
}

interface QuestionWithAnswer extends SecurityQuestion {
  answer?: Answer;
  isAnswered: boolean;
}

const UserSecurityQuestionsManager: React.FC<Props> = ({
  userId,
  title = "Mis Preguntas de Seguridad",
  showTitle = true,
  maxQuestions = 5,
  onUpdate
}) => {
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para formulario de nueva respuesta
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [showAnswers, setShowAnswers] = useState<{ [key: number]: boolean }>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar preguntas disponibles
      const allQuestions = await securityQuestionService.getAll();
      
      // Cargar respuestas del usuario
      const userAnswers = await answerService.getByUserId(userId);

      // Combinar información
      const questionsWithAnswers: QuestionWithAnswer[] = allQuestions.map(q => {
        const answer = userAnswers.find(a => a.security_question_id === q.id);
        return {
          ...q,
          answer,
          isAnswered: !!answer
        };
      });

      setQuestions(questionsWithAnswers);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.response?.data?.error || 'Error al cargar preguntas de seguridad');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnswer = async () => {
    if (!selectedQuestionId || !newAnswer.trim()) {
      Swal.fire('Error', 'Selecciona una pregunta y escribe tu respuesta', 'error');
      return;
    }

    try {
      await answerService.create(userId, selectedQuestionId, newAnswer.trim());
      
      Swal.fire('¡Éxito!', 'Respuesta guardada correctamente', 'success');
      
      // Limpiar formulario
      setSelectedQuestionId(null);
      setNewAnswer('');
      
      // Recargar datos
      await loadData();
      
      if (onUpdate) onUpdate();
    } catch (err: any) {
      console.error('Error creando respuesta:', err);
      const errorMsg = err.response?.data?.error || 'Error al guardar respuesta';
      Swal.fire('Error', errorMsg, 'error');
    }
  };

  const handleUpdateAnswer = async (answerId: number) => {
    if (!editContent.trim()) {
      Swal.fire('Error', 'La respuesta no puede estar vacía', 'error');
      return;
    }

    try {
      await answerService.update(answerId, editContent.trim());
      
      Swal.fire('¡Actualizado!', 'Respuesta actualizada correctamente', 'success');
      
      setEditingId(null);
      setEditContent('');
      
      await loadData();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      console.error('Error actualizando respuesta:', err);
      Swal.fire('Error', 'No se pudo actualizar la respuesta', 'error');
    }
  };

  const handleDeleteAnswer = async (answerId: number, questionName: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar respuesta?',
      text: `Se eliminará tu respuesta a: "${questionName}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await answerService.delete(answerId);
        Swal.fire('¡Eliminado!', 'Respuesta eliminada correctamente', 'success');
        await loadData();
        if (onUpdate) onUpdate();
      } catch (err: any) {
        console.error('Error eliminando respuesta:', err);
        Swal.fire('Error', 'No se pudo eliminar la respuesta', 'error');
      }
    }
  };

  const toggleShowAnswer = (answerId: number) => {
    setShowAnswers(prev => ({
      ...prev,
      [answerId]: !prev[answerId]
    }));
  };

  const startEditing = (answer: Answer) => {
    setEditingId(answer.id!);
    setEditContent(answer.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  const answeredQuestions = questions.filter(q => q.isAnswered);
  const unansweredQuestions = questions.filter(q => !q.isAnswered);
  const canAddMore = answeredQuestions.length < maxQuestions;

  if (loading) {
    return (
      <Card className="text-center p-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Cargando preguntas de seguridad...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <strong>Error:</strong> {error}
        <Button variant="link" onClick={loadData}>Reintentar</Button>
      </Alert>
    );
  }

  return (
    <div className="user-security-questions">
      {showTitle && <h3 className="mb-4">{title}</h3>}

      {/* Información general */}
      <Alert variant="info" className="mb-4">
        <strong>Preguntas configuradas:</strong> {answeredQuestions.length} de {maxQuestions}
        <br />
        <small>Las preguntas de seguridad te ayudarán a recuperar tu cuenta si olvidas tu contraseña.</small>
      </Alert>

      {/* Preguntas ya respondidas */}
      {answeredQuestions.length > 0 && (
        <Card className="mb-4">
          <Card.Header className="bg-success text-white">
            <strong>✅ Preguntas Configuradas ({answeredQuestions.length})</strong>
          </Card.Header>
          <Card.Body>
            {answeredQuestions.map(q => (
              <div key={q.id} className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="flex-grow-1">
                    <strong className="text-primary">{q.name}</strong>
                    {q.description && (
                      <div className="text-muted small">{q.description}</div>
                    )}
                  </div>
                  <Badge bg="success">Respondida</Badge>
                </div>

                {editingId === q.answer?.id ? (
                  // Modo edición
                  <div className="mt-2">
                    <Form.Control
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Nueva respuesta..."
                      className="mb-2"
                    />
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleUpdateAnswer(q.answer!.id!)}
                      className="me-2"
                    >
                      <Save size={16} /> Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={cancelEditing}
                    >
                      <X size={16} /> Cancelar
                    </Button>
                  </div>
                ) : (
                  // Modo vista
                  <>
                    <div className="mt-2 d-flex align-items-center">
                      <strong className="me-2">Respuesta:</strong>
                      <code className="flex-grow-1">
                        {showAnswers[q.answer!.id!] ? q.answer!.content : '••••••••'}
                      </code>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => toggleShowAnswer(q.answer!.id!)}
                        className="ms-2"
                      >
                        {showAnswers[q.answer!.id!] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>

                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => startEditing(q.answer!)}
                        className="me-2"
                      >
                        <Edit2 size={16} /> Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDeleteAnswer(q.answer!.id!, q.name)}
                      >
                        <Trash2 size={16} /> Eliminar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

      {/* Formulario para agregar nueva respuesta */}
      {canAddMore && unansweredQuestions.length > 0 && (
        <Card>
          <Card.Header className="bg-primary text-white">
            <strong><Plus size={18} /> Agregar Nueva Pregunta de Seguridad</strong>
          </Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Selecciona una pregunta</Form.Label>
                <Form.Select
                  value={selectedQuestionId || ''}
                  onChange={(e) => setSelectedQuestionId(Number(e.target.value))}
                >
                  <option value="">-- Selecciona una pregunta --</option>
                  {unansweredQuestions.map(q => (
                    <option key={q.id} value={q.id}>
                      {q.name}
                    </option>
                  ))}
                </Form.Select>
                {selectedQuestionId && (
                  <Form.Text className="text-muted">
                    {unansweredQuestions.find(q => q.id === selectedQuestionId)?.description}
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tu respuesta</Form.Label>
                <Form.Control
                  type="text"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  disabled={!selectedQuestionId}
                />
                <Form.Text className="text-muted">
                  Asegúrate de recordar esta respuesta, la necesitarás para recuperar tu cuenta.
                </Form.Text>
              </Form.Group>

              <Button
                variant="success"
                onClick={handleCreateAnswer}
                disabled={!selectedQuestionId || !newAnswer.trim()}
              >
                <Plus size={18} /> Guardar Respuesta
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {!canAddMore && (
        <Alert variant="warning">
          Has alcanzado el límite de {maxQuestions} preguntas de seguridad.
          Elimina alguna para agregar otra diferente.
        </Alert>
      )}

      {unansweredQuestions.length === 0 && answeredQuestions.length === 0 && (
        <Alert variant="info">
          No hay preguntas de seguridad disponibles. Contacta al administrador.
        </Alert>
      )}
    </div>
  );
};

export default UserSecurityQuestionsManager;
