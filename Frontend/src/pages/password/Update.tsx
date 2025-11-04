import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Form, Button } from 'react-bootstrap';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import Swal from 'sweetalert2';
import { passwordService } from '../../services/Password/passwordService';
import { updatePassword as firebaseUpdatePassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { userService } from '../../services/userService';

const formatDateToInput = (value: string | null) => {
  if (!value) return '';
  // backend: 2025-10-31 14:30:00 -> input: 2025-10-31T14:30
  const s = value.replace(' ', 'T');
  // remove seconds if present
  return s.slice(0, 16);
};

const formatDateToBackend = (datetimeLocal: string) => {
  if (!datetimeLocal) return '';
  return datetimeLocal.replace('T', ' ') + ':00';
};

const UpdatePassword: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [content, setContent] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [userId, setUserId] = useState<number | null>(null); // 🔑 Guardamos el user_id para actualizar Firebase
  const [userEmail, setUserEmail] = useState<string | null>(null); // 📧 Email del usuario asociado

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (!id) return;
      const data = await passwordService.getPasswordById(Number(id));
      if (data) {
        setStartAt(formatDateToInput(data.startAt));
        setEndAt(formatDateToInput(data.endAt));
        setUserId(data.user_id); // 🔑 Guardar el user_id
        
        // 📧 Obtener email del usuario desde el backend
        if (data.user_id) {
          try {
            const allUsers = await userService.getUsers();
            const user = allUsers.find((u: any) => u.id === data.user_id);
            if (user) {
              setUserEmail(user.email);
              console.log('📧 Usuario asociado a la contraseña:', user.email);
            }
          } catch (err) {
            console.error('Error obteniendo usuario:', err);
          }
        }
        // don't prefill content because it's hashed; let user enter new if they want
      } else {
        setError('Registro no encontrado');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleBack = () => navigate('/passwords/list');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload: any = {};
      if (content) payload.content = content;
      if (startAt) payload.startAt = formatDateToBackend(startAt);
      if (endAt) payload.endAt = formatDateToBackend(endAt);

      // 📝 PASO 1: Actualizar contraseña en el BACKEND (Flask)
      console.log('🔄 Actualizando contraseña en backend...');
      const updated = await passwordService.updatePassword(Number(id), payload);
      if (!updated) throw new Error('No se pudo actualizar en backend');

      // 🔥 PASO 2: Si se cambió la contraseña Y el usuario actual es el dueño, actualizar en FIREBASE
      if (content && userEmail) {
        const currentUser = auth.currentUser;
        
        // ✅ Verificar si el usuario actual es el dueño de esta contraseña
        if (currentUser && currentUser.email === userEmail) {
          console.log('🔥 Actualizando contraseña en Firebase Authentication...');
          console.log('   Usuario actual:', currentUser.email);
          console.log('   Nueva contraseña:', content.substring(0, 3) + '***');
          
          try {
            // 🔐 Actualizar contraseña en Firebase (solo funciona para el usuario autenticado actual)
            await firebaseUpdatePassword(currentUser, content);
            console.log('✅ Contraseña actualizada en Firebase exitosamente');
            
            Swal.fire({ 
              title: 'Actualizado', 
              html: '✅ Contraseña actualizada en:<br/>• Base de datos Flask<br/>• Firebase Authentication',
              icon: 'success', 
              timer: 2000, 
              showConfirmButton: false 
            });
          } catch (firebaseErr: any) {
            console.error('❌ Error actualizando Firebase:', firebaseErr);
            
            // 🔄 Si el error es de re-autenticación, mostrar mensaje al usuario
            if (firebaseErr.code === 'auth/requires-recent-login') {
              Swal.fire({ 
                title: 'Advertencia', 
                html: '⚠️ La contraseña se actualizó en la base de datos, pero Firebase requiere que vuelvas a iniciar sesión para actualizar tu contraseña de autenticación.<br/><br/>Por favor, cierra sesión e inicia sesión nuevamente con tu nueva contraseña.',
                icon: 'warning',
                confirmButtonColor: '#10b981'
              });
            } else {
              Swal.fire({ 
                title: 'Parcialmente actualizado', 
                html: '⚠️ La contraseña se actualizó en la base de datos, pero hubo un problema al sincronizar con Firebase.<br/><br/>Error: ' + firebaseErr.message,
                icon: 'warning',
                confirmButtonColor: '#10b981'
              });
            }
          }
        } else {
          // ℹ️ Usuario actualizando contraseña de otro usuario (solo backend)
          console.log('ℹ️ Actualizando contraseña de otro usuario (solo backend)');
          console.log('   Usuario actual:', currentUser?.email || 'No autenticado');
          console.log('   Dueño de la contraseña:', userEmail);
          
          Swal.fire({ 
            title: 'Actualizado', 
            html: 'ℹ️ Contraseña actualizada en la base de datos.<br/><br/><small>Nota: La contraseña de Firebase solo se actualiza cuando el usuario modifica su propia contraseña.</small>',
            icon: 'info',
            timer: 3000,
            showConfirmButton: true,
            confirmButtonColor: '#10b981'
          });
        }
      } else {
        // Solo se actualizaron fechas (startAt/endAt), no la contraseña
        Swal.fire({ title: 'Actualizado', icon: 'success', timer: 1000, showConfirmButton: false });
      }

      setTimeout(() => navigate('/passwords/list'), 1500);
    } catch (err) {
      console.error('❌ Error general:', err);
      setError('Error al actualizar la contraseña');
      Swal.fire({ title: 'Error', text: 'No se pudo actualizar', icon: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <Breadcrumb pageName="Actualizar Contraseña" />
          <div className="d-flex align-items-center gap-3 mt-3">
            <button onClick={handleBack} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2" disabled={saving}>
              <ArrowLeft size={16} />
              Volver
            </button>
            <div>
              <h2 className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>Actualizar Contraseña</h2>
              <p className="text-muted mb-0">Modifique los campos que desea actualizar</p>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="shadow-sm mb-4">
          <Alert.Heading as="h6">Error</Alert.Heading>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-4"><Spinner /></div>
      ) : (
        <Row>
          <Col lg={8} xl={6}>
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white border-bottom py-3">
                <h5 className="mb-0 fw-semibold">Actualizar contraseña</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nueva Contraseña (dejar vacío si no cambia)</Form.Label>
                    <Form.Control type="password" value={content} onChange={(e) => setContent(e.target.value)} />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Inicio (startAt)</Form.Label>
                    <Form.Control type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Fin (endAt)</Form.Label>
                    <Form.Control type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button variant="success" type="submit" disabled={saving}>Guardar</Button>
                    <Button variant="outline-secondary" onClick={handleBack} disabled={saving}>Cancelar</Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default UpdatePassword;
