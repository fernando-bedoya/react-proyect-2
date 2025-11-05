/**
 * PasswordView - Gestión del Historial de Contraseñas
 * 
 * =====================================================
 * ARQUITECTURA DEL SISTEMA DE CONTRASEÑAS
 * =====================================================
 * 
 * Este sistema implementa un modelo HÍBRIDO:
 * 
 * 1. FIREBASE AUTH (Autenticación Real)
 *    - Sistema de login principal
 *    - Valida credenciales durante el inicio de sesión
 *    - Genera tokens JWT para las sesiones
 *    - Usuario ingresa email/password → Firebase valida → Token
 * 
 * 2. BACKEND (Historial y Auditoría)
 *    - Guarda historial completo de contraseñas
 *    - Tabla: passwords (user_id, content, startAt, endAt)
 *    - Contraseñas hasheadas con werkzeug
 *    - Validez temporal (startAt/endAt) para expiración
 *    - NO se usa para autenticación, solo auditoría
 * 
 * =====================================================
 * FLUJO DE TRABAJO
 * =====================================================
 * 
 * REGISTRO DE USUARIO (SignUp.tsx):
 * 1. Usuario crea cuenta con email/password
 * 2. Firebase Auth crea usuario
 * 3. Backend guarda datos del usuario (User table)
 * 4. Backend guarda contraseña inicial en historial (passwords table)
 * 
 * CAMBIO DE CONTRASEÑA (Este componente):
 * 1. Admin crea nueva contraseña para un usuario
 * 2. Contraseña se guarda en backend (historial/auditoría)
 * 3. Sistema pregunta si sincronizar con Firebase Auth
 * 4. Si sí: actualiza Firebase Auth (afecta login)
 * 5. Si no: solo queda en backend (auditoría)
 * 
 * LOGIN (securityService.ts):
 * 1. Usuario ingresa email/password
 * 2. Firebase Auth valida credenciales
 * 3. Si válido: Firebase devuelve token JWT
 * 4. Token se guarda en localStorage
 * 5. Backend NO participa en la validación
 * 
 * =====================================================
 * VENTAJAS DE ESTE MODELO
 * =====================================================
 * 
 * ✓ Firebase maneja toda la seguridad de autenticación
 * ✓ Backend mantiene historial completo (auditoría)
 * ✓ Se puede rastrear cambios de contraseña
 * ✓ Validez temporal con startAt/endAt
 * ✓ No se exponen contraseñas en el proceso de login
 * ✓ Sincronización opcional (flexibilidad)
 * 
 * =====================================================
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert, Badge, Form } from 'react-bootstrap';
import { Plus, RefreshCw, Key } from 'lucide-react';
import GenericTable from '../../components/GenericTable';
import GenericModal from '../../components/GenericModal';
import GenericForm, { FieldConfig } from '../../components/GenericForm';
import ThemeSelector from '../../components/ThemeSelector';
import axios from 'axios';
import userService from '../../services/userService';
import type { User } from '../../models/User';
import Swal from 'sweetalert2';

const API_URL = `${(import.meta as any).env?.VITE_API_URL || ''}/passwords/`;

interface Password {
  id: number;
  user_id: number;
  content?: string;
  startAt: string;
  endAt: string;
  created_at?: string;
}

const formatDateToBackend = (datetimeLocal: string) => {
  const d = new Date(datetimeLocal);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
};

const formatDateToLocal = (utcDate: string): string => {
  const d = new Date(utcDate);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const PasswordView: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const userIdParam = searchParams.get('userId');
  
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    userIdParam ? Number(userIdParam) : null
  );
  const [users, setUsers] = useState<User[]>([]);
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(null);
  const [selectedUserForCreate, setSelectedUserForCreate] = useState<number | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await userService.getUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    loadPasswords();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  const loadPasswords = async () => {
    setLoading(true);
    setError(null);
    try {
      let data: Password[];
      if (selectedUserId) {
        // Llamada al endpoint de filtrado por usuario: /api/passwords/user/{userId}
        const response = await axios.get(`${API_URL}user/${selectedUserId}`);
        data = Array.isArray(response.data) ? response.data : [response.data];
      } else {
        // Llamada al endpoint de todas las contraseñas: /api/passwords/
        const response = await axios.get(API_URL);
        data = response.data;
      }
      setPasswords(data);
    } catch (err: any) {
      console.error('Error al cargar contraseñas:', err);
      setError(err.message || 'Error al cargar las contraseñas');
      setPasswords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserFilterChange = (userId: string) => {
    if (userId) {
      setSelectedUserId(Number(userId));
      setSearchParams({ userId });
    } else {
      setSelectedUserId(null);
      setSearchParams({});
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setSelectedPassword(null);
    if (selectedUserId) {
      setSelectedUserForCreate(selectedUserId);
    } else {
      setSelectedUserForCreate(null);
    }
    setShowModal(true);
  };

  const handleEdit = (password: Password) => {
    setModalMode('edit');
    setSelectedPassword(password);
    setShowModal(true);
  };

  const handleDelete = async (password: Password) => {
    const result = await Swal.fire({
      title: '¿Eliminar contraseña?',
      text: `Contraseña ID: ${password.id}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        // Llamada al endpoint de eliminación: DELETE /api/passwords/{id}
        await axios.delete(`${API_URL}${password.id}`);
        await Swal.fire({
          icon: 'success',
          title: 'Eliminada',
          text: 'Contraseña eliminada exitosamente',
          confirmButtonColor: '#10b981',
          timer: 2000
        });
        loadPasswords();
      } catch (err: any) {
        console.error('Error al eliminar:', err);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.message || 'Error al eliminar la contraseña',
          confirmButtonColor: '#dc3545'
        });
      }
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const start = new Date(formData.startAt);
      const end = new Date(formData.endAt);
      if (end <= start) {
        await Swal.fire({
          icon: 'error',
          title: 'Error de Validación',
          text: 'La fecha de fin debe ser posterior a la fecha de inicio.',
          confirmButtonColor: '#10b981'
        });
        return;
      }

      const payload = {
        ...formData,
        startAt: formatDateToBackend(formData.startAt),
        endAt: formatDateToBackend(formData.endAt)
      };

      if (modalMode === 'create') {
        // ==========================================
        // FLUJO DE CREACIÓN DE CONTRASEÑA
        // ==========================================
        // 1. Guardar en el historial del BACKEND (auditoría)
        // 2. Intentar sincronizar con FIREBASE AUTH (autenticación)
        //
        // Sistema Híbrido:
        // - Firebase Auth: Sistema de autenticación real (login)
        // - Backend: Historial de contraseñas para auditoría
        // ==========================================
        
        // PASO 1: Guardar contraseña en el historial del backend
        console.log('💾 Guardando contraseña en historial del backend...');
        await axios.post(`${API_URL}user/${formData.user_id}`, payload);
        console.log('✅ Contraseña guardada en backend (auditoría)');
        
        // PASO 2: Intentar sincronizar con Firebase Auth
        try {
          const { auth } = await import('../../firebase');
          const { updatePassword: firebaseUpdatePassword, EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');
          const currentUser = auth.currentUser;
          
          if (currentUser && formData.content) {
            console.log('🔥 Intentando sincronizar con Firebase Auth...');
            // Firebase requiere reautenticación para cambiar contraseña
            // Solicitar la contraseña actual al usuario
            const { value: currentPassword } = await Swal.fire({
              title: 'Sincronización Firebase',
              html: `
                <div class="text-start">
                  <p>La contraseña se guardó exitosamente en el <strong>historial del backend</strong>.</p>
                  <hr/>
                  <p class="text-muted mb-0">
                    <small>
                      ¿Deseas también actualizar la contraseña de <strong>Firebase Auth</strong> (login)?<br/>
                      Ingresa tu contraseña actual para sincronizar:
                    </small>
                  </p>
                </div>
              `,
              input: 'password',
              inputPlaceholder: 'Contraseña actual',
              inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off'
              },
              showCancelButton: true,
              confirmButtonText: 'Sincronizar',
              cancelButtonText: 'Solo Backend',
              confirmButtonColor: '#10b981',
              cancelButtonColor: '#6c757d'
            });

            if (currentPassword) {
              try {
                // Reautenticar con la contraseña actual
                const credential = EmailAuthProvider.credential(
                  currentUser.email!,
                  currentPassword
                );
                await reauthenticateWithCredential(currentUser, credential);
                
                // Ahora actualizar la contraseña en Firebase
                await firebaseUpdatePassword(currentUser, formData.content);
                
                console.log('✅ Contraseña sincronizada con Firebase Auth');
                await Swal.fire({
                  icon: 'success',
                  title: '✅ Sincronización Completa',
                  html: `
                    <div class="text-start">
                      <p>✓ Contraseña guardada en <strong>backend</strong> (historial/auditoría)</p>
                      <p>✓ Contraseña actualizada en <strong>Firebase Auth</strong> (login)</p>
                    </div>
                  `,
                  confirmButtonColor: '#10b981',
                  timer: 3000
                });
              } catch (reAuthErr: any) {
                console.error('❌ Error de reautenticación:', reAuthErr);
                await Swal.fire({
                  icon: 'warning',
                  title: '⚠️ Sincronización Parcial',
                  html: `
                    <div class="text-start">
                      <p>✓ Contraseña guardada en <strong>backend</strong> (historial/auditoría)</p>
                      <p>✗ <strong>No se pudo sincronizar con Firebase Auth</strong></p>
                      <hr/>
                      <small class="text-muted">Verifica tu contraseña actual o intenta nuevamente.</small>
                    </div>
                  `,
                  confirmButtonColor: '#f59e0b'
                });
              }
            } else {
              // Usuario canceló la sincronización
              console.log('ℹ️ Usuario omitió sincronización con Firebase');
              await Swal.fire({
                icon: 'info',
                title: 'Contraseña Guardada',
                html: `
                  <div class="text-start">
                    <p>✓ Contraseña guardada en <strong>backend</strong> (historial/auditoría)</p>
                    <p class="text-muted mb-0"><small>No se sincronizó con Firebase Auth</small></p>
                  </div>
                `,
                confirmButtonColor: '#10b981',
                timer: 2500
              });
            }
          } else {
            // No hay usuario autenticado actualmente
            console.log('ℹ️ No hay usuario autenticado en Firebase');
            await Swal.fire({
              icon: 'success',
              title: 'Contraseña Guardada',
              html: `
                <div class="text-start">
                  <p>✓ Contraseña guardada en <strong>backend</strong> (historial/auditoría)</p>
                </div>
              `,
              confirmButtonColor: '#10b981',
              timer: 2000
            });
          }
        } catch (firebaseErr: any) {
          console.error('❌ Error Firebase:', firebaseErr);
          await Swal.fire({
            icon: 'warning',
            title: '⚠️ Sincronización Parcial',
            html: `
              <div class="text-start">
                <p>✓ Contraseña guardada en <strong>backend</strong> (historial/auditoría)</p>
                <p>✗ <strong>No se pudo sincronizar con Firebase Auth</strong></p>
                <hr/>
                <small class="text-muted">La contraseña solo está disponible en el backend como auditoría.</small>
              </div>
            `,
            confirmButtonColor: '#f59e0b'
          });
        }
      } else {
        // Llamada al endpoint de actualización: PUT /api/passwords/{id}
        await axios.put(`${API_URL}${selectedPassword?.id}`, payload);
        await Swal.fire({
          icon: 'success',
          title: 'Actualizada',
          text: 'Contraseña actualizada exitosamente',
          confirmButtonColor: '#10b981',
          timer: 2000
        });
      }

      setShowModal(false);
      loadPasswords();
    } catch (err: any) {
      console.error('Error al guardar:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Error al guardar la contraseña',
        confirmButtonColor: '#dc3545'
      });
    }
  };

  const columns = ['id', 'user_email', 'startAt', 'endAt', 'created_at'];
  
  const columnLabels = {
    id: 'ID',
    user_email: 'Usuario',
    startAt: 'Inicio',
    endAt: 'Fin',
    created_at: 'Fecha Creación'
  };

  // Formatear datos para la tabla
  const tableData = passwords.map(pwd => {
    const user = users.find(u => u.id === pwd.user_id);
    return {
      ...pwd,
      user_email: user ? `${user.name} (${user.email})` : `Usuario ${pwd.user_id}`,
      startAt: new Date(pwd.startAt).toLocaleString('es-ES'),
      endAt: new Date(pwd.endAt).toLocaleString('es-ES'),
      created_at: pwd.created_at ? new Date(pwd.created_at).toLocaleString('es-ES') : '-'
    };
  });

  const tableActions = [
    {
      name: 'edit',
      label: 'Editar',
      variant: 'warning' as const,
      icon: 'edit' as const
    },
    {
      name: 'delete',
      label: 'Eliminar',
      variant: 'outline-danger' as const,
      icon: 'delete' as const
    }
  ];

  const handleAction = (actionName: string, item: Record<string, any>) => {
    const password = passwords.find(p => p.id === item.id);
    if (!password) return;

    switch (actionName) {
      case 'edit':
        handleEdit(password);
        break;
      case 'delete':
        handleDelete(password);
        break;
    }
  };

  const formFields: FieldConfig[] = modalMode === 'create' && !selectedUserForCreate
    ? []
    : [
        {
          name: 'user_id',
          label: 'Usuario',
          type: 'select',
          required: true,
          disabled: modalMode === 'edit' || !!selectedUserForCreate,
          options: users.map(u => ({ value: u.id?.toString() || '', label: `${u.name} (${u.email})` })),
          defaultValue: selectedUserForCreate?.toString() || selectedPassword?.user_id?.toString() || ''
        },
        {
          name: 'content',
          label: 'Contraseña',
          type: 'password',
          required: modalMode === 'create',
          disabled: modalMode === 'edit'
        },
        {
          name: 'startAt',
          label: 'Fecha de Inicio',
          type: 'datetime-local',
          required: true,
          defaultValue: selectedPassword ? formatDateToLocal(selectedPassword.startAt) : ''
        },
        {
          name: 'endAt',
          label: 'Fecha de Fin',
          type: 'datetime-local',
          required: true,
          defaultValue: selectedPassword ? formatDateToLocal(selectedPassword.endAt) : ''
        }
      ];

  return (
    <>
      <ThemeSelector />
      <Container fluid className="p-4">
        <Row className="mb-4 align-items-center">
          <Col>
            <div className="d-flex align-items-center gap-2">
              <Key className="text-success" size={32} />
              <div>
                <h2 className="mb-0">Contraseñas Históricas</h2>
                <small className="text-muted">
                  {selectedUserId 
                    ? `Mostrando contraseñas de: ${users.find(u => u.id === selectedUserId)?.name || `Usuario ${selectedUserId}`}`
                    : 'Mostrando todas las contraseñas'}
                </small>
              </div>
            </div>
          </Col>
          <Col xs="auto">
            <div className="d-flex gap-2">
              <Button
                variant="outline-success"
                size="sm"
                onClick={loadPasswords}
                disabled={loading}
              >
                <RefreshCw size={16} />
                {loading ? ' Cargando...' : ' Recargar'}
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={handleCreate}
              >
                <Plus size={16} /> Nueva Contraseña
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Filtrar por Usuario</Form.Label>
              <Form.Select
                value={selectedUserId || ''}
                onChange={(e) => handleUserFilterChange(e.target.value)}
                className="border-success"
              >
                <option value="">Todos los usuarios</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6} className="d-flex align-items-end">
            <Badge bg="info" className="p-2">
              Total: {passwords.length} contraseña{passwords.length !== 1 ? 's' : ''}
            </Badge>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
            <p className="mt-2 text-muted">Cargando contraseñas...</p>
          </div>
        ) : (
          <GenericTable
            data={tableData}
            columns={columns}
            columnLabels={columnLabels}
            actions={tableActions}
            onAction={handleAction}
            emptyMessage={selectedUserId ? 'Este usuario no tiene contraseñas registradas' : 'No hay contraseñas registradas'}
          />
        )}

        <GenericModal
          show={showModal}
          onHide={() => setShowModal(false)}
          title={modalMode === 'create' ? 'Nueva Contraseña' : 'Editar Contraseña'}
          size="lg"
        >
          {modalMode === 'create' && !selectedUserForCreate ? (
            <div>
              <p className="text-muted mb-3">
                Primero, selecciona el usuario para quien deseas crear la contraseña:
              </p>
              <Form.Group>
                <Form.Label>Usuario</Form.Label>
                <Form.Select
                  onChange={(e) => setSelectedUserForCreate(Number(e.target.value))}
                  className="border-success"
                  required
                >
                  <option value="">-- Selecciona un usuario --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          ) : (
            <GenericForm
              fields={formFields}
              onSubmit={handleSubmit}
              onCancel={() => setShowModal(false)}
              submitLabel={modalMode === 'create' ? 'Crear' : 'Actualizar'}
            />
          )}
        </GenericModal>
      </Container>
    </>
  );
};

export default PasswordView;
