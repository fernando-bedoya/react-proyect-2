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
        // Llamada al endpoint de creación: POST /api/passwords/user/{user_id}
        // El backend requiere el user_id en la URL, no en el body
        await axios.post(`${API_URL}user/${formData.user_id}`, payload);
        
        try {
          const { auth } = await import('../../firebase');
          const { updatePassword: firebaseUpdatePassword, EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');
          const currentUser = auth.currentUser;
          
          if (currentUser && formData.content) {
            // Firebase requiere reautenticación para cambiar contraseña
            // Solicitar la contraseña actual al usuario
            const { value: currentPassword } = await Swal.fire({
              title: 'Sincronización Firebase',
              text: 'Para sincronizar con Firebase Auth, ingresa tu contraseña actual:',
              input: 'password',
              inputPlaceholder: 'Contraseña actual',
              inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off'
              },
              showCancelButton: true,
              confirmButtonText: 'Sincronizar',
              cancelButtonText: 'Omitir',
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
                
                // Ahora actualizar la contraseña
                await firebaseUpdatePassword(currentUser, formData.content);
                
                await Swal.fire({
                  icon: 'success',
                  title: 'Contraseña Sincronizada',
                  text: 'La contraseña se guardó y sincronizó con Firebase Auth.',
                  confirmButtonColor: '#10b981',
                  timer: 3000
                });
              } catch (reAuthErr: any) {
                console.error('Error de reautenticación:', reAuthErr);
                await Swal.fire({
                  icon: 'warning',
                  title: 'Contraseña Guardada (Sin Sincronización)',
                  html: '<p>La contraseña se guardó en la base de datos, pero <strong>no se pudo sincronizar con Firebase Auth</strong>.</p><small>Verifica tu contraseña actual.</small>',
                  confirmButtonColor: '#10b981'
                });
              }
            } else {
              // Usuario canceló la sincronización
              await Swal.fire({
                icon: 'success',
                title: 'Contraseña Creada',
                text: 'Contraseña guardada exitosamente (sin sincronización Firebase)',
                confirmButtonColor: '#10b981',
                timer: 2000
              });
            }
          } else {
            await Swal.fire({
              icon: 'success',
              title: 'Contraseña Creada',
              text: 'Contraseña guardada exitosamente',
              confirmButtonColor: '#10b981',
              timer: 2000
            });
          }
        } catch (firebaseErr: any) {
          console.error('Error Firebase:', firebaseErr);
          await Swal.fire({
            icon: 'warning',
            title: 'Contraseña Guardada (Sin Sincronización)',
            html: '<p>La contraseña se guardó en la base de datos, pero <strong>no se pudo sincronizar con Firebase Auth</strong>.</p>',
            confirmButtonColor: '#10b981'
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
