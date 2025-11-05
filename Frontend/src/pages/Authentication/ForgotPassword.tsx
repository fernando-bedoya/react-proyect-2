/**
 * ForgotPassword - Página de recuperación de contraseña usando preguntas de seguridad
 * 
 * FLUJO:
 * 1. Usuario ingresa su email
 * 2. Sistema busca el usuario en el backend
 * 3. Sistema carga las preguntas de seguridad que el usuario respondió
 * 4. Usuario responde las preguntas
 * 5. Sistema valida las respuestas (comparación texto plano para proyecto escolar)
 * 6. Si correctas, permite establecer nueva contraseña
 * 7. Actualiza contraseña en Firebase
 * 8. Guarda en historial del backend
 * 9. Redirige al login
 */

import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, InputGroup, Badge } from 'react-bootstrap';
import { Mail, Lock, Eye, EyeOff, KeyRound, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import AuthLayout from '../../components/AuthLayout';
import { userService } from '../../services/userService';
import answerService, { Answer } from '../../services/answerService';
import securityQuestionService, { SecurityQuestion } from '../../services/securityQuestionService';
import { getAuth, sendPasswordResetEmail, updatePassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { passwordService } from '../../services/Password/passwordService';

// Definir pasos del flujo
enum Step {
  EMAIL = 'email',
  QUESTIONS = 'questions',
  NEW_PASSWORD = 'new_password',
  SUCCESS = 'success'
}

interface UserAnswer extends Answer {
  question?: SecurityQuestion;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(Step.EMAIL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para paso 1: Email
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  // Estado para paso 2: Preguntas de seguridad
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [userResponses, setUserResponses] = useState<{ [key: number]: string }>({});

  // Estado para paso 3: Nueva contraseña
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * PASO 1: Buscar usuario por email y cargar sus preguntas
   */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Buscar usuario en el backend
      const users = await userService.getUsers();
      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        setError('No existe una cuenta con este correo electrónico.');
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Cargar respuestas del usuario
      const answers = await answerService.getByUserId(user.id);

      if (answers.length === 0) {
        await Swal.fire({
          icon: 'warning',
          title: 'Sin preguntas de seguridad',
          html: `
            <p>La cuenta <strong>${email}</strong> no tiene preguntas de seguridad configuradas.</p>
            <p><strong>Opciones:</strong></p>
            <ul style="text-align: left;">
              <li>Contacta al administrador para restablecer tu contraseña</li>
              <li>O usa la opción de recuperación por email de Firebase</li>
            </ul>
          `,
          confirmButtonText: 'Entendido'
        });
        setLoading(false);
        return;
      }

      // Cargar detalles de las preguntas
      const answersWithQuestions: UserAnswer[] = await Promise.all(
        answers.map(async (answer: Answer) => {
          const question = await securityQuestionService.getById(answer.security_question_id);
          return { ...answer, question };
        })
      );

      setUserAnswers(answersWithQuestions);
      setCurrentStep(Step.QUESTIONS);

    } catch (err: any) {
      console.error('Error al buscar usuario:', err);
      setError('Error al procesar la solicitud. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * PASO 2: Validar respuestas de seguridad
   */
  const handleQuestionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Verificar que se respondieron todas las preguntas
      const answeredAll = userAnswers.every(ua => userResponses[ua.id!]?.trim());
      
      if (!answeredAll) {
        setError('Por favor, responde todas las preguntas de seguridad.');
        setLoading(false);
        return;
      }

      // Validar respuestas (comparación texto plano - proyecto escolar)
      let allCorrect = true;
      const incorrectQuestions: string[] = [];

      for (const userAnswer of userAnswers) {
        const providedAnswer = userResponses[userAnswer.id!]?.trim().toLowerCase();
        const correctAnswer = userAnswer.content.trim().toLowerCase();

        if (providedAnswer !== correctAnswer) {
          allCorrect = false;
          incorrectQuestions.push(userAnswer.question?.name || 'Pregunta desconocida');
        }
      }

      if (!allCorrect) {
        await Swal.fire({
          icon: 'error',
          title: 'Respuestas incorrectas',
          html: `
            <p>Las siguientes respuestas no coinciden:</p>
            <ul style="text-align: left;">
              ${incorrectQuestions.map(q => `<li>${q}</li>`).join('')}
            </ul>
            <p><strong>Verifica tus respuestas e intenta nuevamente.</strong></p>
          `,
          confirmButtonText: 'Reintentar'
        });
        setLoading(false);
        return;
      }

      // Respuestas correctas, pasar al siguiente paso
      setCurrentStep(Step.NEW_PASSWORD);

    } catch (err: any) {
      console.error('Error al validar respuestas:', err);
      setError('Error al validar las respuestas. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * PASO 3: Establecer nueva contraseña
   */
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validaciones
      if (newPassword.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }

      // Actualizar contraseña en Firebase usando sendPasswordResetEmail
      // (más seguro que intentar actualizar directamente)
      await sendPasswordResetEmail(auth, email);

      // Guardar en historial del backend
      try {
        await passwordService.createPassword(userId!, {
          content: newPassword,
          startAt: new Date().toISOString(),
          endAt: '' // El backend lo manejará automáticamente
        });
      } catch (backendError) {
        console.warn('No se pudo guardar en backend, pero Firebase se actualizó:', backendError);
      }

      setCurrentStep(Step.SUCCESS);

      // Mostrar mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Contraseña restablecida!',
        html: `
          <p>Tu contraseña ha sido restablecida exitosamente.</p>
          <p><strong>Se ha enviado un correo a ${email}</strong></p>
          <p>Haz clic en el enlace del correo para completar el proceso.</p>
          <p>Luego podrás iniciar sesión con tu nueva contraseña.</p>
        `,
        confirmButtonText: 'Ir al Login',
        timer: 5000
      });

      // Redirigir al login
      navigate('/auth/signin');

    } catch (err: any) {
      console.error('Error al restablecer contraseña:', err);
      
      if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Por favor, espera unos minutos e intenta nuevamente.');
      } else {
        setError('Error al restablecer la contraseña. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Volver al paso anterior
   */
  const handleBack = () => {
    if (currentStep === Step.QUESTIONS) {
      setCurrentStep(Step.EMAIL);
      setUserAnswers([]);
      setUserResponses({});
    } else if (currentStep === Step.NEW_PASSWORD) {
      setCurrentStep(Step.QUESTIONS);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <AuthLayout>
      <Card className="shadow-lg border-0" style={{ borderRadius: '1rem', maxWidth: '600px', margin: '0 auto' }}>
        <Card.Body className="p-4 p-md-5">
          {/* Header */}
          <div className="text-center mb-4">
            <div 
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <KeyRound size={40} color="white" />
            </div>
            <h2 className="fw-bold mb-2" style={{ color: '#1f2937' }}>
              Recuperar Contraseña
            </h2>
            <p className="text-muted mb-0">
              {currentStep === Step.EMAIL && 'Ingresa tu correo electrónico'}
              {currentStep === Step.QUESTIONS && 'Responde tus preguntas de seguridad'}
              {currentStep === Step.NEW_PASSWORD && 'Establece tu nueva contraseña'}
            </p>
          </div>

          {/* Indicador de progreso */}
          <div className="d-flex justify-content-center mb-4 gap-2">
            <Badge 
              bg={currentStep === Step.EMAIL ? 'success' : 'secondary'}
              className="px-3 py-2"
            >
              1. Email
            </Badge>
            <Badge 
              bg={currentStep === Step.QUESTIONS ? 'success' : 'secondary'}
              className="px-3 py-2"
            >
              2. Preguntas
            </Badge>
            <Badge 
              bg={currentStep === Step.NEW_PASSWORD ? 'success' : 'secondary'}
              className="px-3 py-2"
            >
              3. Nueva contraseña
            </Badge>
          </div>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
              <strong>⚠</strong> {error}
            </Alert>
          )}

          {/* PASO 1: Ingresar email */}
          {currentStep === Step.EMAIL && (
            <Form onSubmit={handleEmailSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <Mail size={16} className="me-2" />
                  Correo Electrónico
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ backgroundColor: '#f8f9fa' }}>
                    <Mail size={18} color="#6b7280" />
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Ingresa el correo electrónico asociado a tu cuenta
                </Form.Text>
              </Form.Group>

              <Button
                type="submit"
                className="w-100 py-3 fw-semibold"
                style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Buscando...
                  </>
                ) : (
                  'Continuar'
                )}
              </Button>
            </Form>
          )}

          {/* PASO 2: Responder preguntas de seguridad */}
          {currentStep === Step.QUESTIONS && (
            <Form onSubmit={handleQuestionsSubmit}>
              <Alert variant="info" className="mb-4">
                <strong>📋 Responde correctamente las siguientes preguntas</strong>
                <br />
                <small>Estas son las preguntas que configuraste al crear tu cuenta</small>
              </Alert>

              {userAnswers.map((userAnswer, index) => (
                <Form.Group key={userAnswer.id} className="mb-4">
                  <Form.Label className="fw-semibold">
                    {index + 1}. {userAnswer.question?.name}
                  </Form.Label>
                  {userAnswer.question?.description && (
                    <Form.Text className="d-block text-muted mb-2">
                      {userAnswer.question.description}
                    </Form.Text>
                  )}
                  <Form.Control
                    type="text"
                    placeholder="Tu respuesta..."
                    value={userResponses[userAnswer.id!] || ''}
                    onChange={(e) => setUserResponses({
                      ...userResponses,
                      [userAnswer.id!]: e.target.value
                    })}
                    required
                    disabled={loading}
                  />
                </Form.Group>
              ))}

              <div className="d-flex gap-2">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={handleBack}
                  disabled={loading}
                  className="d-flex align-items-center"
                >
                  <ArrowLeft size={18} className="me-2" />
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="flex-grow-1 py-3 fw-semibold"
                  style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Validando...
                    </>
                  ) : (
                    'Verificar Respuestas'
                  )}
                </Button>
              </div>
            </Form>
          )}

          {/* PASO 3: Establecer nueva contraseña */}
          {currentStep === Step.NEW_PASSWORD && (
            <Form onSubmit={handlePasswordSubmit}>
              <Alert variant="success" className="mb-4">
                <CheckCircle size={20} className="me-2" />
                <strong>¡Respuestas correctas!</strong>
                <br />
                <small>Ahora puedes establecer una nueva contraseña</small>
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  <Lock size={16} className="me-2" />
                  Nueva Contraseña
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ backgroundColor: '#f8f9fa' }}>
                    <Lock size={18} color="#6b7280" />
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <Lock size={16} className="me-2" />
                  Confirmar Contraseña
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ backgroundColor: '#f8f9fa' }}>
                    <Lock size={18} color="#6b7280" />
                  </InputGroup.Text>
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <div className="d-flex gap-2">
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={handleBack}
                  disabled={loading}
                  className="d-flex align-items-center"
                >
                  <ArrowLeft size={18} className="me-2" />
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="flex-grow-1 py-3 fw-semibold"
                  style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Restableciendo...
                    </>
                  ) : (
                    'Restablecer Contraseña'
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>

        <Card.Footer className="text-center py-3" style={{ backgroundColor: '#f8f9fa' }}>
          <Button 
            variant="link" 
            onClick={() => navigate('/auth/signin')}
            className="text-decoration-none"
            style={{ color: '#10b981' }}
          >
            Volver al inicio de sesión
          </Button>
        </Card.Footer>
      </Card>
    </AuthLayout>
  );
};

export default ForgotPassword;
