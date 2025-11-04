import React, { useState } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Form, Button } from 'react-bootstrap';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Breadcrumb from '../../components/Breadcrumb';
import { passwordService } from '../../services/Password/passwordService';
import { userService } from '../../services/userService';
import { updatePassword as firebaseUpdatePassword } from 'firebase/auth';
import { auth } from '../../firebase';

const formatDateToBackend = (datetimeLocal: string) => {
  // Convert local datetime-local input (YYYY-MM-DDTHH:MM) to UTC string
  // expected by backend: 'YYYY-MM-DD HH:MM:SS' (UTC)
  if (!datetimeLocal) return '';
  const d = new Date(datetimeLocal);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hour = pad(d.getUTCHours());
  const minute = pad(d.getUTCMinutes());
  const second = pad(d.getUTCSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

const CreatePassword: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<number | ''>('');
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const u = params.get('userId');
    if (u) setUserId(Number(u));
    // Load users for the dropdown
    (async () => {
      setLoadingUsers(true);
      try {
        const list = await userService.getUsers();
        setUsers(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Error cargando usuarios:', err);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, [location.search]);

  const [content, setContent] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');

  const handleBack = () => navigate('/passwords/list');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones frontend
    if (!userId) {
      setError('Debes seleccionar un usuario');
      return;
    }

    if (!content) {
      setError('La contraseña es obligatoria');
      return;
    }

    if (!startAt) {
      setError('La fecha de inicio es obligatoria');
      return;
    }

    if (!endAt) {
      setError('La fecha de fin es obligatoria (requerido por el backend)');
      return;
    }

    // Validar que endAt > startAt
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (end <= start) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        content,
        startAt: formatDateToBackend(startAt),
        endAt: formatDateToBackend(endAt),
      };

      console.log('Enviando payload:', payload);

      // 📝 PASO 1: Crear contraseña en el BACKEND (Flask)
      const created = await passwordService.createPassword(Number(userId), payload as any);
      
      if (!created) {
        throw new Error('No se creó la contraseña');
      }

      // 🔥 PASO 2: Si el usuario actual es el dueño de esta contraseña, actualizar en FIREBASE
      const currentUser = auth.currentUser;
      const selectedUser = users.find((u: any) => u.id === userId);
      
      if (currentUser && selectedUser && currentUser.email === selectedUser.email) {
        console.log('🔥 Actualizando contraseña en Firebase Authentication...');
        console.log('   Usuario actual:', currentUser.email);
        console.log('   Nueva contraseña:', content.substring(0, 3) + '***');
        
        try {
          // 🔐 Actualizar contraseña en Firebase (solo funciona para el usuario autenticado actual)
          await firebaseUpdatePassword(currentUser, content);
          console.log('✅ Contraseña actualizada en Firebase exitosamente');
          
          Swal.fire({ 
            title: 'Completado', 
            html: '✅ Contraseña creada en:<br/>• Base de datos Flask<br/>• Firebase Authentication',
            icon: 'success', 
            timer: 2000, 
            showConfirmButton: false 
          });
        } catch (firebaseErr: any) {
          console.error('❌ Error actualizando Firebase:', firebaseErr);
          
          if (firebaseErr.code === 'auth/requires-recent-login') {
            Swal.fire({ 
              title: 'Advertencia', 
              html: '⚠️ La contraseña se creó en la base de datos, pero Firebase requiere que vuelvas a iniciar sesión para actualizar tu contraseña de autenticación.<br/><br/>Por favor, cierra sesión e inicia sesión nuevamente con tu nueva contraseña.',
              icon: 'warning',
              confirmButtonColor: '#10b981'
            });
          } else {
            Swal.fire({ 
              title: 'Parcialmente creado', 
              html: '⚠️ La contraseña se creó en la base de datos, pero hubo un problema al sincronizar con Firebase.<br/><br/>Error: ' + firebaseErr.message,
              icon: 'warning',
              confirmButtonColor: '#10b981'
            });
          }
        }
      } else {
        // ℹ️ Creando contraseña para otro usuario (solo backend)
        console.log('ℹ️ Creando contraseña para otro usuario (solo backend)');
        
        Swal.fire({ 
          title: 'Completado', 
          html: 'ℹ️ Contraseña creada en la base de datos.<br/><br/><small>Nota: La contraseña de Firebase solo se actualiza cuando el usuario modifica su propia contraseña.</small>',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false 
        });
      }
      
      setTimeout(() => navigate('/passwords/list'), 1500);
    } catch (err: any) {
      console.error('Error completo:', err);
      
      let errorMessage = 'Error desconocido al crear la contraseña';
      
      // Analizar el tipo de error
      if (err?.response?.status === 500) {
        errorMessage = 'Error interno del servidor. Posible problema: el backend intenta actualizar un campo "password" que no existe en el modelo User.';
      } else if (err?.response?.status === 400) {
        errorMessage = err?.response?.data?.error || 'Datos inválidos';
      } else if (err?.response?.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      Swal.fire({ 
        title: 'Error', 
        html: `<div style="text-align: left;">
          <p><strong>No se pudo crear la contraseña</strong></p>
          <p style="font-size: 0.9em; color: #666;">${errorMessage}</p>
          ${err?.response?.status === 500 ? 
            '<p style="font-size: 0.85em; color: #d32f2f; margin-top: 10px;"><strong>⚠️ Nota técnica:</strong> El backend tiene un bug en password_controller.py línea 64: intenta actualizar user.password pero ese campo no existe en el modelo User.</p>' 
            : ''}
        </div>`,
        icon: 'error', 
        confirmButtonColor: '#10b981',
        width: 600
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Breadcrumb pageName="Crear Contraseña" />
          <div className="d-flex align-items-center gap-3 mt-3">
            <button 
              onClick={handleBack} 
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" 
              disabled={loading}
            >
              <ArrowLeft size={16} />
              Volver
            </button>
            <div>
              <h2 className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>
                Crear Nueva Contraseña
              </h2>
              <p className="text-muted mb-0">Agrega una nueva contraseña para un usuario</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Alerta de advertencia sobre limitaciones del backend */}
      <Row className="mb-3">
        <Col lg={8} xl={6}>
          <Alert variant="warning" className="shadow-sm d-flex align-items-start gap-2">
            <AlertTriangle size={20} className="mt-1" />
            <div>
              <strong>Nota importante:</strong> El backend requiere que ambas fechas (inicio y fin) 
              sean obligatorias. Asegúrate de completar todos los campos.
            </div>
          </Alert>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="shadow-sm mb-4">
          <Alert.Heading as="h6">Error</Alert.Heading>
          {error}
        </Alert>
      )}

      {loading && (
        <Alert variant="info" className="shadow-sm mb-4">
          <div className="d-flex align-items-center gap-3">
            <Spinner animation="border" size="sm" variant="info" />
            <div>
              <strong>Procesando...</strong> Creando contraseña
            </div>
          </div>
        </Alert>
      )}

      <Row>
        <Col lg={8} xl={6}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 fw-semibold">Información de la Contraseña</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Usuario <span className="text-danger">*</span>
                  </Form.Label>
                  {loadingUsers ? (
                    <div className="d-flex align-items-center gap-2">
                      <Spinner animation="border" size="sm" />
                      <small className="text-muted">Cargando usuarios...</small>
                    </div>
                  ) : (
                    <Form.Select 
                      value={userId as any}
                      onChange={(e) => setUserId(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={Boolean(userId)}
                      required
                    >
                      <option value="">-- Selecciona un usuario --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.id} - {u.name} {u.email ? `(${u.email})` : ''}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                  {userId && (
                    <Form.Text className="text-muted">
                      ID provisto por la vista de usuario
                    </Form.Text>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Contraseña <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control 
                    type="password" 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)}
                    required
                    placeholder="Ingresa la contraseña"
                  />
                  <Form.Text className="text-muted">
                    Será almacenada de forma segura (hasheada)
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Fecha de Inicio (startAt) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control 
                    type="datetime-local" 
                    value={startAt} 
                    onChange={(e) => setStartAt(e.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">
                    Fecha y hora desde la cual esta contraseña es válida
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Fecha de Fin (endAt) <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control 
                    type="datetime-local" 
                    value={endAt} 
                    onChange={(e) => setEndAt(e.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">
                    Fecha y hora hasta la cual esta contraseña es válida (requerido por el backend)
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button variant="success" type="submit" disabled={loading}>
                    {loading ? 'Creando...' : 'Crear Contraseña'}
                  </Button>
                  <Button variant="outline-secondary" onClick={handleBack} disabled={loading}>
                    Cancelar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreatePassword;